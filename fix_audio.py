"""
修复 phonics 音频文件问题：
1. 重新生成所有 47 个损坏的 ph_*.mp3（< 2000 bytes）
2. 生成缺失的 word 音频（mango.mp3, milkshake.mp3）
3. 文件太小 → 使用 edge-tts 合成

edge-tts 安装：pip install edge-tts
"""
import subprocess, os

AUDIO = r"F:\pu-spelling-game\web\public\audio"
PHONICS_DIR = os.path.join(AUDIO, "phonics")
os.makedirs(PHONICS_DIR, exist_ok=True)

# edge-tts 音色（Ryan 英式发音）
VOICE = "en-GB-RyanNeural"
RATE = "+0%"
PITCH = "+0Hz"

# ── 辅音音素 → 用哪个词的 onset ────────────────────────────────
# 格式：辅音 → (source_word, 时间范围ms)
CONSONANT_WORDS = {
    "b":  ("bat",   0, 100),   # /b/ from bat
    "c":  ("cat",   0, 100),   # /k/ from cat
    "d":  ("dog",   0, 100),   # /d/ from dog
    "f":  ("fish",  0, 100),   # /f/ from fish
    "g":  ("dog",   0, 100),   # /g/ from dog
    "h":  ("hat",   0, 100),   # /h/ from hat
    "j":  ("jam",   0, 120),   # /dʒ/ from jam
    "k":  ("key",   0, 100),   # /k/ from key
    "l":  ("leg",   0, 100),   # /l/ from leg
    "m":  ("map",   0, 100),   # /m/ from map
    "n":  ("net",   0, 100),   # /n/ from net
    "p":  ("pig",   0, 100),   # /p/ from pig
    "r":  ("red",   0, 100),   # /r/ from red
    "s":  ("sun",   0, 100),   # /s/ from sun
    "t":  ("top",   0, 100),   # /t/ from top
    "v":  ("van",   0, 100),   # /v/ from van
    "w":  ("web",   0, 100),   # /w/ from web
    "x":  ("box",   0, 120),   # /ks/ from box
    "y":  ("yes",   0, 100),   # /j/ from yes
    "z":  ("zip",   0, 100),   # /z/ from zip
    # 辅音组合
    "ch": ("chip",  0, 150),   # /tʃ/ from chip
    "sh": ("ship",  0, 150),   # /ʃ/ from ship
    "th": ("think", 0, 150),   # /θ/ from think
    "TH": ("this",  0, 150),   # /ð/ from this
    "wh": ("when",  0, 150),   # /w/ from when
    "ng": ("sing",  1, 200),   # /ŋ/ from sing (offset)
    "nk": ("bank",  1, 200),   # /ŋk/ from bank
    "ck": ("sock",  1, 200),   # /k/ from sock
    "bl": ("black", 0, 150),
    "cl": ("clock", 0, 150),
    "fl": ("flag",  0, 150),
    "fr": ("frog",  0, 150),
    "dr": ("drum",  0, 150),
    "tr": ("tree",  0, 150),
    "cr": ("crab",  0, 150),
    "br": ("brick", 0, 150),
    "sp": ("spoon", 0, 150),
    "st": ("star",  0, 150),
    "sl": ("sleep", 0, 150),
    "sn": ("snake", 0, 150),
    "sw": ("swan",  0, 150),
    "tw": ("twins", 0, 150),
    "kn": ("knee",  0, 150),
    "pl": ("plate", 0, 150),
    "qu": ("queen", 0, 150),
    "sch":("school",0, 150),
    "spr":("spray", 0, 180),
    "str":("street",0, 180),
    "wr": ("wrist", 0, 150),
    "sch":("scholar",0,200),
}

# ── 元音音素 → 用哪个词的开头（稍长） ──────────────────────────
VOWEL_WORDS = {
    "a":   ("cat",   0, 180),   # /æ/
    "e":   ("egg",   0, 180),   # /e/
    "i":   ("bit",   0, 180),   # /ɪ/
    "o":   ("dog",   0, 180),   # /ɒ/
    "u":   ("cup",   0, 180),   # /ʌ/
    "ai":  ("rain",  0, 250),   # /eɪ/
    "ay":  ("day",   0, 250),
    "ee":  ("sheep", 0, 250),   # /iː/
    "ea":  ("leaf",  0, 250),
    "oa":  ("boat",  0, 250),   # /əʊ/
    "oo":  ("moon",  0, 250),   # /uː/
    "ow":  ("rain",  0, 250),
    "oi":  ("coin",  0, 250),
    "oy":  ("boy",   0, 250),
    "ou":  ("mouth", 0, 250),
    "ar":  ("car",   0, 250),   # /ɑː/
    "or":  ("fork",  0, 250),   # /ɔː/
    "ir":  ("bird",  0, 250),   # /ɜː/
    "ur":  ("nurse", 0, 250),
    "er":  ("her",   0, 250),
    "are": ("care",  0, 280),
    "aw":  ("saw",   0, 280),
    "air": ("chair", 0, 280),
    "eer": ("deer",  0, 280),
    "a_e": ("cake",  0, 280),
    # 音节
    "am":  ("lamp",  0, 220),
    "en":  ("pen",   0, 200),
    "um":  ("cup",   0, 220),
    "im":  ("jump",  0, 220),
    "in":  ("pin",   0, 200),
    "on":  ("pond",  0, 220),
    "me":  ("me",    0, 200),
    "ne":  ("me",    0, 200),
    "fan": ("fan",   0, 200),
    "had": ("hat",   0, 220),
    "pen": ("pen",   0, 200),
    "ke":  ("cake",  1, 200),
    "ta":  ("plate", 1, 200),
    "tal": ("metal", 1, 250),
    "tas": ("cats",  1, 220),
    "hos": ("box",   1, 200),
    "la":  ("lamp",  0, 200),
    "pi":  ("pig",   0, 150),
    "bt":  ("rabbit",1, 200),
    "brel":("table", 1, 250),
    "rab": ("rabbit",0, 200),
    "bit": ("bit",   0, 200),
    "ve":  ("have",  0, 150),
    "te":  ("plate", 1, 200),
    "cil": ("pencil",2, 200),
    "tic": ("magic", 2, 200),
    "ty":  ("city",  1, 200),
    "est": ("best",  0, 250),
    "mb":  ("lamb",  1, 200),
}

