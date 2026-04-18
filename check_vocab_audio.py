import os, re
audio_dir = r'F:\pu-spelling-game\web\public\audio'
vocab_path = r'F:\pu-spelling-game\web\src\data\phonics_vocab.js'
with open(vocab_path, 'r', encoding='utf-8') as f:
    content = f.read()
matches = re.findall(r"word: '([^']+)',\s*audio: '([^']+)'", content)
missing = []
small = []
for word, audio in matches:
    p = os.path.join(audio_dir, audio)
    sz = os.path.getsize(p) if os.path.exists(p) else 0
    if sz < 500:
        missing.append((word, audio, sz))
    elif sz < 2000:
        small.append((word, audio, sz))
print(f"Total: {len(matches)}, Missing: {len(missing)}, Small(<2KB): {len(small)}")
if missing:
    print("MISSING:", [m[0] for m in missing[:20]])
if small:
    print("SMALL:", [s[0] for s in small[:10]])
