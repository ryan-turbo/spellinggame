#!/usr/bin/env python3
"""
Generate phonics phoneme audio files using edge-tts.
Sequential generation to avoid Windows file locking issues.
"""
import asyncio, edge_tts, os, sys, tempfile, time

OutDir = r'F:\pu-spelling-game\web\public\audio\phonics'
os.makedirs(OutDir, exist_ok=True)

VOICE = 'en-GB-RyanNeural'

# key -> (tts_text, keep_ms)  keep_ms: trim to this many ms from start
PHONEME_MAP = {
    'b':  ('bee',    300), 'd':  ('dog',    300), 'f':  ('fish',   300),
    'g':  ('go',     300), 'h':  ('hat',    300), 'j':  ('jam',    300),
    'k':  ('cat',    300), 'l':  ('lion',   300), 'm':  ('moon',   300),
    'n':  ('net',    300), 'p':  ('pig',    300), 'r':  ('red',    300),
    's':  ('sun',    300), 't':  ('top',    300), 'v':  ('van',    300),
    'w':  ('wet',    300), 'x':  ('fox',    300), 'y':  ('yes',    300),
    'z':  ('zebra',  300),
    'ch': ('chip',   400), 'sh': ('ship',   350), 'th': ('think',  400),
    'TH': ('this',   350), 'wh': ('what',   350), 'ph': ('fish',   350),
    'ng': ('sing',   350), 'nk': ('bank',   350), 'ck': ('duck',   350),
    'a':  ('cat',    400), 'e':  ('bed',    400), 'i':  ('sit',    350),
    'o':  ('hot',    350), 'u':  ('cup',    350),
    'a_e':('make',   400), 'i_e':('make',   400), 'o_e':('home',   400),
    'u_e':('cute',   400), 'e_e':('these',  400),
    'ai': ('rain',   400), 'ay': ('day',    350), 'ee': ('see',    400),
    'ea': ('tea',    400), 'ea_e':('bread', 400), 'oa': ('boat',   400),
    'oo': ('moon',   400), 'oo_s':('book',  400), 'ou': ('out',    350),
    'ow': ('now',    350), 'ow_l':('go',    350), 'oi': ('coin',   400),
    'oy': ('boy',    350),
    'ar': ('car',    400), 'or': ('fork',   450), 'er': ('her',    350),
    'ir': ('bird',   400), 'ur': ('turn',   400), 'air':('hair',   400),
    'ear':('ear',    350), 'are':('care',   400),
    'bl': ('black',  400), 'br': ('bread',  400), 'cl': ('clap',   400),
    'cr': ('crab',   400), 'dr': ('drum',   400), 'fl': ('flag',   400),
    'fr': ('frog',   400), 'gl': ('glass',  400), 'gr': ('green',  400),
    'pl': ('play',   400), 'pr': ('prize',  400), 'sc': ('scar',   400),
    'sk': ('skip',   400), 'sl': ('slip',   400), 'sm': ('smile',  400),
    'sn': ('snake',  400), 'sp': ('spoon',  400), 'spr':('spray',  500),
    'st': ('star',   400), 'str':('street', 500), 'sw': ('swim',   400),
    'tr': ('tree',   400), 'tw': ('twin',   400), 'sch':('school', 450),
    'scr':('scratch',500), 'thr':('three',  500), 'tch':('watch',  450),
    'dge':('bridge', 450),
    'kn': ('knee',   350), 'wr': ('write',  400), 'gh': ('night',  400),
    'pen':('pencil', 400), 'rab':('rabbit', 400), 'hos':('hospital',400),
    'um': ('umbrella',400),'fan':('fantastic',400),
}

async def gen_one(key, tts_text):
    """Generate one phoneme audio file."""
    fname = f'ph_{key}.mp3'
    fpath = os.path.join(OutDir, fname)

    if os.path.exists(fpath) and os.path.getsize(fpath) > 500:
        return ('skip', key, tts_text)

    tmp_dir = tempfile.gettempdir()
    tmp_path = os.path.join(tmp_dir, f'ph_{key}_{os.getpid()}.mp3')

    try:
        rate = '+8%'
        comm = edge_tts.Communicate(tts_text, voice=VOICE, rate=rate)
        await comm.save(tmp_path)
        time.sleep(0.1)  # Let OS release file handle
        
        tmp_size = os.path.getsize(tmp_path)
        if tmp_size < 500:
            os.remove(tmp_path)
            return ('fail', key, tts_text, 'too small')

        if os.path.exists(fpath):
            try: os.remove(fpath)
            except PermissionError:
                time.sleep(0.5)
                try: os.remove(fpath)
                except: pass
        
        # Copy instead of move (avoids Windows lock issues)
        with open(tmp_path, 'rb') as src:
            data = src.read()
        with open(fpath, 'wb') as dst:
            dst.write(data)
        os.remove(tmp_path)
        
        final_size = os.path.getsize(fpath)
        return ('ok', key, tts_text, final_size)
        
    except Exception as ex:
        if os.path.exists(tmp_path):
            try: os.remove(tmp_path)
            except: pass
        return ('fail', key, tts_text, str(ex))

async def main():
    print(f'Voice: {VOICE} | Output: {OutDir}\n')

    items = list(PHONEME_MAP.items())
    ok = skip = fail = 0
    failed_items = []

    for i, (key, (tts_text, _)) in enumerate(items):
        r = await gen_one(key, tts_text)
        if r[0] == 'ok':
            ok += 1
            print(f'  [{i+1}/{len(items)}] [OK]   ph_{key:10s} -> {tts_text:15s} ({r[3]}b)')
        elif r[0] == 'skip':
            skip += 1
            print(f'  [{i+1}/{len(items)}] [SKIP] ph_{key:10s} (exists)')
        else:
            fail += 1
            print(f'  [{i+1}/{len(items)}] [FAIL] ph_{key:10s} -> {tts_text:15s} : {r[3]}')
            failed_items.append((key, tts_text))

    print(f'\n=== {ok} ok, {skip} skipped, {fail} failed ===')

    if failed_items:
        print('\nRetrying failed...')
        await asyncio.sleep(2)
        for key, tts_text in failed_items:
            r = await gen_one(key, tts_text)
            if r[0] == 'ok':
                ok += 1; fail -= 1
                print(f'  [RETRY OK] ph_{key}')
            else:
                print(f'  [RETRY FAIL] ph_{key} : {r[3]}')

    total = len([f for f in os.listdir(OutDir) if f.startswith('ph_')])
    print(f'\nTotal phoneme files: {total}')

if __name__ == '__main__':
    asyncio.run(main())
