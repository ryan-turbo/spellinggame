#!/usr/bin/env python3
"""Check which words are missing audio and try alternative sources."""
import requests, os, sys, re, json

sys.stdout.reconfigure(encoding='utf-8')

VocabPath = r'F:\pu-spelling-game\web\src\data\phonics_vocab.js'
with open(VocabPath, 'r', encoding='utf-8') as f:
    content = f.read()

# Collect all words
all_words = set()
for m in re.finditer(r'\bword\s*:\s*["\']([^"\']+)["\']', content):
    all_words.add(m.group(1).lower())
for ex in re.findall(r'\(([^)]+)\)', content):
    for w in ex.split(','):
        w = w.strip().lower().replace('.', '')
        if w and ' ' not in w and len(w) >= 2:
            all_words.add(w)

# Check which ones are already downloaded
AUDIO_DIR = r'F:\pu-spelling-game\web\public\audio\phonics'
existing = {f.replace('.mp3', '') for f in os.listdir(AUDIO_DIR) if f.endswith('.mp3')}
# Also check main audio dir
MAIN_AUDIO = r'F:\pu-spelling-game\web\public\audio'
for f in os.listdir(MAIN_AUDIO):
    if f.endswith('.mp3'):
        existing.add(f.replace('.mp3', '').replace('_', ' '))

# Missing words
missing = [w for w in sorted(all_words) if w not in existing]
print(f'Total words: {len(all_words)}')
print(f'Already have audio: {len(all_words) - len(missing)}')
print(f'Missing: {len(missing)}')
print(f'Missing words: {missing}')
