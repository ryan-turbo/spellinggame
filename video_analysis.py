import cv2, numpy as np

cap = cv2.VideoCapture(r'C:\Users\ryan0\Desktop\Cap 2026-04-17 at 12.45.46.mp4')
fps = cap.get(cv2.CAP_PROP_FPS)
cap.set(cv2.CAP_PROP_POS_FRAMES, int(11*fps)); ret11, f11 = cap.read()
cap.set(cv2.CAP_PROP_POS_FRAMES, int(5*fps));  ret5,  f5  = cap.read()
cap.set(cv2.CAP_PROP_POS_FRAMES, int(17*fps)); ret17, f17 = cap.read()
cap.set(cv2.CAP_PROP_POS_FRAMES, int(18*fps)); ret18, f18 = cap.read()
cap.release()

h, w = f11.shape[:2]
print('Resolution: {} x {} (portrait phone)'.format(w, h))

regions = [
    ('0-5% top bar',    0.00, 0.05),
    ('5-20% upper',     0.05, 0.20),
    ('20-50% middle',   0.20, 0.50),
    ('50-80% lower',    0.50, 0.80),
    ('80-95% bottom',   0.80, 0.95),
    ('95-100% bar',     0.95, 1.00),
]

def pct_diff(f1, f2, y0, y1):
    g1 = cv2.cvtColor(f1[int(h*y0):int(h*y1)], cv2.COLOR_BGR2GRAY)
    g2 = cv2.cvtColor(f2[int(h*y0):int(h*y1)], cv2.COLOR_BGR2GRAY)
    diff = cv2.absdiff(g1, g2)
    changed = (diff > 15).sum()
    return changed / diff.size * 100

for name, y0, y1 in regions:
    p1 = pct_diff(f11, f5,  y0, y1)
    p2 = pct_diff(f17, f11, y0, y1)
    p3 = pct_diff(f18, f17, y0, y1)
    print('{:<18} t11-vs-t5={:5.1f}%  t17-vs-t11={:5.1f}%  t18-vs-t17={:5.1f}%'.format(name, p1, p2, p3))

print()
print('=== t=11 vs t=5 changed region ===')
diff = cv2.absdiff(f11, f5)
diff_gray = cv2.cvtColor(diff, cv2.COLOR_BGR2GRAY)
mask = diff_gray > 15
ys, xs = np.where(mask)
if len(ys) > 0:
    print('Changed pixels: {} / {} ({:.1f}%)'.format(len(ys), diff_gray.size, len(ys)/diff_gray.size*100))
    print('Y range: {}-{} (top to bottom)'.format(ys.min(), ys.max()))
    print('X range: {}-{} (left to right)'.format(xs.min(), xs.max()))
    print('Y center: {:.0f}  X center: {:.0f}'.format(ys.mean(), xs.mean()))
    # Y distribution
    bins = np.bincount(ys.astype(int), minlength=h)
    top_bins = np.argsort(bins)[-8:][::-1]
    print('Top changed Y rows: {}'.format([int(b) for b in top_bins]))
    print('As % of screen height: {}'.format([round(b/h*100) for b in top_bins]))
    # X distribution
    xbins = np.bincount(xs.astype(int), minlength=w)
    top_xbins = np.argsort(xbins)[-8:][::-1]
    print('Top changed X cols: {}'.format([int(b) for b in top_xbins]))
    print('As % of screen width: {}'.format([round(b/w*100) for b in top_xbins]))
