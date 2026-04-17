#!/usr/bin/env python3
"""
用 edge-tts 生成音素音频（ph_*.mp3）。
策略：单字母发字母音（辅音清辅音送气短，元音发字母音），
多字母发含该音素的词，截取前N ms。
"""
import asyncio, edge_tts, os, time

VOICE = 'en-GB-RyanNeural'

async def gen(text, out_path, skip_exist=True):
    if skip_exist and os.path.exists(out_path):
        sz = os.path.getsize(out_path)
        if sz > 2000:
            return True
    try:
        await edge_tts.Communicate(text, VOICE).save(out_path)
        sz = os.path.getsize(out_path) if os.path.exists(out_path) else 0
        print(f'  OK {os.path.basename(out_path)} ({sz}B) "{text}"')
        return True
    except Exception as e:
        print(f'  FAIL {out_path}: {e}')
        return False

async def main():
    base = r'F:\pu-spelling-game\web\public\audio\phonics'

    # (key, tts_text)
    # 辅音：用含该音素的词，TTS能正确发单字母音
    # 元音：发字母音 (a='ay', e='ee', etc.)
    items = [
        # 单字母辅音（直接发字母，干净）
        ('b',   'b'),
        ('c',   'c'),
        ('d',   'd'),
        ('f',   'f'),
        ('g',   'g'),
        ('h',   'h'),
        ('j',   'j'),
        ('k',   'k'),
        ('l',   'l'),
        ('m',   'm'),
        ('n',   'n'),
        ('p',   'p'),
        ('r',   'r'),
        ('s',   's'),
        ('t',   't'),
        ('v',   'v'),
        ('w',   'w'),
        ('y',   'y'),
        ('z',   'z'),
        ('x',   'ks'),
        # 元音字母发字母音
        ('a',   'ay'),
        ('e',   'ee'),
        ('i',   'eye'),
        ('o',   'oh'),
        ('u',   'yoo'),
        # 元音组合
        ('ai',  'rain'),
        ('ay',  'day'),
        ('ee',  'see'),
        ('ea',  'tea'),
        ('oa',  'boat'),
        ('oo',  'moon'),
        ('ow',  'cow'),
        ('oi',  'coin'),
        ('oy',  'boy'),
        ('ou',  'out'),
        # r-controlled
        ('ar',  'car'),
        ('or',  'door'),
        ('ir',  'bird'),
        ('ur',  'turn'),
        ('er',  'her'),
        ('are', 'care'),
        # 辅音二合字母
        ('ch',  'chip'),
        ('sh',  'ship'),
        ('ph',  'fish'),
        ('th',  'think'),
        ('TH',  'this'),
        ('wh',  'what'),
        ('ng',  'sing'),
        ('nk',  'bank'),
        # 辅音组合
        ('bl',  'blue'),
        ('cl',  'clap'),
        ('fl',  'fly'),
        ('fr',  'frog'),
        ('dr',  'drum'),
        ('tr',  'tree'),
        ('cr',  'crab'),
        ('br',  'bread'),
        ('sp',  'spoon'),
        ('st',  'star'),
        ('sl',  'slow'),
        ('sn',  'snail'),
        ('sw',  'swim'),
        ('tw',  'twin'),
        ('kn',  'knee'),
        ('wr',  'write'),
        ('sch', 'school'),
        ('spr', 'spray'),
        ('str', 'street'),
        ('ck',  'back'),
        # 特殊音节
        ('ble', 'table'),
        ('bit', 'rabbit'),
        ('cil', 'pencil'),
        ('tic', 'ticket'),
        ('ty',  'city'),
        ('est', 'west'),
        ('ve',  'give'),
        ('te',  'late'),
        ('me',  'me'),
        ('ne',  'knee'),
        ('pen', 'pen'),
        ('ke',  'bike'),
        ('ta',  'table'),
        ('tal', 'tall'),
        ('mb',  'comb'),
        ('rab', 'crab'),
        ('tas', 'fantastic'),
        ('hos', 'hospital'),
        ('la',  'apple'),
        ('pi',  'pig'),
        ('bt',  'debt'),
        ('brel','umbrella'),
        ('am',  'jam'),
        ('en',  'ten'),
        ('um',  'drum'),
        ('im',  'him'),
        ('in',  'bin'),
        ('on',  'on'),
    ]

    done = 0
    failed = []
    for key, text in items:
        out = os.path.join(base, f'ph_{key}.mp3')
        ok = await gen(text, out)
        if ok:
            done += 1
        else:
            failed.append(key)
        await asyncio.sleep(0.12)

    print(f'\nDone: {done}/{len(items)}, failed: {failed}')

    # Report sizes
    print('\nClip sizes:')
    for f in sorted(os.listdir(base)):
        if f.startswith('ph_') and f.endswith('.mp3'):
            p = os.path.join(base, f)
            print(f'  {f}: {os.path.getsize(p)}B')

if __name__ == '__main__':
    asyncio.run(main())
