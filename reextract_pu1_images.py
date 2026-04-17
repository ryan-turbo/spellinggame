"""
Re-extract PU1 images using correct top-to-bottom order per page.
The original extract_pu1_images_v2.py used PDF internal order which was wrong on 5 pages.
"""
import pdfplumber
import os
from PIL import Image

PDF_PATH = r"F:\PU\PU1\power up 1 级别.pdf"
OUTPUT_DIR = r"F:\pu-spelling-game\web\public\images"
DPI = 150
SCALE = DPI / 72

WORDS_PER_PAGE = {
    1: ["red", "blue", "yellow", "green", "orange", "purple", "pink", "grey", "black", "white"],
    2: ["bag", "book", "chair", "classroom", "crayon", "desk", "pen", "pencil", "teacher", "pencilcase", "eraser"],
    3: ["ruler", "paper", "playground", "cupboard", "door", "board", "bookcase", "wall", "window"],
    4: ["family", "father", "dad", "mother", "mom", "brother", "sister", "grandfather", "grandpa", "grandmother", "grandma"],
    5: ["hand", "head", "nose", "tail", "leg", "mouth"],
    6: ["arm", "ear", "eye", "face", "body", "feet", "hair"],
    7: ["sheep", "goat", "horse", "donkey", "duck", "cow", "dog", "cat", "chicken", "spider"],
    8: ["sad", "ugly", "funny", "happy", "angry", "beautiful"],
    9: ["mango", "chocolate", "burger", "cake", "banana", "bread", "salad", "water", "lemonade"],
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

def get_filename(word):
    return word.lower().replace(" ", "_").replace("-", "_") + ".png"

os.makedirs(OUTPUT_DIR, exist_ok=True)

with pdfplumber.open(PDF_PATH) as pdf:
    total_saved = 0
    total_no_img = 0
    
    for page_idx in range(21):
        page = pdf.pages[page_idx]
        page_num = page_idx + 1
        words = WORDS_PER_PAGE.get(page_num, [])
        
        # Get images sorted by top-to-bottom, left-to-right
        imgs = [img for img in page.images 
                if (img['x1']-img['x0']) > 50 and (img['bottom']-img['top']) > 50 
                and (img['x1']-img['x0']) < 300 and (img['bottom']-img['top']) < 300]
        imgs_sorted = sorted(imgs, key=lambda x: (x['top'], x['x0']))
        
        # Convert page to image for cropping
        pil_page = page.to_image(resolution=DPI)
        pil_img = pil_page.original
        
        print(f"\nPage {page_num}: {len(words)} words, {len(imgs_sorted)} images")
        
        for i, word in enumerate(words):
            if i < len(imgs_sorted):
                img = imgs_sorted[i]
                x0, top, x1, bottom = img["x0"], img["top"], img["x1"], img["bottom"]
                
                crop_box = (
                    int(x0 * SCALE),
                    int(top * SCALE),
                    int(x1 * SCALE),
                    int(bottom * SCALE)
                )
                
                cropped = pil_img.crop(crop_box)
                filename = get_filename(word)
                filepath = os.path.join(OUTPUT_DIR, filename)
                cropped.save(filepath, "PNG")
                
                print(f"  {word} -> {filename} ({x1-x0:.0f}x{bottom-top:.0f})")
                total_saved += 1
            else:
                print(f"  {word} -> NO IMAGE")
                total_no_img += 1

print(f"\nTotal saved: {total_saved}, No image: {total_no_img}")
