import pdfplumber

PDF_PATH = r"F:\PU\PU1\power up 1 级别.pdf"

# Extracted image count per page from extract_pu1_images_v2.py
IMAGES_PER_PAGE = {
    1: 10, 2: 10, 3: 8, 4: 11, 5: 6, 6: 7, 7: 10, 8: 6,
    9: 8, 10: 9, 11: 8, 12: 10, 13: 9, 14: 11, 15: 8, 16: 9,
    17: 9, 18: 9, 19: 8, 20: 4, 21: 9
}

WORDS_PER_PAGE = {
    1: ["red", "blue", "yellow", "green", "orange", "purple", "pink", "grey", "black", "white"],
    2: ["bag", "book", "chair", "classroom", "crayon", "desk", "pen", "pencil", "teacher", "pencilcase", "eraser"],
    3: ["ruler", "paper", "playground", "cupboard", "door", "board", "bookcase", "wall", "window"],
    4: ["family", "father", "dad", "mother", "mom", "brother", "sister", "grandfather", "grandpa", "grandmother", "grandma"],
    5: ["hand", "head", "nose", "tail", "leg", "mouth"],
    6: ["arm", "ear", "eye", "face", "body", "feet", "hair"],
    7: ["sheep", "goat", "horse", "donkey", "duck", "cow", "dog", "cat", "chicken", "spider"],
    8: ["sad", "ugly", "funny", "happy", "angry", "beautiful"],
    9: ["mango", "chicken", "chocolate", "burger", "cake", "banana", "bread", "salad", "water", "lemonade"],
    10: ["meatballs", "orange", "juice", "meat", "fruit", "grapes", "apple", "beans", "sausage"],
    11: ["robot", "plane", "house", "kite", "car", "doll", "ball", "bike"],
    12: ["ship", "mouse", "radio", "helicopter", "keyboard", "box", "computer", "balloon", "board game", "teddy"],
    13: ["shop", "lorry", "park", "motorbike", "car", "flower", "garden", "bus", "bus stop", "train", "tree"],
    14: ["snake", "monkey", "hippo", "lizard", "giraffe", "elephant", "bear", "crocodile", "polar bear", "tiger", "zebra"],
    15: ["watch tv", "play basketball", "play football", "play tennis", "play the guitar", "play the piano", "ride a bike", "sport", "swim"],
    16: ["badminton", "baseball", "catching", "hitting", "kicking", "hockey", "running", "skateboarding", "throwing"],
    17: ["mirror", "dining room", "kitchen", "living room", "bed", "bedroom", "bath", "bathroom", "radio"],
    18: ["armchair", "rug", "sofa", "phone", "hall", "lamp", "clock", "floor", "painting"],
    19: ["shorts", "shirt", "jeans", "shoes", "hat", "jacket", "dress", "sunglasses"],
    20: ["boots", "baseball cap", "trousers", "t-shirt"],
    21: ["sun", "sand", "sea", "fishing", "jellyfish", "camera", "fish", "beach", "boat", "shell"],
}

# Check if PDF actual image counts match
with pdfplumber.open(PDF_PATH) as pdf:
    print("Page | Actual_imgs | Expected_imgs | Actual_words | Expected_words | Match?")
    print("-" * 90)
    for page_idx in range(21):
        page = pdf.pages[page_idx]
        page_num = page_idx + 1
        
        imgs = [img for img in page.images 
                if (img['x1']-img['x0']) > 50 and (img['bottom']-img['top']) > 50 
                and (img['x1']-img['x0']) < 300 and (img['bottom']-img['top']) < 300]
        
        actual_count = len(imgs)
        expected_count = IMAGES_PER_PAGE.get(page_num, "?")
        expected_words = len(WORDS_PER_PAGE.get(page_num, []))
        
        match = "OK" if actual_count == expected_count else f"MISMATCH"
        
        # Count word labels
        from collections import defaultdict
        by_y = defaultdict(list)
        for c in page.chars:
            if c['text'].strip():
                by_y[round(c['top'], 0)].append(c)
        
        word_count = 0
        for y in sorted(by_y.keys()):
            chars_at_y = sorted(by_y[y], key=lambda c: c['x0'])
            text = ''.join(c['text'] for c in chars_at_y).strip()
            if text and len(text) < 50 and any(c.isalpha() for c in text):
                if 'Unit' not in text and 'Name' not in text:
                    word_count += 1
        
        img_ok = actual_count == expected_count
        word_ok = word_count == expected_words
        status = "OK" if (img_ok and word_ok) else f"IMG({actual_count}!={expected_count})" if not img_ok else f"WRD({word_count}!={expected_words})"
        
        print(f"  {page_num:2d}  |    {actual_count:2d}       |     {expected_count:>3}       |     {word_count:2d}        |      {expected_words:2d}        | {status}")

# Now show the actual rename mapping
print("\n\n=== RENAME MAPPING (img# -> word) ===")
img_counter = 1
for page in sorted(WORDS_PER_PAGE.keys()):
    words = WORDS_PER_PAGE[page]
    img_count = IMAGES_PER_PAGE.get(page, 0)
    
    for i, word in enumerate(words):
        if i < img_count:
            img_name = f"pu1_img_{img_counter:03d}.png"
            print(f"  {img_name} -> {word}.png")
            img_counter += 1
        else:
            print(f"  [NO IMG]     -> {word}.png (SKIPPED)")
