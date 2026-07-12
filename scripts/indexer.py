"""
Code Indexer — Scans source files, chunks them, embeds via Ollama, stores in SQLite.

Usage:
    python scripts/indexer.py                     # index all .py/.ts/.tsx/.jsx in frontend/src & backend
    python scripts/indexer.py --path backend      # index a single directory
    python scripts/indexer.py --chunk-size 800    # custom chunk size (default 500)
    python scripts/indexer.py --reset             # drop and recreate the SQLite DB
"""

from __future__ import annotations

import argparse
import ast
import json
import sqlite3
import sys
import httpx
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass
from pathlib import Path

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

OLLAMA_URL = "http://localhost:11434/api/embeddings"
OLLAMA_MODEL = "all-minilm"

DEFAULT_CHUNK_SIZE = 500
EXTENSIONS = {".py", ".ts", ".tsx", ".jsx"}
MAX_CONCURRENT_REQUESTS = 10  # Ollama-ya eyni anda neçə request getsin


# ---------------------------------------------------------------------------
# Data classes
# ---------------------------------------------------------------------------

@dataclass
class Chunk:
    """A single code chunk ready for embedding."""
    snippet: str
    filepath: str
    start_line: int
    vector: list[float] | None = None


# ---------------------------------------------------------------------------
# File discovery
# ---------------------------------------------------------------------------

def find_code_files(base_dir: Path, extensions: set[str] | None = None) -> list[Path]:
    """Recursively collect source files under *base_dir*."""
    if extensions is None:
        extensions = EXTENSIONS
        
    exclude_dirs = {"node_modules", "venv", ".venv", ".git", "dist", "build"}
    
    files = []
    for p in base_dir.rglob("*"):
        if p.is_file() and p.suffix in extensions:
            if not any(ex in p.parts for ex in exclude_dirs):
                files.append(p)
                
    return sorted(files)


# ---------------------------------------------------------------------------
# Code chunking
# ---------------------------------------------------------------------------

def _safe_parse(source: str, filepath: Path) -> ast.AST | None:
    try:
        return ast.parse(source, filename=str(filepath))
    except (SyntaxError, UnicodeDecodeError):
        return None

def _truncate_at_word(text: str, max_len: int) -> str:
    if len(text) <= max_len:
        return text
    end = max(0, text.rfind(" ", 0, max_len))
    return text[:end]

def _walk_tree(node: ast.AST, filepath: Path, lines: list[str], max_len: int) -> list[Chunk]:
    chunks: list[Chunk] = []
    
    if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
        start_line = node.lineno - 1
        end_line = getattr(node, "end_lineno", len(lines))
        chunk_text = "".join(lines[start_line:end_line]).strip()
        
        if chunk_text:
            truncated = _truncate_at_word(chunk_text, max_len)
            chunks.append(Chunk(snippet=truncated, filepath=str(filepath), start_line=node.lineno))
            
        for child in ast.iter_child_nodes(node):
            if isinstance(child, (ast.FunctionDef, ast.AsyncFunctionDef)):
                chunks.extend(_walk_tree(child, filepath, lines, max_len))

    elif isinstance(node, ast.ClassDef):
        chunks.extend(_walk_class(node, filepath, lines, max_len))

    return chunks

def _walk_class(node: ast.ClassDef, filepath: Path, lines: list[str], max_len: int) -> list[Chunk]:
    chunks: list[Chunk] = []
    for child in ast.iter_child_nodes(node):
        if isinstance(child, (ast.FunctionDef, ast.AsyncFunctionDef)):
            start_line = child.lineno - 1
            end_line = getattr(child, "end_lineno", len(lines))
            chunk_text = "".join(lines[start_line:end_line]).strip()
            
            if chunk_text:
                truncated = _truncate_at_word(chunk_text, max_len)
                chunks.append(Chunk(snippet=truncated, filepath=str(filepath), start_line=child.lineno))
    return chunks

def _chunk_by_size(source: str, filepath: Path, max_len: int) -> list[Chunk]:
    lines = source.splitlines(keepends=True)
    chunks: list[Chunk] = []
    for i in range(0, len(lines), max_len):
        end = min(i + max_len, len(lines))
        chunk_text = "".join(lines[i:end]).strip()
        if chunk_text:
            chunks.append(Chunk(snippet=chunk_text, filepath=str(filepath), start_line=i + 1))
    return chunks

