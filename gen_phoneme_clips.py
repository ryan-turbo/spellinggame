#!/usr/bin/env python3
"""
用 ffmpeg 截取 MP3 前 N ms 作为音素音频。
不依赖任何 Python 音频库，只调用 ffmpeg.exe。
"""
import os, subprocess, sys, time

FFMPEG = r'C:\Users\ryan0\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.WinGet.Artifacts.5d83b2388fbe16a9_Microsoft.WindowsPackageManager.Manifest_8wekyb3d8bbwe\ffmpeg-8.1-full_build\bin\ffmpeg.exe'

def run(cmd):
    result = subprocess.run(cmd, capture_output=True, shell=False)
    return result.returncode == 0

def trim(src, dst, ms):
    """ffmpeg -ss 0 -t {ms}ms -c copy (fast but may not be byte-accurate)"""
    tmp = dst + '.tmp.mp3'
    cmd = [
        FFMPEG, '-y',
        '-ss', '0',
        '-t', f'{ms/1000:.3f}',
        '-i', src,
        '-acodec', 'libmp3lame',
        '-q:a', '2',
        '-ar', '44100',
        tmp
    ]
    ok = run(cmd)
    if ok:
        if os.path.exists(dst):
            os.remove(dst)
        os.rename(tmp, dst)
        src_sz = os.path.getsize(src)
        dst_sz = os.path.getsize(dst)
        print(f'  {os.path.basename(src)} -> {os.path.basename(dst)}: {src_sz}B -> {dst_sz}B ({ms}ms)')
    else:
        print(f'  FAIL: {src}')
        if os.path.exists(tmp):
            os.remove(tmp)
    return ok

