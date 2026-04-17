#!/usr/bin/env python3
import requests, os, time

session = requests.Session()
session.headers['User-Agent'] = 'Mozilla/5.0'

for word in ['wet', 'net', 'pig', 'fox', 'zip', 'yak', 'jam', 'van', 'bee']:
    try:
        r = session.get(f'https://api.dictionaryapi.dev/api/v2/entries/en/{word}', timeout=8)
        time.sleep(0.3)
        if r.status_code == 200:
            data = r.json()[0]
            audios = [ph.get('audio', '') for ph in data.get('phonetics', []) if ph.get('audio')]
            print(f'{word}: {audios}')
        else:
            print(f'{word}: HTTP {r.status_code}')
    except Exception as e:
        print(f'{word}: ERROR {e}')
