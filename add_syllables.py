#!/usr/bin/env python3
"""Add syllables (phoneme-level grapheme chunks) to every word in phonics_vocab.js"""

import re, sys

# Define syllables for each word by unit key
# Each entry: word → list of phoneme-level grapheme chunks
SYLLABLES = {
    # phL1u1 - Consonant Sounds (CVC onset+vowel+coda)
    'phL1u1': {
        'bat': ['b','a','t'], 'dog': ['d','o','g'], 'fan': ['f','a','n'],
        'hat': ['h','a','t'], 'jam': ['j','a','m'], 'kit': ['k','i','t'],
        'leg': ['l','e','g'], 'map': ['m','a','p'], 'net': ['n','e','t'],
        'pig': ['p','i','g'], 'rat': ['r','a','t'], 'sun': ['s','u','n'],
        'tap': ['t','a','p'], 'van': ['v','a','n'], 'web': ['w','e','b'],
        'yak': ['y','a','k'], 'zip': ['z','i','p'],
    },
    # phL1u2 - Special Consonants
    'phL1u2': {
        'cat': ['c','a','t'], 'city': ['c','i','ty'], 'go': ['g','o'],
        'gym': ['g','y','m'], 'box': ['b','o','x'], 'exam': ['e','x','am'],
        'queen': ['qu','ee','n'],
    },
    # phL1u3 - Short Vowels CVC
    'phL1u3': {
        'cat': ['c','a','t'], 'pen': ['p','e','n'], 'sit': ['s','i','t'],
        'dog': ['d','o','g'], 'cup': ['c','u','p'], 'map': ['m','a','p'],
        'bed': ['b','e','d'], 'pin': ['p','i','n'], 'pot': ['p','o','t'],
        'bug': ['b','u','g'],
    },
    # phL2u1 - Long Vowels (CV open syllable)
    'phL2u1': {
        'me': ['m','e'], 'go': ['g','o'], 'hi': ['h','i'],
        'we': ['w','e'], 'no': ['n','o'],
    },
    # phL2u2 - Magic E (CVCe): onset + vowel + consonant + silent_e
    'phL2u2': {
        'make': ['m','a','k','e'], 'time': ['t','i','m','e'],
        'home': ['h','o','m','e'], 'cute': ['c','u','t','e'],
        'these': ['th','e','s','e'], 'cake': ['c','a','k','e'],
        'bike': ['b','i','k','e'], 'bone': ['b','o','n','e'],
    },
    # phL3u1 - ai/ay
    'phL3u1': {
        'rain': ['r','ai','n'], 'play': ['pl','ay'], 'train': ['tr','ai','n'],
        'stay': ['st','ay'], 'snail': ['sn','ai','l'],
    },
    # phL3u2 - ee/ea
    'phL3u2': {
        'bee': ['b','ee'], 'tea': ['t','ea'], 'bread': ['br','ea','d'],
        'tree': ['tr','ee'], 'dream': ['dr','ea','m'],
    },
    # phL3u3 - oa/oo
    'phL3u3': {
        'boat': ['b','oa','t'], 'moon': ['m','oo','n'], 'book': ['b','oo','k'],
        'road': ['r','oa','d'], 'school': ['sch','oo','l'],
    },
    # phL3u4 - ou/ow/oi/oy
    'phL3u4': {
        'out': ['ou','t'], 'now': ['n','ow'], 'slow': ['sl','ow'],
        'coin': ['c','oi','n'], 'boy': ['b','oy'],
    },
    # phL4u1 - Consonant Digraphs
    'phL4u1': {
        'chair': ['ch','ai','r'], 'ship': ['sh','i','p'], 'think': ['th','i','nk'],
        'this': ['th','i','s'], 'what': ['wh','a','t'], 'phone': ['ph','o','ne'],
        'sing': ['s','i','ng'], # nk already in think above
    },
    # phL4u2 - Consonant Blends
    'phL4u2': {
        'black': ['bl','a','ck'], 'bread': ['br','ea','d'], 'clap': ['cl','a','p'],
        'crab': ['cr','a','b'], 'drum': ['dr','u','m'], 'flag': ['fl','a','g'],
        'frog': ['fr','o','g'], 'street': ['str','ee','t'], 'spring': ['spr','i','ng'],
    },
    # phL5u1 - R-Controlled Vowels
    'phL5u1': {
        'car': ['c','ar'], 'fork': ['f','or','k'], 'her': ['h','er'],
        'bird': ['b','ir','d'], 'turn': ['t','ur','n'], 'care': ['c','are'],
    },
    # phL5u2 - Diphthongs
    'phL5u2': {
        'cake': ['c','a','ke'], 'my': ['m','y'], 'boy': ['b','oy'],
        'now': ['n','ow'], 'go': ['g','o'], 'ear': ['ea','r'],
        'hair': ['h','ai','r'], 'poor': ['p','oo','r'],
    },
    # phL6u1 - Silent Letters
    'phL6u1': {
        'knee': ['kn','ee'], 'write': ['wr','i','te'], 'climb': ['cl','i','mb'],
        'doubt': ['d','ou','bt'], 'listen': ['l','i','st','en'], 'honest': ['h','o','n','est'],
    },
    # phL6u2 - Irregular Words (by definition irregular, but we chunk by visual pattern)
    'phL6u2': {
        'the': ['th','e'], 'said': ['s','ai','d'], 'was': ['w','a','s'],
        'of': ['o','f'], 'do': ['d','o'], 'have': ['h','a','ve'],
        'come': ['c','o','me'], 'some': ['s','o','me'],
    },
    # phL6u3 - Multisyllabic Words
    'phL6u3': {
        'pencil': ['pen','cil'], 'rabbit': ['rab','bit'], 'table': ['ta','ble'],
        'hospital': ['hos','pi','tal'], 'umbrella': ['um','brel','la'],
        'fantastic': ['fan','tas','tic'],
    },
}

