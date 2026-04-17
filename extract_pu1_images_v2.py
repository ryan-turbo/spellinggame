
# Extract PU1 images from PDF with proper cropping
# Based on successful PU2/PU3 extraction

import pdfplumber
import os
from PIL import Image
import io

PDF_PATH = r"F:\PU\PU1\power up 1 级别.pdf"
OUTPUT_DIR = r"F:\pu-spelling-game\web\public\images"

os.makedirs(OUTPUT_DIR, exist_ok=True)

def extract_images_from_pdf():
    """Extract images from PDF and save them"""
    
    with pdfplumber.open(PDF_PATH) as pdf:
        total_images = 0
        
        for page_idx, page in enumerate(pdf.pages):
            page_num = page_idx + 1
            
            # Convert page to image for cropping
            pil_page = page.to_image(resolution=150)
            pil_img = pil_page.original
            
            # Get all images with their bounding boxes
            for img_idx, img in enumerate(page.images):
                x0, top, x1, bottom = img["x0"], img["top"], img["x1"], img["bottom"]
                width = x1 - x0
                height = bottom - top
                
                # Skip small or too large images
                if width < 50 or height < 50:
                    continue
                if width > 250 or height > 250:
                    continue
                
                # Scale coordinates for 150 DPI (pdfplumber uses 72 DPI internally)
                scale = 150 / 72
                crop_box = (
                    int(x0 * scale),
                    int(top * scale),
                    int(x1 * scale),
                    int(bottom * scale)
                )
                
                # Crop and save
                try:
                    cropped = pil_img.crop(crop_box)
                    
                    # Generate filename
                    total_images += 1
                    filename = f"pu1_img_{total_images:03d}.png"
                    filepath = os.path.join(OUTPUT_DIR, filename)
                    cropped.save(filepath, "PNG")
                    
                    print(f"Page {page_num}: {filename} ({width:.0f}x{height:.0f})")
                except Exception as e:
                    print(f"Page {page_num}: Error - {e}")
        
        print(f"\nTotal images extracted: {total_images}")

if __name__ == "__main__":
    extract_images_from_pdf()