def chunk_code(filepath: Path, chunk_size: int) -> list[Chunk]:
    if not filepath.exists():
        return []

    try:
        with open(filepath, "r", encoding="utf-8") as f:
            source = f.read()
            lines = source.splitlines(keepends=True)
    except Exception:
        return []

    tree = _safe_parse(source, filepath)
    if not tree:
        return _chunk_by_size(source, filepath, chunk_size)

    chunks: list[Chunk] = []
    for child in ast.iter_child_nodes(tree):
        if isinstance(child, (ast.FunctionDef, ast.AsyncFunctionDef)):
            chunks.extend(_walk_tree(child, filepath, lines, chunk_size * 5))
        elif isinstance(child, ast.ClassDef):
            chunks.extend(_walk_class(child, filepath, lines, chunk_size * 5))

    if not chunks:
        return _chunk_by_size(source, filepath, chunk_size)

    return chunks


# ---------------------------------------------------------------------------
# Embedding generation
# ---------------------------------------------------------------------------

def fetch_embedding(chunk: Chunk, client: httpx.Client) -> Chunk:
    """Fetches embedding for a single chunk."""
    payload = {"model": OLLAMA_MODEL, "prompt": chunk.snippet.strip()}
    try:
        resp = client.post(OLLAMA_URL, json=payload, timeout=60.0)
        if resp.status_code < 400:
            data = resp.json()
            vec = data.get("embedding") or data.get("embeddings", [])
            if isinstance(vec, list) and len(vec) > 0:
                chunk.vector = vec
    except Exception as e:
        pass
    return chunk


# ---------------------------------------------------------------------------
# SQLite storage
# ---------------------------------------------------------------------------

DB_NAME = "vector_store.db"

def init_db(db_path: Path) -> None:
    db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(db_path), timeout=30.0)
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS code_chunks (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            filepath    TEXT    NOT NULL,
            snippet     TEXT    NOT NULL,
            vector      BLOB    NOT NULL,
            embedding_len INTEGER CHECK(embedding_len > 0),
            created_at  TEXT    DEFAULT (datetime('now','localtime'))
        )
    """)
    conn.commit()
    conn.close()

def save_chunks_concurrently(conn: sqlite3.Connection, chunks: list[Chunk]) -> int:
    """Fetches embeddings concurrently and saves to SQLite."""
    embedded_chunks = []
    
    with httpx.Client() as client:
        with ThreadPoolExecutor(max_workers=MAX_CONCURRENT_REQUESTS) as executor:
            futures = {executor.submit(fetch_embedding, c, client): c for c in chunks}
            for future in as_completed(futures):
                res_chunk = future.result()
                if res_chunk.vector:
                    embedded_chunks.append(res_chunk)

    if not embedded_chunks:
        return 0

    cur = conn.cursor()
    data_list = [
        (c.filepath, c.snippet, json.dumps(c.vector).encode("utf-8"), len(c.vector))
        for c in embedded_chunks
    ]
    cur.executemany(
        "INSERT INTO code_chunks (filepath, snippet, vector, embedding_len) VALUES (?, ?, ?, ?)",
        data_list,
    )
    conn.commit()
    return len(data_list)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(description="Index code files with Ollama embeddings.")
    parser.add_argument("--path", default=None, help="Directory to index")
    parser.add_argument("--chunk-size", type=int, default=DEFAULT_CHUNK_SIZE)
    parser.add_argument("--reset-db", action="store_true", help="Drop and recreate the DB")
    args = parser.parse_args()

    if args.path:
        dirs_to_scan = [Path(args.path)]
    else:
        base = Path(__file__).resolve().parent.parent
        dirs_to_scan = [base / "backend", base / "frontend" / "src"]

    db_path = Path(__file__).resolve().parent / DB_NAME

    if args.reset_db and db_path.exists():
        print(f"[RESET] Removing {db_path}")
        db_path.unlink()

    init_db(db_path)
    conn = sqlite3.connect(str(db_path), timeout=30.0)
    total_inserted = 0

    for directory in dirs_to_scan:
        if not directory.is_dir():
            continue

        files = find_code_files(directory)
        print(f"\n[{len(files)} files] Indexing {directory} …")

        for f in files:
            chunks = chunk_code(f, args.chunk_size)
            if not chunks:
                continue
            count = save_chunks_concurrently(conn, chunks)
            total_inserted += count
            if count > 0:
                print(f"    + {f.name}: {count} chunk(s) indexed")

    conn.close()
    print(f"\n✓ Indexed {total_inserted} chunks successfully!")

if __name__ == "__main__":
    main()
