#!/usr/bin/env python3
"""Deploy index.html to GitHub Pages via API.
Token は macOS Keychain から取得（security find-generic-password -a satoshi -s github-pat -w）
"""
import urllib.request, urllib.error, json, base64, os, sys, subprocess

def get_token():
    # 1. 環境変数
    t = os.environ.get('GITHUB_TOKEN', '')
    if t: return t
    # 2. macOS Keychain
    try:
        r = subprocess.run(
            ['security', 'find-generic-password', '-a', 'satoshi', '-s', 'github-pat', '-w'],
            capture_output=True, text=True, timeout=5
        )
        if r.returncode == 0: return r.stdout.strip()
    except Exception: pass
    print('❌ GitHub トークンが見つかりません。')
    print('   security add-generic-password -a satoshi -s github-pat -w <TOKEN> -U')
    sys.exit(1)

TOKEN  = get_token()
REPO   = 'fujisss358/satoshi-life-os'
PATH   = 'index.html'
BRANCH = 'main'
LOCAL  = '/Users/satoshifujinuma/FX攻略テスト/life-os/index.html'

headers = {
    'Authorization': f'token {TOKEN}',
    'Content-Type': 'application/json',
    'User-Agent': 'Python'
}

with open(LOCAL, 'rb') as f:
    content = base64.b64encode(f.read()).decode()

url = f'https://api.github.com/repos/{REPO}/contents/{PATH}?ref={BRANCH}'
req = urllib.request.Request(url, headers=headers)
with urllib.request.urlopen(req) as r:
    sha = json.loads(r.read())['sha']
print(f'Current SHA: {sha[:8]}')

payload = json.dumps({
    'message': 'Deploy Life OS update',
    'content': content,
    'sha': sha,
    'branch': BRANCH
}).encode()

req2 = urllib.request.Request(
    f'https://api.github.com/repos/{REPO}/contents/{PATH}',
    data=payload, headers=headers, method='PUT'
)
try:
    with urllib.request.urlopen(req2) as r:
        result = json.loads(r.read())
        print(f'✅ Deployed! Commit: {result["commit"]["sha"][:8]}')
        print(f'   URL: https://fujisss358.github.io/satoshi-life-os/')
except urllib.error.HTTPError as e:
    body = e.read().decode()
    if 'Whoa' in body or e.code == 400:
        print('⚠️  ファイルが大きすぎます。git push を使います...')
        os.system(f'''
cd "/Users/satoshifujinuma/FX攻略テスト/life-os" && \
git remote set-url origin "https://fujisss358:{TOKEN}@github.com/fujisss358/satoshi-life-os.git" && \
git add index.html satoshi_life_os.html && \
git commit -m "Deploy Life OS update" && \
git push origin main && \
git remote set-url origin "https://github.com/fujisss358/satoshi-life-os.git"
''')
    else:
        print(f'❌ Error: {e.code} {body}')
        sys.exit(1)
