import argparse
import json
import math
import sqlite3
import sys
import io
if hasattr(sys.stdout, 'buffer'):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
from pathlib import Path
import httpx

OLLAMA_URL = "http://localhost:11434/api/embeddings"
OLLAMA_CHAT_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "all-minilm"
OLLAMA_CHAT_MODEL = "qwen2.5-coder:7b"  # Sizdə hansı kod modelidirsə, onu bura yaza bilərsiniz (məs: qwen2.5-coder)
DB_NAME = "vector_store.db"

def get_query_embedding(query: str) -> list[float]:
    """İstifadəçinin sualını vektora çevirir."""
    payload = {"model": OLLAMA_MODEL, "prompt": query.strip()}
    try:
        resp = httpx.post(OLLAMA_URL, json=payload, timeout=30.0)
        resp.raise_for_status()
        data = resp.json()
        return data.get("embedding") or data.get("embeddings", [])
    except Exception as e:
        print(f"[ERROR] Failed to get embedding for query: {e}")
        sys.exit(1)

def cosine_similarity(v1: list[float], v2: list[float]) -> float:
    """İki vektor arasındakı riyazi oxşarlığı (0-dan 1-ə qədər) tapır."""
    dot_product = sum(a * b for a, b in zip(v1, v2))
    norm_a = math.sqrt(sum(a * a for a in v1))
    norm_b = math.sqrt(sum(b * b for b in v2))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot_product / (norm_a * norm_b)

def search_db(query_vector: list[float], limit: int = 5) -> list[dict]:
    """Verilənlər bazasındakı bütün vektorlarla sualın vektorunu müqayisə edir."""
    db_path = Path(__file__).resolve().parent / DB_NAME
    if not db_path.exists():
        print(f"[ERROR] Baza {db_path} tapılmadı. Əvvəlcə indexer.py işlədin.")
        sys.exit(1)

    conn = sqlite3.connect(str(db_path))
    cur = conn.cursor()
    cur.execute("SELECT filepath, start_line, snippet, vector FROM code_chunks")
    
    results = []
    for row in cur.fetchall():
        filepath, start_line, snippet, vector_json = row
        chunk_vector = json.loads(vector_json)
        
        sim = cosine_similarity(query_vector, chunk_vector)
        results.append({
            "filepath": filepath,
            "start_line": start_line,
            "snippet": snippet,
            "similarity": sim
        })
        
    conn.close()
    
    # Ən çox oxşayanları yuxarıda (descending) sırala
    results.sort(key=lambda x: x["similarity"], reverse=True)
    return results[:limit]

def ask_llm(prompt: str, model: str):
    """Hazır Promptu birbaşa Ollama-ya (Local LLM) göndərir və cavabı ekrana yazdırır."""
    print(f"\n🧠 [{model}] modeli kodları oxudu, düşünür və cavab yazır...\n" + "="*60)
    payload = {
        "model": model,
        "prompt": prompt,
        "stream": True
    }
    
    try:
        with httpx.Client() as client:
            with client.stream("POST", OLLAMA_CHAT_URL, json=payload, timeout=120.0) as response:
                response.raise_for_status()
                for line in response.iter_lines():
                    if line:
                        data = json.loads(line)
                        if "response" in data:
                            print(data["response"], end="", flush=True)
        print("\n" + "="*60)
    except Exception as e:
        print(f"\n[ERROR] Modelə qoşulmaq alınmadı: {e}")
        print("Ollama-nın aktiv olduğundan və düzgün model adını yazdığınızdan əmin olun.")

def main():
    parser = argparse.ArgumentParser(description="Vektorlarla koddaxili semantik axtarış.")
    parser.add_argument("query", type=str, help="Sualınız (məsələn: 'login necə işləyir?')")
    parser.add_argument("--top", type=int, default=5, help="Neçə nəticə tapılsın")
    parser.add_argument("--ask", action="store_true", help="Mətni birbaşa Local LLM-ə göndər və cavab al")
    parser.add_argument("--model", type=str, default=OLLAMA_CHAT_MODEL, help="İstifadə ediləcək LLM modeli")
    args = parser.parse_args()

    print(f"🔍 Axtarılır: '{args.query}'...\n")
    
    query_vector = get_query_embedding(args.query)
    if not query_vector:
        return
        
    top_results = search_db(query_vector, limit=args.top)
    
    if not top_results:
        print("Heç bir uyğunluq tapılmadı.")
        return

    print("✅ Ən əlaqəli fayllar tapıldı:\n" + "-"*50)
    
    # LLM üçün hazır Prompt formatı yaradırıq
    context_prompt = (
        "You are an expert AI coding assistant. Here are the relevant code snippets "
        "from the user's codebase based on their request. Read them and fulfill the request.\n\n"
    )
    
    for i, res in enumerate(top_results, 1):
        score = res['similarity'] * 100
        print(f"{i}. [Uyğunluq: {score:.1f}%] {res['filepath']} (Sətir: {res['start_line']})")
        
        context_prompt += f"--- File: {res['filepath']} (Line: {res['start_line']}) ---\n"
        context_prompt += f"{res['snippet']}\n\n"

    context_prompt += f"User's Request: {args.query}\n"
    
    if args.ask:
        ask_llm(context_prompt, args.model)
    else:
        print("-" * 50)
        print("💡 LLM üçün artıq hazır Promptunuz aşağıdadır.")
        print("Avtomatik olaraq bu sualı LLM-ə göndərmək və cavab almaq üçün komandanın sonuna --ask əlavə edin:\n")
        print(context_prompt)

if __name__ == "__main__":
    main()
