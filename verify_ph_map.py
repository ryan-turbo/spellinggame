#!/usr/bin/env python3
"""
Verify all ph_*.mp3 source words and their syllable contents.
"""
import os

PhonDir = r'F:\pu-spelling-game\web\public\audio\phonics'
VocabPath = r'F:\pu-spelling-game\web\src\data\phonics_vocab.js'

# Syllable → source word mapping from gen_phoneme_audio.py PHONEME_MAP
# Also: SYLLABLE_AUDIO_MAP from PhonicsLearnView.jsx
PH_MAP = {
    'a': 'cat', 'b': 'bee', 'c': 'cat', 'd': 'dog', 'e': 'bed',
    'f': 'fish', 'g': 'go', 'h': 'hat', 'i': 'sit', 'j': 'jam',
    'k': 'cat', 'l': 'lion', 'm': 'moon', 'n': 'net', 'o': 'hot',
    'p': 'pig', 'r': 'red', 's': 'sun', 't': 'top', 'u': 'cup',
    'v': 'van', 'w': 'wet', 'x': 'fox', 'y': 'yes', 'z': 'zebra',
    'ch': 'chip', 'sh': 'ship', 'th': 'think', 'TH': 'this',
    'wh': 'what', 'ph': 'fish', 'ng': 'sing', 'nk': 'bank', 'ck': 'duck',
    'a_e': 'make', 'i_e': 'make', 'o_e': 'home', 'u_e': 'cute', 'e_e': 'these',
    'ai': 'rain', 'ay': 'day', 'ee': 'see', 'ea': 'tea',
    'ea_e': 'bread', 'oa': 'boat', 'oo': 'moon', 'oo_s': 'book',
    'ou': 'out', 'ow': 'now', 'ow_l': 'go', 'oi': 'coin', 'oy': 'boy',
    'ar': 'car', 'or': 'fork', 'er': 'her', 'ir': 'bird',
    'ur': 'turn', 'air': 'hair', 'ear': 'ear', 'are': 'care',
    'bl': 'black', 'br': 'bread', 'cl': 'clap', 'cr': 'crab',
    'dr': 'drum', 'fl': 'flag', 'fr': 'frog', 'gl': 'glass',
    'gr': 'green', 'pl': 'play', 'pr': 'prize', 'sc': 'scar',
    'sk': 'skip', 'sl': 'slip', 'sm': 'smile', 'sn': 'snake',
    'sp': 'spoon', 'spr': 'spray', 'st': 'star', 'str': 'street',
    'sw': 'swim', 'tr': 'tree', 'tw': 'twin', 'sch': 'school',
    'scr': 'scratch', 'thr': 'three', 'tch': 'watch', 'dge': 'bridge',
    'kn': 'knee', 'wr': 'write', 'gh': 'night',
    'pen': 'pencil', 'rab': 'rabbit', 'hos': 'hospital',
    'um': 'umbrella', 'fan': 'fantastic',
}

# MISSING_MAP from gen_missing_and_fix.py
MISSING_MAP = {
    'c': 'cat', 'qu': 'queen',
    'am': 'example', 'bit': 'rabbit', 'ble': 'table', 'la': 'umbrella',
    'bt': 'doubt', 'ne': 'knee', 'ty': 'city', 'brel': 'umbrella',
    'en': 'listen', 'mb': 'climb', 'ke': 'make', 'est': 'honest',
    'me': 'home', 'te': 'cute', 'cil': 'pencil', 'tal': 'hospital',
    'tas': 'fantastic', 'tic': 'fantastic', 'ta': 'table', 've': 'give',
    'pi': 'hospital',
}

ALL_PH_MAP = {**PH_MAP, **MISSING_MAP}

# All vocab syllables
import re
with open(VocabPath, 'r', encoding='utf-8') as f:
    content = f.read()
pattern = re.compile(r'syllables\s*:\s*\[([^\]]+)\]', re.MULTILINE)
all_syls = set()
for m in pattern.finditer(content):
    for p in re.findall(r'"([^"]+)"', m.group(1)):
        if p: all_syls.add(p)

print(f'All vocab syllables ({len(all_syls)}): {sorted(all_syls)}')
print()

# Check each file
files = sorted([f for f in os.listdir(PhonDir) if f.startswith('ph_') and f.endswith('.mp3')])
ok = 0
warn = 0
err = 0
for f in files:
    key = f[3:-4]
    size = os.path.getsize(os.path.join(PhonDir, f))
    if key in ALL_PH_MAP:
        word = ALL_PH_MAP[key]
        in_syl = key in all_syls
        status = 'OK' if size > 3000 else 'SMALL'
        print(f'  [{status}] ph_{key:10s} from "{word}" size={size}b {"<-- vocab syllable" if in_syl else ""}')
        if status == 'OK': ok += 1
        else: warn += 1
    else:
        print(f'  [???]  ph_{key:10s} NO SOURCE (not in map) size={size}b')
        err += 1

print(f'\n{ok} OK, {warn} small, {err} unknown')
