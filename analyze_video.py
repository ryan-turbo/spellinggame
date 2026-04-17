import cv2, os, sys

cap = cv2.VideoCapture(r'C:\Users\ryan0\Desktop\Cap 2026-04-17 at 12.45.46.mp4')
fps = cap.get(cv2.CAP_PROP_FPS)

def frame_to_ascii(frame, w=80):
    h, ww = frame.shape[:2]
    scale = w / ww
    small = cv2.resize(frame, (w, int(h*scale)))
    gray = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)
    chars = ' .:-=+*#%@'
    out = []
    for row in gray:
        line = ''
        for pixel in row:
            idx = min(int(pixel / 255 * (len(chars)-1)), len(chars)-1)
            line += chars[idx]
        out.append(line)
    return '\n'.join(out)

key_times = [0, 2, 5, 11, 17, 18, 20, 22, 24]
for sec in key_times:
    idx = int(sec * fps)
    cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
    ret, frame = cap.read()
    if not ret:
        print(f't={sec}s: [no frame]')
        continue
    ascii_art = frame_to_ascii(frame, w=70)
    print(f'=== t={sec}s (frame {idx}) ===')
    print(ascii_art)
    print()

cap.release()
