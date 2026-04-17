#!/usr/bin/env python3
"""Retry failed Free Dictionary API calls with better error handling."""
import requests, os, sys, json, time

sys.stdout.reconfigure(encoding='utf-8')

MAIN_AUDIO = r'F:\pu-spelling-game\web\public\audio'
PHONICS_AUDIO = r'F:\pu-spelling-game\web\public\audio\phonics'
os.makedirs(PHONICS_AUDIO, exist_ok=True)

# The missing words from first run
missing_words = [
    'be','bug','burn','by','care','castle','cent','child','chip','city','clap','class',
    'clean','cod','coin','comb','come','corn','crab','cross','crown','cube','curl','cute',
    'cv','cvc','cvce','cycle','day','dead','debt','do','doubt','draw','dream','drink',
    'drum','exact','gem','girl','go','got','graph','grow','gym','have','he','heir',
    'hen','her','here','hi','hill','him','home','honest','hope','hour','how','hurt',
    'jam','jet','join','joy','jug','king','kit','knife','knock','know','lamb','late',
    'like','listen','long','look','loud','lunch','make','man','me','milk','mix','net',
    'pot','queen','quick','quiet','rat','read','ring','royal','said','sail','say',
    'school','see','share','she','sing','sit','slow','snail','so','soap','sock','soil',
    'some','song','soon','spray','spread','spring','stay','street','strip','strong',
    'sure','table','tail','tap','ten','term','that','vc/cv','vet','vine','wait','was',
    'way','we','web','what','when','where','which','win','wish','with','wolf','wrap',
    'wrist','write','wrong','yak','yell','yes','zero','zip','zoo'
]

# Also check existing files
existing_main = {f.replace('.mp3', '').replace('_', ' ') for f in os.listdir(MAIN_AUDIO) if f.endswith('.mp3')}
existing_phonics = {f.replace('.mp3', '') for f in os.listdir(PHONICS_AUDIO) if f.endswith('.mp3')}

print(f'Existing in main: {len(existing_main)}')
print(f'Existing in phonics: {len(existing_phonics)}')
print(f'Need to download: {len(missing_words)}')

# Retry with delays
session = requests.Session()
session.headers.update({'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'})

ok_count = 0
fail_count = 0
no_audio_count = 0

for i, word in enumerate(missing_words):
    # Skip if already in either directory
    if word in existing_main or word in existing_phonics:
        print(f'  [{i+1}/{len(missing_words)}] SKIP {word} (already exists)')
        continue
    
    url = f'https://api.dictionaryapi.dev/api/v2/entries/en/{word}'
    try:
        r = session.get(url, timeout=10)
        time.sleep(0.5)  # Rate limit protection
        
        if r.status_code == 404:
            fail_count += 1
            print(f'  [{i+1}/{len(missing_words)}] NOT FOUND {word}')
            continue
        
        if r.status_code != 200:
            print(f'  [{i+1}/{len(missing_words)}] HTTP {r.status_code} {word}')
            time.sleep(2)  # Back off
            continue
        
        data = r.json()
        if isinstance(data, list) and len(data) > 0:
            data = data[0]
        
        audios = []
        for ph in data.get('phonetics', []):
            audio = ph.get('audio', '')
            if audio:
                audios.append(audio)
        
        if not audios:
            no_audio_count += 1
            print(f'  [{i+1}/{len(missing_words)}] NO AUDIO {word}')
            continue
        
        # Prefer UK, else first available
        uk_audio = next((a for a in audios if 'uk' in a.lower() or '-gb' in a.lower()), None)
        audio_url = uk_audio or audios[0]
        
        # Download
        r2 = session.get(audio_url, timeout=15)
        time.sleep(0.3)
        
        if r2.status_code == 200 and len(r2.content) > 5000:
            fpath = os.path.join(PHONICS_AUDIO, f'{word}.mp3')
            with open(fpath, 'wb') as f:
                f.write(r2.content)
            ok_count += 1
            print(f'  [{i+1}/{len(missing_words)}] OK {word} ({len(r2.content)}b)')
        else:
            print(f'  [{i+1}/{len(missing_words)}] DOWNLOAD FAIL {word} status={r2.status_code}')
    
    except Exception as e:
        print(f'  [{i+1}/{len(missing_words)}] ERROR {word}: {str(e)[:50]}')
        time.sleep(2)

print(f'\n=== Done: {ok_count} downloaded, {fail_count} not in API, {no_audio_count} no audio ===')

# Final count
total_main = len([f for f in os.listdir(MAIN_AUDIO) if f.endswith('.mp3')])
total_phonics = len([f for f in os.listdir(PHONICS_AUDIO) if f.endswith('.mp3')])
print(f'Total main: {total_main}, phonics: {total_phonics}')
