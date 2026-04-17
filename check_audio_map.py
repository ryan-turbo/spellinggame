#!/usr/bin/env python3
"""
Check which syllables from phonics_vocab.js have corresponding audio files.
"""
import re, os

VocabPath = r'F:\pu-spelling-game\web\src\data\phonics_vocab.js'
AudioDir = r'F:\pu-spelling-game\web\public\audio'
PhonDir = r'F:\pu-spelling-game\web\public\audio\phonics'

# Collect all syllables
with open(VocabPath, 'r', encoding='utf-8') as f:
    content = f.read()

syllables = set()
pattern = re.compile(r'syllables\s*:\s*\[[\s\S]*?\]\]', re.MULTILINE)
for m in pattern.finditer(content):
    str_pattern = re.compile(r'"([^"]+)"')
    for s in str_pattern.finditer(m.group()):
        if s.group(1): syllables.add(s.group(1))

print(f'All syllables ({len(syllables)}):')
for s in sorted(syllables): print(f'  {s!r}')
print()

# Check public/audio
pub_audio = set()
for f in os.listdir(AudioDir):
    if f.endswith('.mp3'):
        pub_audio.add(f.replace('.mp3', '').replace('_', ' '))
print(f'Public audio files ({len(pub_audio)}):')
for a in sorted(pub_audio): print(f'  {a!r}')
print()

# Check phonics dir
ph_audio = set()
for f in os.listdir(PhonDir):
    if f.endswith('.mp3'):
        ph_audio.add(f.replace('ph_', '').replace('.mp3', ''))
print(f'Phoneme audio files ({len(ph_audio)}):')
for a in sorted(ph_audio): print(f'  {a!r}')
print()

# Check which syllables have audio
print('=== Syllable Coverage ===')
has_audio = []
no_audio = []
for syl in sorted(syllables):
    # Check various lookup strategies
    found = False
    strategy = ''
    
    # 1. Exact in public/audio (underscore replaces space)
    key = syl.replace(' ', '_')
    if key in pub_audio:
        found = True
        strategy = f'public: {key}.mp3'
    # 2. Exact in ph_ dir
    elif syl in ph_audio:
        found = True
        strategy = f'ph_: ph_{syl}.mp3'
    # 3. public/audio contains the syllable (for multi-char syllables)
    elif any(syl in a and syl != a for a in pub_audio):
        for a in pub_audio:
            if syl in a:
                strategy = f'public(contains): {a}.mp3 contains {syl!r}'
                found = True
                break
    # 4. ph_ dir contains
    elif any(syl in a and syl != a for a in ph_audio):
        for a in ph_audio:
            if syl in a:
                strategy = f'ph_(contains): ph_{a}.mp3 contains {syl!r}'
                found = True
                break
    
    if found:
        has_audio.append((syl, strategy))
        print(f'  [OK]   {syl!r:15s} -> {strategy}')
    else:
        no_audio.append(syl)
        print(f'  [MISS] {syl!r:15s} -> NO AUDIO')

print(f'\n{len(has_audio)}/{len(syllables)} have audio')
print(f'Missing: {len(no_audio)}')
for s in no_audio: print(f'  {s!r}')
