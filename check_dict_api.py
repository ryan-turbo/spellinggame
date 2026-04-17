#!/usr/bin/env python3
"""Test Free Dictionary API coverage for phonics vocabulary."""
import requests, sys, json, re

sys.stdout.reconfigure(encoding='utf-8')

VocabPath = r'F:\pu-spelling-game\web\src\data\phonics_vocab.js'

# Read all words from vocab
with open(VocabPath, 'r', encoding='utf-8') as f:
    content = f.read()

# Extract words from definitions and audio fields
words_in_vocab = set()
pattern = re.compile(r'\bword\s*:\s*["\']([^"\']+)["\']', re.I)
for m in pattern.finditer(content):
    w = m.group(1).strip().lower()
    if w: words_in_vocab.add(w)

# Extract words from definition examples
def_examples = re.findall(r'\(([^)]+)\)', content)
for ex in def_examples:
    for word in ex.split(','):
        w = word.strip().lower().replace('.', '').replace('!', '').replace('?', '')
        # Only single words, no multi-word phrases
        if w and ' ' not in w and len(w) > 1:
            words_in_vocab.add(w)

print(f'Words from vocab: {len(words_in_vocab)}')
print(f'Sample: {sorted(words_in_vocab)[:20]}')

# Test API for all unique words (batch check)
test_words = sorted(words_in_vocab)[:50]  # Test first 50
uk_oks = 0
us_only = 0
no_audio = 0
errors = 0

for word in test_words:
    try:
        r = requests.get(f'https://api.dictionaryapi.dev/api/v2/entries/en/{word}', timeout=8)
        if r.status_code == 200:
            data = r.json()[0]
            audios = [ph.get('audio', '') for ph in data.get('phonetics', []) if ph.get('audio')]
            uk = [a for a in audios if 'uk' in a.lower() or '-gb' in a.lower()]
            if uk:
                uk_oks += 1
                # print(f'OK UK: {word} -> {uk[0][:60]}')
            elif audios:
                us_only += 1
                print(f'US only: {word} -> {audios[0][:60]}')
            else:
                no_audio += 1
                print(f'No audio: {word}')
        else:
            errors += 1
            print(f'Error {r.status_code}: {word}')
    except Exception as e:
        errors += 1
        print(f'Exception: {word} -> {e}')

print(f'\n=== First 50 words ===')
print(f'UK audio: {uk_oks}')
print(f'US only:  {us_only}')
print(f'No audio: {no_audio}')
print(f'API errors: {errors}')

# Test specific phonics words
print('\n=== Phonics key words ===')
key_words = ['bat', 'cat', 'dog', 'fish', 'hat', 'jam', 'net', 'pig', 'red', 'sun',
             'van', 'wet', 'yes', 'zebra', 'bee', 'box', 'fox', 'top',
             'chair', 'ship', 'think', 'rain', 'see', 'tea', 'boat', 'moon',
             'out', 'now', 'coin', 'boy', 'car', 'fork', 'bird', 'turn',
             'black', 'bread', 'clap', 'frog', 'green', 'play', 'spoon',
             'star', 'street', 'swim', 'tree', 'school', 'three',
             'chair', 'scratch', 'watch', 'bridge', 'knee', 'write']
for word in key_words:
    try:
        r = requests.get(f'https://api.dictionaryapi.dev/api/v2/entries/en/{word}', timeout=8)
        if r.status_code == 200:
            data = r.json()[0]
            audios = [ph.get('audio', '') for ph in data.get('phonetics', []) if ph.get('audio')]
            if audios:
                has_uk = any('uk' in a.lower() for a in audios)
                print(f'  {"[UK]" if has_uk else "[US]"} {word:12s} -> {audios[0][-50:]}')
            else:
                print(f'  [NO]  {word}')
        else:
            print(f'  [ERR] {word} ({r.status_code})')
    except:
        print(f'  [EXC] {word}')
