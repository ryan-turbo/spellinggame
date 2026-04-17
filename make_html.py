import cv2, base64, os

frames_dir = r'F:\pu-spelling-game\frames'
key_frames = [0, 2, 5, 11, 17, 18, 20, 22, 24]

html = '<html><body style="background:#111;margin:0;padding:20px">'
for sec in key_frames:
    path = os.path.join(frames_dir, 'key_{:02d}s.png'.format(sec))
    with open(path, 'rb') as f:
        b64 = base64.b64encode(f.read()).decode()
    html += '<p style="color:#fff;font-family:sans-serif">t={}s</p><img src="data:image/png;base64,{}" style="max-width:600px;border:1px solid #444;margin-bottom:16px"><br>'.format(sec, b64)

html += '</body></html>'
out = os.path.join(frames_dir, 'preview.html')
with open(out, 'w', encoding='utf-8') as f:
    f.write(html)

print('HTML preview written to', out)
