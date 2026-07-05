import urllib.request
import json

url = 'https://api.github.com/repos/SahinB17/salon-app/actions/runs'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        runs = data.get('workflow_runs', [])
        if runs:
            latest = runs[0]
            print(f"Status: {latest['status']}")
            print(f"Conclusion: {latest['conclusion']}")
            print(f"URL: {latest['html_url']}")
        else:
            print("No runs found")
except Exception as e:
    print(f"Error: {e}")
