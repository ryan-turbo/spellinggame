#!/usr/bin/env python3
"""
Generate missing phoneme audio files and fix double-prefix issue.
"""
import asyncio, edge_tts, os, time, re

OutDir = r'F:\pu-spelling-game\web\public\audio\phonics'
VOICE = 'en-GB-RyanNeural'

# Missing syllables and what to generate them from
# Format: key -> (tts_text, trim_ms)
MISSING_MAP = {
    # Single letter C (cat gives /k/, city gives /s/)
    'c':      ('cat',         300),
    # qu combination (queen = /kw/)
    'qu':     ('queen',        350),
    # Multisyllabic parts
    'am':     ('example',      350),   # /ɪɡˈzæmpəl/ — /æ/ in 3rd syllable
    'bit':    ('rabbit',       350),   # /ˈræbɪt/ — /ɪ/ in 2nd
    'ble':    ('table',        400),   # /ˈteɪbl/ — /bəl/ part
    'la':     ('umbrella',     350),   # /la/ from 3rd syllable
    'bt':     ('doubt',        300),   # /daʊt/ — bt silent
    'ne':     ('knee',         300),   # /niː/ — 'ee' sound
    'ty':     ('city',         300),   # /ˈsɪti/ — /tɪ/ end
    'brel':   ('umbrella',     350),   # /brel/ from umbrella
    'en':     ('listen',       350),   # /ˈlɪsn̩/ — /sn/ part
    'mb':     ('climb',        350),   # /klaɪm/ — 'm' from climb
    'ke':     ('make',         350),   # /meɪk/ — /k/ from make
    'est':    ('honest',       350),   # /ˈɒnɪst/ — /ɪst/ end
    'me':     ('home',         350),   # /həʊm/ — /m/ from home
    'te':     ('cute',         350),   # /kjuːt/ — /t/ from cute
    'cil':    ('pencil',       350),   # /ˈpensɪl/ — /sɪl/ part
    'tal':    ('hospital',     350),   # /ˈhɒspɪtl/ — /tl/ end
    'tas':    ('fantastic',    350),   # /fænˈtæstɪk/ — /tæs/ part
    'tic':    ('fantastic',    350),   # /fænˈtæstɪk/ — /tɪk/ part
    'ta':     ('table',        300),   # /ˈteɪbl/ — /teɪ/ part
    've':     ('give',         300),   # /ɡɪv/ — /v/ from give
}

async def gen_one(key, tts_text, keep_ms):
    fname = f'ph_{key}.mp3'
    fpath = os.path.join(OutDir, fname)
    tmp_dir = os.environ.get('TEMP', '/tmp')
    tmp_path = os.path.join(tmp_dir, f'ph_{key}_{os.getpid()}.mp3')
    
    try:
        comm = edge_tts.Communicate(tts_text, voice=VOICE, rate='+8%')
        await comm.save(tmp_path)
        time.sleep(0.15)
        
        size = os.path.getsize(tmp_path)
        if size < 500:
            os.remove(tmp_path)
            return ('fail', key, tts_text, 'too small')
        
        if os.path.exists(fpath):
            try: os.remove(fpath); time.sleep(0.1)
            except: pass
        
        with open(tmp_path, 'rb') as src:
            data = src.read()
        with open(fpath, 'wb') as dst:
            dst.write(data)
        os.remove(tmp_path)
        
        return ('ok', key, tts_text, size)
    except Exception as ex:
        if os.path.exists(tmp_path):
            try: os.remove(tmp_path)
            except: pass
        return ('fail', key, tts_text, str(ex))

async def main():
    print(f'=== Generate Missing Phoneme Audio ===')
    print(f'Voice: {VOICE}\n')
    
    items = list(MISSING_MAP.items())
    ok = skip = fail = 0
    
    for i, (key, (tts_text, ms)) in enumerate(items):
        fpath = os.path.join(OutDir, f'ph_{key}.mp3')
        
        if os.path.exists(fpath) and os.path.getsize(fpath) > 500:
            skip += 1
            print(f'  [{i+1}/{len(items)}] [SKIP] ph_{key} (exists)')
            continue
        
        r = await gen_one(key, tts_text, ms)
        if r[0] == 'ok':
            ok += 1
            print(f'  [{i+1}/{len(items)}] [OK]   ph_{key:8s} -> {tts_text:15s} ({r[3]}b)')
        else:
            fail += 1
            print(f'  [{i+1}/{len(items)}] [FAIL] ph_{key:8s} -> {tts_text:15s} : {r[3]}')
    
    print(f'\n=== {ok} ok, {skip} skipped, {fail} failed ===')
    
    # Retry failed
    if fail > 0:
        print('\nRetrying failed...')
        await asyncio.sleep(3)
        failed_items = [(k, v[0]) for k, v in MISSING_MAP.items()]
        for key, tts_text in failed_items:
            fpath = os.path.join(OutDir, f'ph_{key}.mp3')
            if os.path.exists(fpath) and os.path.getsize(fpath) > 500:
                ok += 1; fail -= 1
                continue
            r = await gen_one(key, tts_text, 350)
            if r[0] == 'ok':
                ok += 1; fail -= 1
                print(f'  [RETRY OK] ph_{key}')
            else:
                print(f'  [RETRY FAIL] ph_{key} : {r[3]}')
    
    # Fix double-prefix files
    print('\n=== Fixing double-prefix files ===')
    fixed = 0
    for f in os.listdir(OutDir):
        if f.startswith('ph_ph_') and f.endswith('.mp3'):
            wrong = os.path.join(OutDir, f)
            correct_name = f.replace('ph_ph_', 'ph_')
            correct = os.path.join(OutDir, correct_name)
            if os.path.exists(correct):
                # Both exist, delete wrong one
                os.remove(wrong)
                print(f'  Removed duplicate: {f}')
            else:
                os.rename(wrong, correct)
                print(f'  Renamed: {f} -> {correct_name}')
            fixed += 1
    
    print(f'\nFixed {fixed} double-prefix files')
    total = len([f for f in os.listdir(OutDir) if f.startswith('ph_') and f.endswith('.mp3')])
    print(f'Total phoneme files: {total}')

if __name__ == '__main__':
    asyncio.run(main())
