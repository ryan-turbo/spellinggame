
# Extract images from PU1 PDF - similar to PU2/PU3 approach
import pdfplumber
import os
from PIL import Image
import io
import re

PDF_PATH = r"F:\PU\PU1\power up 1 级别.pdf"
OUTPUT_DIR = "web/public/images"

os.makedirs(OUTPUT_DIR, exist_ok=True)

def clean_word(word):
    """Clean word for filename"""
    return word.lower().replace(" ", "_").replace("-", "_")

word_image_map = {}
all_images = []

with pdfplumber.open(PDF_PATH) as pdf:
    for page_idx, page in enumerate(pdf.pages):
        print(f"Processing page {page_idx + 1}/{len(pdf.pages)}...")
        
        # Extract words from page
        text = page.extract_text() or ""
        lines = text.strip().split("\n")
        
        # Find unit info
        unit_match = re.search(r"Unit\s*(\w+)", lines[0]) if lines else None
        
        # Extract words (skip first line with unit info)
        words = []
        for line in lines[1:]:
            word = line.strip().lower()
            if word and not word.startswith("name"):
                words.append(word)
        
        # Extract images
        images = page.images
        print(f"  Found {len(images)} images, {len(words)} words")
        
        # Match images to words by y-coordinate
        for img in images:
            img_y = img["top"]
            img_h = img["height"]
            img_y_center = img_y + img_h / 2
            
            # Find closest word to this image
            # Words are typically above their images
            for word in words:
                # Store image with y-center for later matching
                all_images.append({
                    "page": page_idx + 1,
                    "y_center": img_y_center,
                    "x0": img["x0"],
                    "width": img["width"],
                    "height": img["height"],
                    "image_obj": img,
                })

# Now we need a different approach - extract all images and sort by position
# Then match with all words in order

print(f"\nTotal images found: {len(all_images)}")

# Let's try extracting images directly and saving them
with pdfplumber.open(PDF_PATH) as pdf:
    img_idx = 0
    for page_idx, page in enumerate(pdf.pages):
        print(f"\nPage {page_idx + 1}:")
        
        # Get page object for image extraction
        for img_obj in page.images:
            try:
                # Get the raw image data
                x0, top, x1, bottom = img_obj["x0"], img_obj["top"], img_obj["x1"], img_obj["bottom"]
                width = x1 - x0
                height = bottom - top
                
                # Skip very small images (likely artifacts)
                if width < 50 or height < 50:
                    continue
                
                # Skip very large images
                if width > 300 or height > 300:
                    continue
                
                img_idx += 1
                print(f"  Image {img_idx}: {width:.0f}x{height:.0f} at ({x0:.0f}, {top:.0f})")
                
            except Exception as e:
                print(f"  Error: {e}")

print(f"\nTotal valid images: {img_idx}")
