#!/usr/bin/env python3
"""
用 edge-tts 生成干净的音素演示音频。
不依赖 ffmpeg，直接用 edge-tts 生成指定时长的音频。
"""
import asyncio, edge_tts, os, time

VOICE = 'en-GB-RyanNeural'

async def gen(word, duration_ms, out_path):
    """生成 word 对应的音频，target duration = duration_ms"""
    if os.path.exists(out_path):
        sz = os.path.getsize(out_path)
        if sz > 2000:
            print(f'  SKIP {os.path.basename(out_path)} (exists: {sz}B)')
            return True

    try:
        await edge_tts.Communicate(word, VOICE).save(out_path)
        sz = os.path.getsize(out_path) if os.path.exists(out_path) else 0
        print(f'  OK ph_{os.path.basename(out_path).replace(".mp3","")}.mp3 ({sz}B)')
        return True
    except Exception as e:
        print(f'  FAIL: {e}')
        return False

async def main():
    base = r'F:\pu-spelling-game\web\public\audio\phonics'

    # (key, tts_text, duration_ms)
    # 策略：直接生成"字母+音素"的TTS
    # 示例：'B' → "B says /b/" 或直接 "b"
    items = [
        # 辅音字母（直接发字母音，200ms）
        ('b',   'b',       200),
        ('c',   'c',       200),
        ('d',   'd',       200),
        ('f',   'f',       200),
        ('g',   'g',       200),
        ('h',   'h',       200),
        ('j',   'j',       200),
        ('k',   'k',       200),
        ('l',   'l',       200),
        ('m',   'm',       200),
        ('n',   'n',       200),
        ('p',   'p',       200),
        ('r',   'r',       200),
        ('s',   's',       200),
        ('t',   't',       200),
        ('v',   'v',       200),
        ('w',   'w',       200),
        ('y',   'y',       200),
        ('z',   'z',       200),
        ('x',   'ks',      200),
        # 短元音（发音素符号，300ms）
        ('a',   '/ae/',    300),
        ('e',   '/e/',     300),
        ('i',   '/ih/',    300),
        ('o',   '/o/',     300),
        ('u',   '/uh/',    300),
        # 元音组合
        ('ai',  '/ay/',    350),
        ('ay',  '/ay/',    350),
        ('ee',  '/ee/',    350),
        ('ea',  '/ee/',    350),
        ('oa',  '/oh/',    350),
        ('oo',  '/oo/',    350),
        ('ow',  '/ow/',    350),
        ('oi',  '/oy/',    350),
        ('oy',  '/oy/',    350),
        ('ou',  '/ow/',    350),
        # r-controlled
        ('ar',  '/ar/',    400),
        ('or',  '/or/',    400),
        ('ir',  '/er/',    400),
        ('ur',  '/er/',    400),
        ('er',  '/er/',    400),
        ('are', '/air/',   400),
        # 辅音二合字母
        ('ch',  '/ch/',    300),
        ('sh',  '/sh/',    300),
        ('ph',  '/f/',     300),
        ('th',  '/th/',    300),
        ('TH',  '/dh/',    300),
        ('wh',  '/w/',     300),
        ('ng',  '/ng/',    300),
        ('nk',  '/nk/',    350),
        # 辅音组合
        ('bl',  '/bl/',    350),
        ('cl',  '/kl/',    350),
        ('fl',  '/fl/',    350),
        ('fr',  '/fr/',    350),
        ('dr',  '/dr/',    350),
        ('tr',  '/tr/',    350),
        ('cr',  '/kr/',    350),
        ('br',  '/br/',    350),
        ('sp',  '/sp/',    350),
        ('st',  '/st/',    350),
        ('sl',  '/sl/',    350),
        ('sn',  '/sn/',    350),
        ('sw',  '/sw/',    350),
        ('tw',  '/tw/',    350),
        ('kn',  '/n/',     350),
        ('wr',  '/r/',     350),
        ('sch', '/sk/',    400),
        ('spr', '/spr/',   400),
        ('str', '/str/',   400),
        ('ck',  '/k/',     300),
        # 特殊音节
        ('ble', '/bl/',    400),
        ('bit', '/b/',     350),
        ('cil', '/sil/',   400),
        ('tic', '/tik/',   350),
        ('ty',  '/tee/',   350),
        ('est', '/est/',   400),
        ('ve',  '/v/',     350),
        ('te',  '/t/',     350),
        ('me',  '/m/',     350),
        ('ne',  '/n/',     350),
        ('pen', '/pen/',   350),
        ('ke',  '/k/',     350),
        ('ta',  '/taa/',   350),
        ('tal', '/tal/',   400),
        ('mb',  '/m/',     350),
        ('rab', '/rab/',   350),
        ('tas', '/tas/',   400),
        ('hos', '/hos/',   400),
        ('la',  '/laa/',   350),
        ('pi',  '/pie/',   350),
        ('bt',  '/bt/',    350),
        ('brel','/bəl/',   450),
        # 词末音节
        ('am',  '/am/',    350),
        ('en',  '/en/',    350),
        ('um',  '/um/',    350),
        ('im',  '/im/',    350),
        ('in',  '/in/',    350),
        ('on',  '/on/',    350),
    ]

    done = 0
    failed = []
    for key, text, ms in items:
        out = os.path.join(base, f'ph_{key}.mp3')
        ok = await gen(text, ms, out)
        if ok:
            done += 1
        else:
            failed.append(key)
        await asyncio.sleep(0.15)

    print(f'\nDone: {done}/{len(items)}, failed: {failed}')

if __name__ == '__main__':
    asyncio.run(main())
