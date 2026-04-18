"""
使用 mutagen + edge-tts 重新生成 phonics 音频文件
edge-tts 合成完整词音频 → mutagen 截取帧级别
"""
import os, subprocess, tempfile

AUDIO = r"F:\pu-spelling-game\web\public\audio"
PHONICS_DIR = os.path.join(AUDIO, "phonics")
VOICE = "en-GB-RyanNeural"

os.makedirs(PHONICS_DIR, exist_ok=True)

# ── mutagen MP3 trim ───────────────────────────────────────────
def trim_mp3(input_mp3, output_mp3, start_ms, end_ms):
    """
    用 mutagen 读取 MP3，计算帧偏移并截取
    """
    from mutagen.mp3 import MP3
    from mutagen.mp3 import EasyMP3Tags

    audio = MP3(input_mp3)
    sample_rate = audio.info.sample_rate  # 通常 44100 或 48000
    channels = audio.info.channels or 2

    # 目标样本范围
    start_frame = int(start_ms * sample_rate / 1000)
    end_frame   = int(end_ms   * sample_rate / 1000)

    # 读取所有帧数据
    with open(input_mp3, 'rb') as f:
        raw = f.read()

    # MP3 帧结构：同步头 0xFF 0xFB，然后是 bitrate/index 等
    # mutagen.audio.mp3 模块可以逐帧迭代
    # 使用 mutagen.mp3.MPEG() 逐帧
    try:
        from mutagen.musepack import MusepackError
    except ImportError:
        pass

    from mutagen._util import InsensitiveDict

    # 简化方案：直接用 pydub 读（它可以解析已知 MP3 格式）
    # pydub 需要 ffmpeg，但可以检测是否可读
    try:
        from pydub import AudioSegment
        from pydub.utils import mediainfo_json_path
        
        # 测试 pydub 能否读取（不依赖 ffmpeg）
        # pydub 在没有 ffmpeg 时用 RawSegment
        import pydub.utils as pu
        info = pu.get_audio_length(input_mp3)
        print(f"  pydub duration: {info}s")
    except Exception as e:
        print(f"  pydub failed: {e}")

# ── edge-tts 合成 → 直接用原始文件（不 trim）─────────────────
def synthesize_word(word, out_path):
    """合成词音频文件"""
    subprocess.run([
        "edge-tts", "--voice", VOICE,
        "--text", word,
        "--write-media", out_path
    ], check=True, capture_output=True)
    return out_path

# ── 测试：合成一个词并检查时长 ──────────────────────────────
print("=== 测试 edge-tts ===")
test_out = os.path.join(PHONICS_DIR, "_test_word.mp3")
synthesize_word("bat", test_out)

from mutagen.mp3 import MP3
t = MP3(test_out)
print(f"'bat' duration: {t.info.length:.3f}s, bitrate: {t.info.bitrate}")

os.remove(test_out)
