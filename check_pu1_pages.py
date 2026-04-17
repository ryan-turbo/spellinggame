import pdfplumber
from collections import defaultdict
import json

PDF_PATH = r"F:\PU\PU1\power up 1 级别.pdf"

with pdfplumber.open(PDF_PATH) as pdf:
    for page_idx in [0, 1, 2, 13]:  # Pages 1, 2, 3, 14
        page = pdf.pages[page_idx]
        page_num = page_idx + 1
        
        print(f"\n{'='*60}")
        print(f"=== Page {page_num} ===")
        
        # Images sorted by position
        imgs = [img for img in page.images 
                if (img['x1']-img['x0']) > 50 and (img['bottom']-img['top']) > 50 
                and (img['x1']-img['x0']) < 300 and (img['bottom']-img['top']) < 300]
        imgs_sorted = sorted(imgs, key=lambda x: (x['top'], x['x0']))
        
        print(f"  Images ({len(imgs_sorted)}):")
        for i, img in enumerate(imgs_sorted):
            x0, top, x1, bottom = img['x0'], img['top'], img['x1'], img['bottom']
            cx, cy = (x0+x1)/2, (top+bottom)/2
            print(f"    #{i+1}: center=({cx:.0f},{cy:.0f}) size={x1-x0:.0f}x{bottom-top:.0f}")
        
        # Text lines
        print(f"  Text:")
        by_y = defaultdict(list)
        for c in page.chars:
            if c['text'].strip():
                by_y[round(c['top'], 0)].append(c)
        
        for y in sorted(by_y.keys()):
            chars_at_y = sorted(by_y[y], key=lambda c: c['x0'])
            text = ''.join(c['text'] for c in chars_at_y).strip()
            if text and len(text) < 50 and any(c.isalpha() for c in text):
                x = chars_at_y[0]['x0']
                print(f"    y={y:.0f}: \"{text}\" (x={x:.0f})")
