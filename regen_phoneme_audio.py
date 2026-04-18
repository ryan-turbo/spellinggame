import asyncio
import edge_tts
import os
import subprocess

async def generate_phoneme_from_word(phoneme, word, output_file):
    """生成音素音频：从单词中提取开头部分"""
    # 估算每个音素大约 0.3 秒
    # 对于单辅音如 /b/, /t/，约 0.2-0.3 秒
    # 对于元音如 /eɪ/，约 0.3-0.4 秒
    
    # 先生成完整单词音频
    communicate = edge_tts.Communicate(word, 'en-GB-RyanNeural')
    temp_file = output_file.replace('.mp3', '_temp.mp3')
    await communicate.save(temp_file)
    
    # 根据音素类型估算时长
    if phoneme in ['b', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'w', 'z']:
        # 辅音：较短
        duration = 0.25
    elif phoneme in ['eɪ', 'i:', 'aɪ', 'əʊ', 'u:', 'ɔ:', 'ɑ:', 'ʌ']:
        # 长元音：较长
        duration = 0.4
    else:
        # 短元音和其他
        duration = 0.3
    
    # 使用 ffmpeg 提取开头部分
    cmd = f'ffmpeg -y -i "{temp_file}" -ss 0 -t {duration} -c copy "{output_file}"'
    subprocess.run(cmd, shell=True, capture_output=True)
    
    # 删除临时文件
    if os.path.exists(temp_file):
        os.remove(temp_file)
    
    print(f"Generated {output_file}")

async def main():
    base_dir = 'F:/pu-spelling-game/web/public/audio/phonics'
    os.makedirs(base_dir, exist_ok=True)
    
    # L1U1 需要的音素：从单词中提取
    phonemes = [
        ('b', 'bat', 'ph_b.mp3'),
        ('a', 'cake', 'ph_a.mp3'),  # a 在 cake 中发 /eɪ/
        ('t', 'top', 'ph_t.mp3'),
        ('d', 'dog', 'ph_d.mp3'),
        ('f', 'fan', 'ph_f.mp3'),
        ('h', 'hat', 'ph_h.mp3'),
        ('j', 'jam', 'ph_j.mp3'),
        ('k', 'kit', 'ph_k.mp3'),
        ('l', 'leg', 'ph_l.mp3'),
        ('m', 'map', 'ph_m.mp3'),
        ('n', 'net', 'ph_n.mp3'),
        ('p', 'pig', 'ph_p.mp3'),
        ('g', 'dog', 'ph_g.mp3'),
        ('r', 'red', 'ph_r.mp3'),
        ('s', 'sun', 'ph_s.mp3'),
        ('w', 'wet', 'ph_w.mp3'),
        ('y', 'yes', 'ph_y.mp3'),
    ]
    
    for phoneme, word, filename in phonemes:
        output_file = os.path.join(base_dir, filename)
        await generate_phoneme_from_word(phoneme, word, output_file)

asyncio.run(main())
