from PIL import Image

img = Image.open('banner.gif')
print(f"Size: {img.size}")
print(f"Mode: {img.mode}")
print(f"Frames: {getattr(img, 'n_frames', 1)}")

# Check corner pixels
w, h = img.size
corners = [(0, 0), (w-1, 0), (0, h-1), (w-1, h-1)]
print("Corner pixels:")
for x, y in corners:
    pixel = img.getpixel((x, y))
    print(f"  ({x}, {y}): {pixel}")
