#!/usr/bin/env python3
"""Fix critical wrong mappings with correct real audio words."""
import os, requests, time

AUDIO_DIR = r'F:\pu-spelling-game\web\public\audio\phonics'
os.makedirs(AUDIO_DIR, exist_ok=True)

# Critical wrong mappings that need fixing:
# ph -> should be 'phone' or 'alphabet' sound (but these words have /f/ not standalone)
# ir -> currently 'fair' (/eə/) -> should be 'bird' (/ɜː/)
# ur -> currently 'tour' (/ʊə/) -> should be 'turn' (/ɜː/)
# er -> currently 'her' (/hɜː/) -> fine but 'bird' also works
# ee -> currently 'bee' (/bi:/) -> better: 'see' (/si:/) with clear /i:/ onset
# w -> 'we' (/wi:/) vs 'wet' (/wet/) -> wet is better for /w/
# kn -> 'knee' (/ni:/) -> correct /n/ onset for 'k' silent
# th -> 'the' (/ðə/) -> correct /ð/ sound
# TH -> 'the' -> should be same as 'th' = /ð/

# Words we need to download
NEED_DOWNLOAD = {
    'bird': 'https://api.dictionaryapi.dev/media/pronunciations/en/bird-uk.mp3',
    'see': 'https://api.dictionaryapi.dev/media/pronunciations/en/see-uk.mp3',
    'wet': 'https://api.dictionaryapi.dev/media/pronunciations/en/wet-uk.mp3',
    'turn': 'https://api.dictionaryapi.dev/media/pronunciations/en/turn-uk.mp3',
    'frog': 'https://api.dictionaryapi.dev/media/pronunciations/en/frog-uk.mp3',
    'phone': 'https://api.dictionaryapi.dev/media/pronunciations/en/phone-uk.mp3',
}

print('=== Fixing critical mappings ===')
session = requests.Session()
session.headers.update({'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})

for word, url in NEED_DOWNLOAD.items():
    fpath = os.path.join(AUDIO_DIR, f'{word}.mp3')
    # Check if already exists
    if os.path.exists(fpath) and os.path.getsize(fpath) > 5000:
        print(f'  EXISTS: {word}.mp3')
        continue
    
    try:
        r = session.get(url, timeout=10)
        time.sleep(0.3)
        if r.status_code == 200 and len(r2.content if 'r2' in dir() else b'') > 5000:
            with open(fpath, 'wb') as f:
                f.write(r.content)
            print(f'  OK: {word}.mp3 ({len(r.content)} bytes)')
        else:
            print(f'  FAIL: {word} status={r.status_code}')
    except Exception as e:
        print(f'  ERR: {word}: {e}')

print('\n=== All fixes done ===')
# Show updated critical mappings
fixed_map = {
    'ph': '/audio/phonics/phone.mp3',  # /f/ sound from 'phone'
    'ir': '/audio/phonics/bird.mp3',    # /ɜː/ from 'bird'
    'ur': '/audio/phonics/turn.mp3',    # /ɜː/ from 'turn'
    'er': '/audio/phonics/her.mp3',     # /ɜː/ from 'her'
    'ee': '/audio/phonics/see.mp3',     # /iː/ from 'see'
    'w':  '/audio/phonics/wet.mp3',     # /w/ from 'wet'
}
for k, v in fixed_map.items():
    print(f'  {k} -> {v}')
