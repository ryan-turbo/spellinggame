# -*- coding: utf-8 -*-
import re, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('web/src/data/pu2_vocab.js', 'rb') as f:
    raw = f.read()

# Find the first word object
content = raw.decode('utf-8', errors='replace')

# Try different patterns
p1 = re.findall(r"word:\s*'([^']+)'", content)
print(f"Pattern 1 (word: '...'): {len(p1)} matches, first 3: {p1[:3]}")

p2 = re.findall(r'word:\s*"([^"]+)"', content)
print(f"Pattern 2 (word: \"...\"): {len(p2)} matches")

# Try a broader pattern - just find consecutive word/phonetic in objects
# Find position of "word:" occurrences
positions = [(m.start(), m.group()) for m in re.finditer(r"word:", content)]
print(f"\nFound {len(positions)} 'word:' occurrences")
for pos, text in positions[:2]:
    snippet = content[pos:pos+200]
    print(f"\nAt pos {pos}:")
    print(repr(snippet[:200]))
