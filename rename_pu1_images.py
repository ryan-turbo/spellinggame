
# Rename PU1 images based on word mapping
# Match words to extracted images by page order

import os
import json
import shutil

IMAGES_DIR = r"F:\pu-spelling-game\web\public\images"

# Word list per page (from PDF extraction)
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

# Image counts per page (from extraction)
IMAGES_PER_PAGE = {
    1: 10, 2: 10, 3: 8, 4: 11, 5: 6, 6: 7, 7: 10, 8: 6,
    9: 8, 10: 9, 11: 8, 12: 10, 13: 11, 14: 11, 15: 8, 16: 9,
    17: 9, 18: 9, 19: 8, 20: 4, 21: 9
}

def get_filename(word):
    """Convert word to filename"""
    return word.lower().replace(" ", "_").replace("-", "_") + ".png"

# Build mapping
word_to_image = {}
missing_words = []

img_counter = 1
for page in sorted(WORDS_PER_PAGE.keys()):
    words = WORDS_PER_PAGE[page]
    img_count = IMAGES_PER_PAGE.get(page, 0)
    
    print(f"\nPage {page}: {len(words)} words, {img_count} images")
    
    for i, word in enumerate(words):
        if i < img_count:
            # Get the source image filename
            src_img = f"pu1_img_{img_counter:03d}.png"
            dst_img = get_filename(word)
            
            src_path = os.path.join(IMAGES_DIR, src_img)
            dst_path = os.path.join(IMAGES_DIR, dst_img)
            
            if os.path.exists(src_path):
                # Rename
                shutil.move(src_path, dst_path)
                word_to_image[word] = dst_img
                print(f"  {word} -> {dst_img}")
            else:
                print(f"  {word} -> MISSING ({src_img})")
            
            img_counter += 1
        else:
            missing_words.append(word)
            print(f"  {word} -> NO IMAGE")

print(f"\n\nTotal matched: {len(word_to_image)}")
print(f"Missing images: {len(missing_words)}")
if missing_words:
    print("Missing words:", missing_words)

# Save mapping
with open("pu1_image_mapping.json", "w", encoding="utf-8") as f:
    json.dump(word_to_image, f, indent=2, ensure_ascii=False)