def main():
    base = r'F:\pu-spelling-game\web\public\audio\phonics'

    phonemes = [
        # (phoneme_key, source_word, trim_ms)
        # 单辅音（截取 ~150-180ms 音素 onset）
        ('b',   'bat.mp3',   180),
        ('c',   'cat.mp3',   180),
        ('d',   'dog.mp3',   180),
        ('f',   'fish.mp3',  200),
        ('g',   'go.mp3',    150),
        ('h',   'hat.mp3',   150),
        ('j',   'jam.mp3',   200),
        ('k',   'cat.mp3',   180),
        ('l',   'lion.mp3',  200),
        ('m',   'me.mp3',    200),
        ('n',   'net.mp3',   180),
        ('p',   'pig.mp3',   180),
        ('r',   'red.mp3',   200),
        ('s',   'sun.mp3',   180),
        ('t',   'top.mp3',   180),
        ('v',   'van.mp3',   200),
        ('w',   'wet.mp3',   180),
        ('y',   'yes.mp3',   150),
        ('z',   'zip.mp3',   180),
        ('x',   'box.mp3',   150),
        # 短元音（需要稍长 ~250ms）
        ('a',   'hat.mp3',   250),
        ('e',   'bed.mp3',   250),
        ('i',   'sit.mp3',   250),
        ('o',   'pot.mp3',   250),
        ('u',   'bus.mp3',   250),
        # 元音字母组合（350-400ms 覆盖元音）
        ('ai',  'rain.mp3',  350),
        ('ay',  'day.mp3',   350),
        ('ee',  'bee.mp3',   350),
        ('ea',  'tea.mp3',   350),
        ('oa',  'boat.mp3',  350),
        ('oo',  'moon.mp3',  350),
        ('ow',  'cow.mp3',   350),
        ('oi',  'coin.mp3',  350),
        ('oy',  'boy.mp3',   350),
        ('ou',  'out.mp3',   350),
        # r-controlled
        ('ar',  'car.mp3',   400),
        ('or',  'door.mp3',  400),
        ('ir',  'bird.mp3',  400),
        ('ur',  'turn.mp3',  400),
        ('er',  'bird.mp3',  400),
        ('are', 'care.mp3',  400),
        # 辅音二合字母
        ('ch',  'chip.mp3',  280),
        ('sh',  'ship.mp3',  280),
        ('ph',  'phone.mp3', 350),
        ('th',  'think.mp3', 350),
        ('TH',  'this.mp3',  350),
        ('wh',  'what.mp3',  350),
        ('ng',  'sing.mp3',  280),
        ('nk',  'bank.mp3',  350),
        # 辅音组合
        ('bl',  'blue.mp3',  350),
        ('cl',  'clap.mp3',  350),
        ('fl',  'fly.mp3',   350),
        ('fr',  'frog.mp3',  350),
        ('dr',  'drum.mp3',  350),
        ('tr',  'tree.mp3',  350),
        ('cr',  'crab.mp3',  350),
        ('br',  'bread.mp3', 350),
        ('gr',  'frog.mp3',  350),
        ('pr',  'frog.mp3',  350),
        ('sp',  'spoon.mp3', 350),
        ('st',  'star.mp3',  350),
        ('sl',  'slow.mp3',  350),
        ('sn',  'snail.mp3', 350),
        ('sk',  'fish.mp3',  350),
        ('sm',  'me.mp3',    350),
        ('sw',  'swim.mp3',  350),
        ('tw',  'twin.mp3',  350),
        ('kn',  'knee.mp3',  350),
        ('wr',  'write.mp3', 350),
        ('sch', 'school.mp3',400),
        ('scr', 'school.mp3',400),
        ('spr', 'spray.mp3', 400),
        ('str', 'street.mp3',400),
        # 辅音结尾
        ('ck',  'back.mp3',  350),
        ('mp',  'me.mp3',    350),
        ('nd',  'red.mp3',   350),
        ('nt',  'net.mp3',   350),
        ('ft',  'fish.mp3',  350),
        # 词末音节
        ('am',  'jam.mp3',   350),
        ('en',  'bus.mp3',   350),
        ('um',  'bus.mp3',   350),
        ('im',  'pig.mp3',   350),
        ('in',  'net.mp3',   350),
        ('on',  'top.mp3',   350),
        ('op',  'top.mp3',   350),
        ('ot',  'pot.mp3',   350),
        ('ub',  'bus.mp3',   350),
        ('ug',  'bus.mp3',   350),
        ('up',  'bus.mp3',   350),
        ('ap',  'hat.mp3',   350),
        ('ip',  'pig.mp3',   350),
        ('ab',  'hat.mp3',   350),
        ('et',  'bed.mp3',   350),
        ('ed',  'bed.mp3',   350),
        # 特殊音节
        ('ble', 'table.mp3', 400),
        ('bit', 'rabbit.mp3',350),
        ('cil', 'pencil.mp3',400),
        ('tic', 'ticket.mp3',350),
        ('ty',  'city.mp3',  350),
        ('est', 'west.mp3',  400),
        ('ve',  'gave.mp3',  350),
        ('te',  'tea.mp3',   350),
        ('me',  'me.mp3',    350),
        ('ne',  'knee.mp3',  350),
        ('pen', 'pig.mp3',   350),
        ('ke',  'bike.mp3',  350),
        ('ta',  'table.mp3', 350),
        ('tal', 'tall.mp3',  400),
        ('r',   'red.mp3',   250),
        ('mb',  'comb.mp3',  350),
        ('rab', 'rabbit.mp3',350),
        ('tas', 'fantastic.mp3',400),
        ('hos', 'school.mp3',400),
        ('la',  'umbrella.mp3',350),
        ('pi',  'pig.mp3',   350),
        ('bt',  'debt.mp3',  350),
        ('brel','umbrella.mp3',500),
    ]

    done = 0
    skipped = 0
    for key, src_file, ms in phonemes:
        src = os.path.join(base, src_file)
        dst = os.path.join(base, f'ph_{key}.mp3')

        if not os.path.exists(src):
            print(f'  SKIP {src_file} (source not found)')
            skipped += 1
            continue

        src_sz = os.path.getsize(src)
        if src_sz < 5000:
            print(f'  SKIP {src_file} (too small: {src_sz}B)')
            skipped += 1
            continue

        ok = trim(src, dst, ms)
        if ok:
            done += 1
        time.sleep(0.1)  # Rate limit

    print(f'\nDone: {done} clips, skipped: {skipped}')


if __name__ == '__main__':
    main()
