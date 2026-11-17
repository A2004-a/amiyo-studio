import os
import sys
import collections
from PIL import Image, ImageFilter

src_path = r"C:/Users/amiyo garai/.gemini/antigravity/brain/ed134396-8aef-4305-bdf6-efee209c8adc/.user_uploaded/media_1794916466269_8276a3c9.jpg"
if not os.path.exists(src_path):
    print("Error: Source file does not exist:", src_path)
    sys.exit(1)

root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
assets_icons = os.path.join(root_dir, "assets", "icons")
build_dir = os.path.join(root_dir, "build")
android_res = os.path.join(root_dir, "android", "app", "src", "main", "res")

os.makedirs(assets_icons, exist_ok=True)
os.makedirs(build_dir, exist_ok=True)

raw_img = Image.open(src_path)
raw_img.save(os.path.join(assets_icons, "logo-raw.jpg"), quality=95)
print("Saved raw image to assets/icons/logo-raw.jpg")

# Process transparent alpha for outer background
img_rgba = raw_img.convert("RGBA")
w, h = img_rgba.size
pix = img_rgba.load()

visited = bytearray(w * h)
q = collections.deque([(0, 0), (w-1, 0), (0, h-1), (w-1, h-1)])
for x, y in q:
    visited[y * w + x] = 1

while q:
    x, y = q.popleft()
    for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
        nx, ny = x + dx, y + dy
        if 0 <= nx < w and 0 <= ny < h and not visited[ny * w + nx]:
            r, g, b, a = pix[nx, ny]
            # Outer white background
            if r >= 242 and g >= 242 and b >= 242:
                visited[ny * w + nx] = 1
                q.append((nx, ny))

# Create smooth alpha mask
alpha_mask = Image.new("L", (w, h), 255)
mask_pix = alpha_mask.load()
for y in range(h):
    for x in range(w):
        if visited[y * w + x]:
            mask_pix[x, y] = 0

# Apply subtle antialiasing blur to the mask boundary
alpha_mask = alpha_mask.filter(ImageFilter.GaussianBlur(radius=0.7))

# Put alpha channel
img_transparent = img_rgba.copy()
img_transparent.putalpha(alpha_mask)

# Save master logo PNG
logo_png_path = os.path.join(assets_icons, "logo.png")
img_transparent.save(logo_png_path, "PNG")
print(f"Saved master transparent logo: {logo_png_path}")

# Generate all root web icon sizes
sizes = {
    "icon-512.png": (512, 512),
    "icon-192.png": (192, 192),
    "icon-180.png": (180, 180),
    "icon-64.png": (64, 64),
    "icon-32.png": (32, 32),
    "icon-16.png": (16, 16)
}

for name, sz in sizes.items():
    out_path = os.path.join(assets_icons, name)
    resized = img_transparent.resize(sz, Image.Resampling.LANCZOS)
    resized.save(out_path, "PNG")
    print(f"Saved {name} ({sz[0]}x{sz[1]})")

# Generate favicon.ico in root and assets
ico_sizes = [(16, 16), (32, 32), (48, 48), (64, 64)]
favicon_path = os.path.join(root_dir, "favicon.ico")
img_transparent.save(favicon_path, format="ICO", sizes=ico_sizes)
img_transparent.save(os.path.join(assets_icons, "favicon.ico"), format="ICO", sizes=ico_sizes)
print("Saved favicon.ico")

# Generate build/icon.ico for Windows desktop (16 to 256)
win_ico_sizes = [(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
build_ico_path = os.path.join(build_dir, "icon.ico")
img_transparent.save(build_ico_path, format="ICO", sizes=win_ico_sizes)
print(f"Saved Windows desktop icon: {build_ico_path}")

# Generate build/icon.png for Linux & macOS (512x512)
build_png_path = os.path.join(build_dir, "icon.png")
icon_512 = img_transparent.resize((512, 512), Image.Resampling.LANCZOS)
icon_512.save(build_png_path, "PNG")
print(f"Saved Linux/macOS desktop icon: {build_png_path}")

# Generate Android mipmap icons
android_mipmaps = {
    "mipmap-mdpi": (48, 48),
    "mipmap-hdpi": (72, 72),
    "mipmap-xhdpi": (96, 96),
    "mipmap-xxhdpi": (144, 144),
    "mipmap-xxxhdpi": (192, 192)
}

for folder, sz in android_mipmaps.items():
    fpath = os.path.join(android_res, folder)
    os.makedirs(fpath, exist_ok=True)
    icon_out = os.path.join(fpath, "ic_launcher.png")
    # For Android launcher icon, render cleanly with padding so it looks great in circles & squares
    target_canvas = Image.new("RGBA", sz, (0, 0, 0, 0))
    # Scale content to fit comfortably with 4% padding
    inner_w = int(sz[0] * 0.92)
    inner_h = int(sz[1] * 0.92)
    offset_x = (sz[0] - inner_w) // 2
    offset_y = (sz[1] - inner_h) // 2
    content = img_transparent.resize((inner_w, inner_h), Image.Resampling.LANCZOS)
    target_canvas.paste(content, (offset_x, offset_y), content)
    target_canvas.save(icon_out, "PNG")
    print(f"Saved Android {folder}/ic_launcher.png ({sz[0]}x{sz[1]})")

# Create SVG wrapper logo for vector references
svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ff7a3d" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#0a0908" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <circle cx="256" cy="256" r="250" fill="url(#bgGlow)"/>
  <image href="logo.png" x="16" y="16" width="480" height="480" preserveAspectRatio="xMidYMid meet"/>
</svg>'''
with open(os.path.join(assets_icons, "logo.svg"), "w", encoding="utf-8") as f:
    f.write(svg_content)
print("Updated assets/icons/logo.svg")

print("\n--- ALL LOGO ASSETS GENERATED SUCCESSFULLY ---")
