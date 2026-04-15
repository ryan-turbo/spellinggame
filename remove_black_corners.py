from PIL import Image

# 处理 GIF：把黑色背景（调色板索引 0）转成透明
img = Image.open('banner.gif')
frames = []

n_frames = getattr(img, 'n_frames', 1)
print(f"Processing {n_frames} frames...")

for i in range(n_frames):
    img.seek(i)
    # 转为 RGBA 模式
    frame = img.convert('RGBA')
    pixels = frame.load()
    w, h = frame.size
    
    # 把接近黑色的像素变透明
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            # 如果 RGB 都接近 0（黑色），设为透明
            if r < 10 and g < 10 and b < 10:
                pixels[x, y] = (0, 0, 0, 0)
    
    frames.append(frame.copy())
    print(f"  Frame {i+1}/{n_frames}")

# 保存为新的 GIF
print("Saving...")
frames[0].save(
    'banner_transparent.gif',
    save_all=True,
    append_images=frames[1:],
    loop=img.info.get('loop', 0),
    duration=img.info.get('duration', 100),
    disposal=2,  # 恢复背景
    transparency=0
)

print("Done! Saved as banner_transparent.gif")
