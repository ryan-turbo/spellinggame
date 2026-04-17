#!/usr/bin/env python3
"""Build final syllable→audio mapping."""
import os, re

AudioDir = r'F:\pu-spelling-game\web\public\audio'
PhonDir  = r'F:\pu-spelling-game\web\public\audio\phonics'
VocabPath = r'F:\pu-spelling-game\web\src\data\phonics_vocab.js'

# List phonics dir
print('PhonDir contents:')
ph_files = {}
for f in sorted(os.listdir(PhonDir)):
    if f.startswith('ph_') and f.endswith('.mp3'):
        key = f[3:-4]  # strip 'ph_' and '.mp3'
        ph_files[key] = f
print(f'  Total: {len(ph_files)} files')
print(f'  Keys: {sorted(ph_files.keys())[:20]}...')

# Public audio
pub_files = {}
for f in os.listdir(AudioDir):
    if f.endswith('.mp3'):
        pub_files[f[:-4].replace('_', ' ')] = f
        pub_files[f[:-4]] = f

# Read vocab syllables
with open(VocabPath, 'r', encoding='utf-8') as f:
    content = f.read()

pattern = re.compile(r'syllables\s*:\s*\[([^\]]+)\]', re.MULTILINE)
all_syllables = set()
for m in pattern.finditer(content):
    for p in re.findall(r'"([^"]+)"', m.group(1)):
        if p: all_syllables.add(p)

print(f'\nVocab syllables: {len(all_syllables)}')

# Build mapping
mapping = {}
missing = []
for syl in sorted(all_syllables):
    if syl in ph_files:
        mapping[syl] = f'/audio/phonics/{ph_files[syl]}'
    elif syl in pub_files:
        mapping[syl] = f'/audio/{pub_files[syl]}'
    else:
        # Fallback: try ph_ prefix
        if f'ph_{syl}.mp3' in os.listdir(PhonDir):
            mapping[syl] = f'/audio/phonics/ph_{syl}.mp3'
        else:
            missing.append(syl)

print(f'Mapped: {len(mapping)}, Missing: {len(missing)}')
if missing: print(f'Missing: {missing}')

# Output JS
print('\nexport const SYLLABLE_AUDIO_MAP = {')
for k, v in sorted(mapping.items()):
    print(f"  '{k}': '{v}',")
print('}')
