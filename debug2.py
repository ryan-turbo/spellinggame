# -*- coding: utf-8 -*-
import re, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('web/src/data/pu2_vocab.js', 'rb') as f:
    raw = f.read()
content = raw.decode('utf-8', errors='replace')

# Try the actual pattern
pairs = re.findall(r'word:\s*"([^"]+)"[^}]{5,300}?phonetic:\s*"([^"]+)"', content, re.DOTALL)
print(f"Pattern result: {len(pairs)} pairs")
if pairs:
    print("First 3:", pairs[:3])

# Try simpler pattern - just word and phonetic fields in same object
# Use a broader skip
pairs2 = re.findall(r'word:\s*"([^"]+)"[^"]*"phonetic:\s*"([^"]+)"', content, re.DOTALL)
print(f"\nPattern2 result: {len(pairs2)} pairs")
if pairs2:
    print("First 3:", pairs2[:3])

# Try even simpler - extract word phonetic from each { word: "...", phonetic: "..." } line
pairs3 = re.findall(r'\{[^}]*?word:\s*"([^"]+)"[^}]*?phonetic:\s*"([^"]+)"[^}]*?\}', content, re.DOTALL)
print(f"\nPattern3 result: {len(pairs3)} pairs")
if pairs3:
    print("First 3:", pairs3[:3])
