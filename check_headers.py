import os

audio_dir = r'F:\pu-spelling-game\web\public\audio\phonics'

for fname in ['ph_a.mp3', 'ph_b.mp3', 'ph_bl.mp3', 'ph_br.mp3']:
    path = os.path.join(audio_dir, fname)
    sz = os.path.getsize(path)
    with open(path, 'rb') as f:
        header = f.read(8)
    print(f'{fname}: {sz} bytes, header: {header.hex()}')
    if header[:4] == b'\x1a\x45\xdf\xa3':
        print('  -> WebM/Matroska')
    elif header[:3] == b'ID3':
        print('  -> MP3 with ID3')
    elif header[:4] == b'fLaC':
        print('  -> FLAC')
    else:
        print(f'  -> Unknown: {header[:8]}')
