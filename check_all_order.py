import pdfplumber

PDF_PATH = r"F:\PU\PU1\power up 1 级别.pdf"

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

with pdfplumber.open(PDF_PATH) as pdf:
    mismatched_pages = []
    
    for page_idx in range(21):
        page = pdf.pages[page_idx]
        page_num = page_idx + 1
        
        imgs = [img for img in page.images 
                if (img['x1']-img['x0']) > 50 and (img['bottom']-img['top']) > 50 
                and (img['x1']-img['x0']) < 300 and (img['bottom']-img['top']) < 300]
        
        sorted_imgs = sorted(imgs, key=lambda x: (x['top'], x['x0']))
        
        # Check if original order matches sorted order
        same = all(abs(a['top']-b['top']) < 0.1 and abs(a['x0']-b['x0']) < 0.1 
                   for a, b in zip(imgs, sorted_imgs))
        
        if not same:
            mismatched_pages.append(page_num)
            print(f"\nPage {page_num} - ORDER MISMATCH!")
            print(f"  Original vs Sorted:")
            for i, (orig, sortd) in enumerate(zip(imgs, sorted_imgs)):
                o_cy = (orig['top']+orig['bottom'])/2
                s_cy = (sortd['top']+sortd['bottom'])/2
                o_cx = (orig['x0']+orig['x1'])/2
                s_cx = (sortd['x0']+sortd['x1'])/2
                marker = " <-- DIFF" if abs(o_cy - s_cy) > 0.1 else ""
                word = WORDS_PER_PAGE.get(page_num, ["?"]*len(imgs))
                w = word[i] if i < len(word) else "?"
                print(f"    img#{i:02d}: orig=({o_cx:.0f},{o_cy:.0f}) sort=({s_cx:.0f},{s_cy:.0f}) -> should be: {w}{marker}")
    
    if not mismatched_pages:
        print("All pages have correct extraction order!")
    else:
        print(f"\nMismatched pages: {mismatched_pages}")
