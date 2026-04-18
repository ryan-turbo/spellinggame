import os

audio_dir = r'F:\pu-spelling-game\web\public\audio'

# 1. 检查音频目录下的所有文件（不含 phonics 子目录）
all_files = [f for f in os.listdir(audio_dir) if f.endswith('.mp3') and not f.startswith('ph_')]
print(f"=== 主音频目录词文件: {len(all_files)} 个 ===")

# 2. 检查 speakExample 相关问题：找找哪些词对应的文件名
problem_words = ['bed', 'cat', 'dog', 'fan', 'hat', 'jam', 'mango', 'milkshake', 'write an email']
for w in problem_words:
    underscore_name = w.replace(' ', '_') + '.mp3'
    normal_name = w.replace(' ', ' ') + '.mp3'
    p1 = os.path.join(audio_dir, underscore_name)
    p2 = os.path.join(audio_dir, normal_name)
    sz1 = os.path.getsize(p1) if os.path.exists(p1) else 0
    sz2 = os.path.getsize(p2) if os.path.exists(p2) else 0
    print(f'  "{w}": _={underscore_name}({sz1}B)  _={normal_name}({sz2}B)')

print()

# 3. 检查 phonics_vocab 中词对应的 audio 字段
print("=== phonics_vocab.js 词音频对应 ===")
vocab_path = r'F:\pu-spelling-game\web\src\data\phonics_vocab.js'
with open(vocab_path, 'r', encoding='utf-8') as f:
    content = f.read()

import re
# 找所有 word 和 audio 字段
matches = re.findall(r"word: '([^']+)',\s*audio: '([^']+)'", content)
print(f"总词条: {len(matches)}")
missing = []
for word, audio in matches[:30]:
    path = os.path.join(audio_dir, audio)
    if not os.path.exists(path):
        missing.append((word, audio))
        print(f"  MISSING: '{word}' -> '{audio}'")
    elif os.path.getsize(path) < 500:
        missing.append((word, audio))
        print(f"  SMALL: '{word}' -> '{audio}' ({os.path.getsize(path)} bytes)")

print(f"\n前30词缺失/损坏: {len(missing)}")
