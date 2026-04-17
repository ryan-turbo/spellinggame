import pdfplumber
from collections import defaultdict

PDF_PATH = r"F:\PU\PU1\power up 1 级别.pdf"

with pdfplumber.open(PDF_PATH) as pdf:
    for page_idx in [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]:  # Pages 9-21
        page = pdf.pages[page_idx]
        page_num = page_idx + 1
        
        print(f"\n=== Page {page_num} ===")
        
        # Images sorted by position
        imgs = [img for img in page.images 
                if (img['x1']-img['x0']) > 50 and (img['bottom']-img['top']) > 50 
                and (img['x1']-img['x0']) < 300 and (img['bottom']-img['top']) < 300]
        imgs_sorted = sorted(imgs, key=lambda x: (x['top'], x['x0']))
        print(f"  Images: {len(imgs_sorted)}")
        
        # Text lines - find word labels
        by_y = defaultdict(list)
        for c in page.chars:
            if c['text'].strip():
                by_y[round(c['top'], 0)].append(c)
        
        word_lines = []
        for y in sorted(by_y.keys()):
            chars_at_y = sorted(by_y[y], key=lambda c: c['x0'])
            text = ''.join(c['text'] for c in chars_at_y).strip()
            if text and len(text) < 50 and any(c.isalpha() for c in text):
                # Skip headers like "Name_________Unit..."
                if 'Unit' not in text and 'Name' not in text:
                    word_lines.append(text)
        
        print(f"  Words: {word_lines}")
