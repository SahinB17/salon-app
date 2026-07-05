import os

def replace_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace the hardcoded hostname:8000 with a dynamic one that drops port 8000 in production
    content = content.replace("http://${window.location.hostname}:8000", "http://${window.location.hostname}${window.location.port === '5173' ? ':8000' : ''}")
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

frontend_dir = r"c:\Users\Shahin\OneDrive\Masaüstü\salon-app\frontend\src"

for root, _, files in os.walk(frontend_dir):
    for file in files:
        if file.endswith(('.ts', '.tsx')):
            replace_in_file(os.path.join(root, file))

print("Replaced all dynamic port occurrences successfully.")