# Read the file
with open(r'F:\pu-spelling-game\web\src\data\phonics_vocab.js', 'r', encoding='utf-8') as f:
    content = f.read()

# For each word entry, add syllables field after has_image
# Pattern: { word: 'xxx', ... has_image: false },
# We need to match each word entry and insert syllables before the closing }

current_unit = None
lines = content.split('\n')
new_lines = []

for line in lines:
    # Detect unit key
    unit_match = re.match(r"\s+(phL\d+u\d+):\s*\{", line)
    if unit_match:
        current_unit = unit_match.group(1)
        new_lines.append(line)
        continue
    
    # Detect word entries
    word_match = re.search(r"word:\s*'([^']+)'", line)
    if word_match and current_unit and current_unit in SYLLABLES:
        word = word_match.group(1)
        syllables = SYLLABLES[current_unit].get(word)
        if syllables:
            # Insert syllables field before the closing }, or before has_image
            syllables_str = str(syllables).replace("'", '"')
            # Replace has_image: false }, with has_image: false, syllables: [...] },
            if 'has_image: false' in line:
                line = line.replace('has_image: false }', f'has_image: false, syllables: {syllables_str} }}')
            elif 'has_image: true' in line:
                line = line.replace('has_image: true }', f'has_image: true, syllables: {syllables_str} }}')
    
    new_lines.append(line)

with open(r'F:\pu-spelling-game\web\src\data\phonics_vocab.js', 'w', encoding='utf-8') as f:
    f.write('\n'.join(new_lines))

# Verify
with open(r'F:\pu-spelling-game\web\src\data\phonics_vocab.js', 'r', encoding='utf-8') as f:
    content = f.read()

count = content.count('syllables:')
print(f"Added syllables to {count} words")

# Verify a few
for word in ['bat', 'make', 'rain', 'pencil']:
    idx = content.find(f"word: '{word}'")
    if idx > 0:
        end = content.find('}', idx)
        snippet = content[idx:end+1]
        if 'syllables' in snippet:
            print(f"  ✓ {word}: syllables found")
        else:
            print(f"  ✗ {word}: syllables MISSING")
