# -*- coding: utf-8 -*-
import re, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('web/src/data/pu2_vocab.js', encoding='utf-8') as f:
    content = f.read()

# Find word and phonetic pairs - simple approach
# Match the pattern where "word": "X" and "phonetic": "Y" appear in same object
pairs = re.findall(r'"word":\s*"([^"]+)"[^}]{5,200}?"phonetic":\s*"([^"]+)"', content, re.DOTALL)
print(f"PU2 pairs: {len(pairs)}")
for p in pairs[:3]:
    print(f"  word={p[0]}, phonetic={p[1]}")

with open('web/src/data/pu3_vocab.js', encoding='utf-8') as f:
    content = f.read()

pairs = re.findall(r'"word":\s*"([^"]+)"[^}]{5,200}?"phonetic":\s*"([^"]+)"', content, re.DOTALL)
print(f"PU3 pairs: {len(pairs)}")
for p in pairs[:3]:
    print(f"  word={p[0]}, phonetic={p[1]}")
