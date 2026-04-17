#!/usr/bin/env python3
"""Test various pronunciation API sources to find human-recorded audio."""
import requests, re, sys, json

sys.stdout.reconfigure(encoding='utf-8')

def test_url(name, url, headers=None):
    try:
        h = {'User-Agent': 'Mozilla/5.0'} if headers is None else headers
        r = requests.get(url, headers=h, timeout=10)
        print(f'{name}: {r.status_code} | {len(r.content)}B | ct={r.headers.get("content-type","?")[:50]}')
        if r.status_code == 200 and len(r.content) > 1000:
            # Check if it's audio
            ct = r.headers.get('content-type', '')
            if 'audio' in ct or any(x in ct for x in ['application', 'octet']):
                ext = '.mp3' if 'mp3' in ct else '.bin'
                fname = f'test_audio{ext}'
                with open(fname, 'wb') as f:
                    f.write(r.content)
                print(f'  -> Saved as {fname} ({len(r.content)} bytes)')
                return fname
            else:
                print(f'  -> Not audio: {r.text[:200]}')
        return None
    except Exception as e:
        print(f'{name}: ERROR {e}')
        return None

# Test Free Dictionary API (has UK/US audio)
print('=== Free Dictionary API ===')
for word in ['bat', 'cat', 'chair', 'think']:
    url = f'https://api.dictionaryapi.dev/api/v2/entries/en/{word}'
    r = requests.get(url, timeout=10)
    if r.status_code == 200:
        data = r.json()[0]
        audios = []
        for phonetics in data.get('phonetics', []):
            if phonetics.get('audio'):
                audios.append(phonetics['audio'])
        print(f'{word}: {audios[:3]}')
    else:
        print(f'{word}: {r.status_code}')

# Test Cambridge Dictionary audio (direct)
print('\n=== Cambridge Dictionary ===')
for word in ['bat', 'cat', 'chair']:
    # Cambridge uses a specific audio URL format
    # Pattern: https://dictionary.cambridge.org/dictionary/english/{word}
    url = f'https://dictionary.cambridge.org/dictionary/english/{word}'
    h = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
    r = requests.get(url, headers=h, timeout=10)
    if r.status_code == 200:
        # Find audio URLs in the HTML
        audios = re.findall(r'https?://[^"\']*pronun/[^"\']*\.mp3[^"\']*', r.text)
        if not audios:
            audios = re.findall(r'https?://[^"\']*/media/[^"\']*\.mp3[^"\']*', r.text)
        print(f'{word}: {audios[:2]}')
    else:
        print(f'{word}: {r.status_code}')

# Test Merriam-Webster
print('\n=== Merriam-Webster ===')
for word in ['bat', 'cat']:
    url = f'https://www.merriam-webster.com/dictionary/{word}'
    h = {'User-Agent': 'Mozilla/5.0'}
    r = requests.get(url, headers=h, timeout=10)
    if r.status_code == 200:
        audios = re.findall(r'https?://[^"\']* pronunciation[^"\']*\.mp3[^"\']*', r.text, re.I)
        if not audios:
            audios = re.findall(r'https?://[^"\']*media/[^"\']*\.mp3[^"\']*', r.text)
        print(f'{word}: {audios[:2]}')
        if audios:
            # Try to download first audio
            test_url('MW audio', audios[0][:200])
    else:
        print(f'{word}: {r.status_code}')

# Test YouGlish API (unofficial)
print('\n=== YouGlish ===')
for word in ['bat', 'cat']:
    url = f'https://youglish.com/pronounce/{word}/english'
    h = {'User-Agent': 'Mozilla/5.0'}
    r = requests.get(url, headers=h, timeout=10)
    if r.status_code == 200:
        mp3s = re.findall(r'https?://[^"\']*\.mp3[^"\']*', r.text)
        print(f'{word}: {mp3s[:3]}')
    else:
        print(f'{word}: {r.status_code}')

# Try Forvo
print('\n=== Forvo ===')
for word in ['bat', 'cat']:
    # Forvo audio format
    url = f'https://forvo.com mp3/{word}/'
    h = {'User-Agent': 'Mozilla/5.0'}
    r = requests.get(url, headers=h, timeout=10)
    print(f'{word}: {r.status_code}')
