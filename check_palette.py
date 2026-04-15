from PIL import Image

img = Image.open('banner.gif')
palette = img.getpalette()
if palette:
    first_color = tuple(palette[0:3])
    print(f"Palette index 0 color: RGB{first_color}")
    
    # Check if it's black
    if first_color == (0, 0, 0):
        print("First palette color is BLACK - can make transparent")
    else:
        print(f"First palette color is: {first_color}")
