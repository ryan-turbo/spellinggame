
# Match PU1 images to words based on position
import pdfplumber
import os
import re
from PIL import Image

PDF_PATH = r"F:\PU\PU1\power up 1 级别.pdf"
OUTPUT_DIR = r"F:\pu-spelling-game\web\public\images"

def clean_word(word):
    """Clean word for filename"""
    return word.strip().lower()

def get_word_image_filename(word):
    """Get image filename for a word"""
    clean = word.lower().replace(" ", "_").replace("-", "_")
    return f"{clean}.png"

# Collect all words from PDF with their positions
all_pages_data = []

with pdfplumber.open(PDF_PATH) as pdf:
    for page_idx, page in enumerate(pdf.pages):
        text = page.extract_text() or ""
        lines = text.strip().split("\n")
        
        # Get unit info from first line
        unit_line = lines[0] if lines else ""
        
        # Extract words (skip first line with unit info)
        words = []
        for line in lines[1:]:
            word = line.strip()
            if word and not word.lower().startswith("name"):
                words.append(word.lower())
        
        # Get images with positions
        images = []
        for img in page.images:
            w = img["x1"] - img["x0"]
            h = img["bottom"] - img["top"]
            if 50 <= w <= 300 and 50 <= h <= 300:
                images.append({
                    "y": img["top"],
                    "x": img["x0"],
                    "w": w,
                    "h": h,
                    "img": img,
                })
        
        # Sort images by y position (top to bottom)
        images.sort(key=lambda x: (round(x["y"] / 80) * 80, x["x"]))  # Group by row (~80px each)
        
        all_pages_data.append({
            "page": page_idx + 1,
            "unit": unit_line,
            "words": words,
            "images": images,
        })

# Match words to images by page
# Strategy: match in order - first word matches first image, etc.
# (PDF appears to list words in same order as images vertically)

word_image_pairs = []

for page_data in all_pages_data:
    page_num = page_data["page"]
    words = page_data["words"]
    images = page_data["images"]
    
    print(f"\nPage {page_num}: {len(words)} words, {len(images)} images")
    
    # If counts match, pair them directly
    if len(words) == len(images):
        for i, (word, img) in enumerate(zip(words, images)):
            word_image_pairs.append({
                "page": page_num,
                "word": word,
                "img": img["img"],
                "w": img["w"],
                "h": img["h"],
            })
            print(f"  {word} -> image {i+1}")
    else:
        # For mismatch, match by position
        # Assume images are in vertical order matching words
        min_len = min(len(words), len(images))
        print(f"  (Mismatch: matching first {min_len})")
        for i in range(min_len):
            word_image_pairs.append({
                "page": page_num,
                "word": words[i],
                "img": images[i]["img"],
                "w": images[i]["w"],
                "h": images[i]["h"],
            })
            print(f"  {words[i]} -> image {i+1}")

print(f"\nTotal matched: {len(word_image_pairs)} pairs")

# Write mapping to JSON
import json
mapping = {pair["word"]: get_word_image_filename(pair["word"]) for pair in word_image_pairs}
with open("pu1_word_image_map.json", "w", encoding="utf-8") as f:
    json.dump(mapping, f, indent=2, ensure_ascii=False)
print(f"Saved mapping to pu1_word_image_map.json")
