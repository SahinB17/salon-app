import os

def replace_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace the single quotes literal in api.ts
    content = content.replace("'http://localhost:8000'", "`http://${window.location.hostname}:8000`")
    
    # Replace the embedded literal in TSX files
    content = content.replace("http://localhost:8000", "http://${window.location.hostname}:8000")
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

frontend_dir = r"c:\Users\Shahin\OneDrive\Masaüstü\salon-app\frontend\src"

for root, _, files in os.walk(frontend_dir):
    for file in files:
        if file.endswith(('.ts', '.tsx')):
            replace_in_file(os.path.join(root, file))

print("Replaced all occurrences successfully.")
