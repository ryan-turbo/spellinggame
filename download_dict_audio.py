#!/usr/bin/env python3
"""
Download real human British English audio from Free Dictionary API.
Then generate a comprehensive syllable → audio URL mapping.
"""
import requests, os, sys, re, json, time

sys.stdout.reconfigure(encoding='utf-8')

AUDIO_DIR = r'F:\pu-spelling-game\web\public\audio\phonics'
os.makedirs(AUDIO_DIR, exist_ok=True)

# Vocabulary words + example words needed
# Build comprehensive list from phonics_vocab.js
VocabPath = r'F:\pu-spelling-game\web\src\data\phonics_vocab.js'
with open(VocabPath, 'r', encoding='utf-8') as f:
    content = f.read()

# Extract words from vocab
all_words = set()
# From word: field
for m in re.finditer(r'\bword\s*:\s*["\']([^"\']+)["\']', content):
    all_words.add(m.group(1).lower())
# From definition examples
for ex in re.findall(r'\(([^)]+)\)', content):
    for w in ex.split(','):
        w = w.strip().lower().replace('.', '')
        if w and ' ' not in w and len(w) >= 2:
            all_words.add(w)

print(f'Words needed: {len(all_words)}')

# Download audio from Free Dictionary API
session = requests.Session()
session.headers.update({'User-Agent': 'Mozilla/5.0 (compatible; pu-spelling-game/1.0)'})

uk_downloads = 0
us_fallback = 0
missing = 0
failed = 0

audio_urls = {}  # word -> (url, region)

for word in sorted(all_words):
    api_url = f'https://api.dictionaryapi.dev/api/v2/entries/en/{word}'
    try:
        r = session.get(api_url, timeout=8)
        if r.status_code != 200:
            failed += 1
            continue
        
        data = r.json()[0]
        audios = [(ph.get('audio', ''), ph.get('audio-detail', '')) 
                  for ph in data.get('phonetics', []) if ph.get('audio')]
        
        if not audios:
            missing += 1
            continue
        
        # Prefer UK
        uk = [a[0] for a in audios if a[0] and ('uk' in a[0].lower() or '-gb' in a[0].lower())]
        us = [a[0] for a in audios if a[0] and 'us' in a[0].lower()]
        
        if uk:
            url = uk[0]
            region = 'uk'
            uk_downloads += 1
        elif us:
            url = us[0]
            region = 'us'
            us_fallback += 1
        else:
            url = audios[0][0]
            region = 'other'
            us_fallback += 1
        
        audio_urls[word] = (url, region)
        
    except Exception as e:
        failed += 1
        print(f'  ERR {word}: {e}')

print(f'\nAudio URLs collected: {len(audio_urls)}')
print(f'  UK: {uk_downloads}, US fallback: {us_fallback}, missing: {missing}, failed: {failed}')

# Download audio files
print('\n=== Downloading audio files ===')
downloaded = 0
skipped = 0
errors = 0

for word in sorted(audio_urls.keys()):
    url, region = audio_urls[word]
    fname = f'{word}.mp3'
    fpath = os.path.join(AUDIO_DIR, fname)
    
    # Skip if already exists with reasonable size
    if os.path.exists(fpath) and os.path.getsize(fpath) > 5000:
        skipped += 1
        continue
    
    try:
        r2 = session.get(url, timeout=15)
        if r2.status_code == 200 and len(r2.content) > 5000:
            with open(fpath, 'wb') as f:
                f.write(r2.content)
            downloaded += 1
            if downloaded % 20 == 0:
                print(f'  Downloaded {downloaded}...')
        else:
            errors += 1
            print(f'  BAD {word}: status={r2.status_code} size={len(r2.content)}')
    except Exception as e:
        errors += 1
        print(f'  ERR {word}: {e}')
    time.sleep(0.1)  # Rate limit

print(f'\nDownloaded: {downloaded}, Skipped: {skipped}, Errors: {errors}')
total = len([f for f in os.listdir(AUDIO_DIR) if f.endswith('.mp3')])
print(f'Total files in {AUDIO_DIR}: {total}')

# Save URL map for reference
with open(r'F:\pu-spelling-game\dict_audio_map.json', 'w', encoding='utf-8') as f:
    json.dump({k: v[0] for k, v in audio_urls.items()}, f, indent=2, ensure_ascii=False)
print('Saved: dict_audio_map.json')