PHONE_MAP = {**CONSONANT_WORDS, **VOWEL_WORDS}

# ── 需要修复的损坏文件列表 ──────────────────────────────────
BROKEN_PH = {
    "ph_a.mp3", "ph_b.mp3", "ph_bl.mp3", "ph_br.mp3", "ph_c.mp3",
    "ph_ch.mp3", "ph_ck.mp3", "ph_d.mp3", "ph_dr.mp3", "ph_e.mp3",
    "ph_f.mp3", "ph_fan.mp3", "ph_fl.mp3", "ph_g.mp3", "ph_h.mp3",
    "ph_in.mp3", "ph_ke.mp3", "ph_kn.mp3", "ph_l.mp3", "ph_la.mp3",
    "ph_m.mp3", "ph_n.mp3", "ph_ne.mp3", "ph_nk.mp3", "ph_on.mp3",
    "ph_pen.mp3", "ph_ph.mp3", "ph_r.mp3", "ph_s.mp3", "ph_sh.mp3",
    "ph_sp.mp3", "ph_st.mp3", "ph_sw.mp3", "ph_tr.mp3", "ph_tw.mp3",
    "ph_u.mp3", "ph_ve.mp3", "ph_w.mp3", "ph_x.mp3",
}

# ── 工具函数 ─────────────────────────────────────────────────
def get_outpath(key):
    return os.path.join(PHONICS_DIR, f"ph_{key}.mp3")

def get_word_audio_path(word):
    """从 audio 目录找词音频文件"""
    # 文件名用下划线替换空格
    fname = word.replace(" ", "_") + ".mp3"
    return os.path.join(AUDIO, fname)

def synthesize_and_trim(word, start_ms, end_ms, out_path):
    """用 edge-tts 合成一个词，然后裁剪保留 start_ms ~ end_ms"""
    tmp_wav = out_path.replace(".mp3", "_tmp.wav")
    tmp_mp3 = out_path.replace(".mp3", "_tmp.mp3")
    
    # 1. 合成完整词音频
    subprocess.run([
        "edge-tts", "--voice", VOICE, "--text", word, "--write-media", tmp_mp3
    ], check=True, capture_output=True)
    
    # 2. 转wav方便裁剪
    subprocess.run([
        "ffmpeg", "-y", "-i", tmp_mp3, tmp_wav
    ], check=True, capture_output=True)
    
    # 3. 裁剪（毫秒）
    subprocess.run([
        "ffmpeg", "-y", "-i", tmp_wav",
        "-ss", str(start_ms / 1000),
        "-t",   str((end_ms - start_ms) / 1000),
        "-ar", "44100", "-ac", "1",
        out_path
    ], check=True, capture_output=True)
    
    # 清理
    for f in (tmp_wav, tmp_mp3):
        try: os.remove(f)
        except: pass

def synthesize_word(word, out_path):
    """合成词音频"""
    subprocess.run([
        "edge-tts", "--voice", VOICE, "--text", word, "--write-media", out_path
    ], check=True, capture_output=True)

def file_ok(path, min_bytes=500):
    return os.path.exists(path) and os.path.getsize(path) >= min_bytes

# ── 主流程 ───────────────────────────────────────────────────
print("=== 1. 修复损坏的 ph_ 音频文件 ===")
fixed = 0
for key, (word, start, end) in PHONE_MAP.items():
    out = get_outpath(key)
    ph_name = f"ph_{key}.mp3"
    if ph_name in BROKEN_PH or not file_ok(out, 500):
        print(f"  [{fixed+1}] Regenerating {ph_name} from '{word}' [{start}-{end}ms]...")
        try:
            synthesize_and_trim(word, start, end, out)
            sz = os.path.getsize(out)
            print(f"       → {sz} bytes ✓")
            fixed += 1
        except Exception as e:
            print(f"       → ERROR: {e}")
    else:
        print(f"  SKIP {ph_name} (OK: {os.path.getsize(out)} bytes)")

print(f"\nFixed {fixed}/{len(PHONE_MAP)} phoneme files")

print("\n=== 2. 修复 0 字节词音频 ===")
missing_words = ["mango", "milkshake"]
for w in missing_words:
    out = os.path.join(AUDIO, f"{w}.mp3")
    sz = os.path.getsize(out) if os.path.exists(out) else 0
    if sz < 100:
        print(f"  Synthesizing {w}.mp3...")
        try:
            synthesize_word(w, out)
            print(f"  → {os.path.getsize(out)} bytes ✓")
        except Exception as e:
            print(f"  → ERROR: {e}")
    else:
        print(f"  SKIP {w}.mp3 (OK: {sz} bytes)")

print("\n=== 完成 ===")
