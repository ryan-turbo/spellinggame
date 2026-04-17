import pdfplumber

PDF_PATH = r"F:\PU\PU1\power up 1 级别.pdf"

# Check if page.images order matches top-to-bottom reading order
with pdfplumber.open(PDF_PATH) as pdf:
    for page_idx in [0, 8, 9, 13]:  # Pages 1, 9, 10, 14
        page = pdf.pages[page_idx]
        page_num = page_idx + 1
        
        imgs = [img for img in page.images 
                if (img['x1']-img['x0']) > 50 and (img['bottom']-img['top']) > 50 
                and (img['x1']-img['x0']) < 300 and (img['bottom']-img['top']) < 300]
        
        print(f"\n=== Page {page_num} ===")
        print(f"  Original order (as extracted):")
        for i, img in enumerate(imgs):
            cy = (img['top'] + img['bottom']) / 2
            cx = (img['x0'] + img['x1']) / 2
            print(f"    img[{i}]: y={cy:.0f} x={cx:.0f}")
        
        sorted_imgs = sorted(imgs, key=lambda x: (x['top'], x['x0']))
        print(f"  Sorted order (top, x0):")
        for i, img in enumerate(sorted_imgs):
            cy = (img['top'] + img['bottom']) / 2
            cx = (img['x0'] + img['x1']) / 2
            print(f"    img[{i}]: y={cy:.0f} x={cx:.0f}")
        
        # Check if original == sorted
        same = True
        for a, b in zip(imgs, sorted_imgs):
            if abs(a['top'] - b['top']) > 0.1 or abs(a['x0'] - b['x0']) > 0.1:
                same = False
                break
        
        print(f"  Order matches: {same}")
