#!/usr/bin/env python3
"""Build syllable → audio file mapping using REAL downloaded audio."""
import os, re, sys

sys.stdout.reconfigure(encoding='utf-8')

VocabPath = r'F:\pu-spelling-game\web\src\data\phonics_vocab.js'
MAIN_AUDIO = r'F:\pu-spelling-game\web\public\audio'
PHONICS_AUDIO = r'F:\pu-spelling-game\web\public\audio\phonics'

# All syllables in vocab
with open(VocabPath, 'r', encoding='utf-8') as f:
    content = f.read()

all_syls = set()
pattern = re.compile(r'syllables\s*:\s*\[([^\]]+)\]', re.MULTILINE)
for m in pattern.finditer(content):
    for p in re.findall(r'"([^"]+)"', m.group(1)):
        if p: all_syls.add(p)

print(f'Syllables ({len(all_syls)}): {sorted(all_syls)}')

# Available audio files
available = {}
for f in os.listdir(MAIN_AUDIO):
    if f.endswith('.mp3'):
        key = f[:-4].replace('_', ' ').lower()
        available[key] = f'/audio/{f}'
for f in os.listdir(PHONICS_AUDIO):
    if f.endswith('.mp3'):
        key = f[:-4].replace('_', ' ').lower()
        available[key] = f'/audio/phonics/{f}'

print(f'\nAvailable audio: {len(available)} files')
for k in sorted(available.keys())[:20]:
    print(f'  {k!r} -> {available[k]}')

# Build syllable → audio mapping
mapping = {}
missing = []

for syl in sorted(all_syls):
    syl_lower = syl.lower()
    
    # 1. Exact match
    if syl_lower in available:
        mapping[syl] = available[syl_lower]
        continue
    
    # 2. Syllable contained in available word
    candidates = [k for k in available if syl_lower in k and k != syl_lower]
    if candidates:
        best = min(candidates, key=len)  # shortest match (most specific)
        mapping[syl] = available[best]
        continue
    
    # 3. Need to generate (not in downloaded audio)
    missing.append(syl)

print(f'\n=== Mapping Result ===')
print(f'Mapped: {len(mapping)}/{len(all_syls)}')
for syl, src in sorted(mapping.items()):
    print(f'  {syl:15s} -> {src}')

print(f'\n=== Missing (need edge-tts generation) ===')
print(f'{len(missing)} syllables: {missing}')

# Save mapping
import json
with open(r'F:\pu-spelling-game\syllable_audio_map.json', 'w', encoding='utf-8') as f:
    json.dump(mapping, f, indent=2, ensure_ascii=False)
print('\nSaved: syllable_audio_map.json')
