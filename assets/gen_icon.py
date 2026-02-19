#!/usr/bin/env python3
"""TechnoJaw Icon Generator — Symbol-only logo (no text) for clear app icon"""
from PIL import Image, ImageDraw, ImageChops, ImageFilter
import os, subprocess

SIZE = 1024
OUT = os.path.dirname(os.path.abspath(__file__))
SVG_PATH = f'{OUT}/technojaw-symbol.svg'  # Symbol-only (no "technojaw" text)

# ─── Step 1: Dark background with subtle gradient ───
bg = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
bg_draw = ImageDraw.Draw(bg)
bg_draw.rounded_rectangle((0, 0, SIZE - 1, SIZE - 1), radius=220, fill=(245, 245, 240, 255))
bg_draw.rounded_rectangle((3, 3, SIZE - 4, SIZE - 4), radius=218, fill=(245, 245, 240, 255))

# ─── Background glows — teal top-right, subtle blue bottom-left ───
glow_layer = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
gd = ImageDraw.Draw(glow_layer)
# Top-right teal accent
for r in range(400, 0, -2):
    a = int(12 * (r / 400))
    gd.ellipse([720 - r, 80 - r + 80, 720 + r, 80 + r + 80], fill=(40, 200, 190, a))
# Bottom-left subtle blue
for r in range(300, 0, -2):
    a = int(8 * (r / 300))
    gd.ellipse([250 - r, 780 - r, 250 + r, 780 + r], fill=(60, 120, 200, a))
# Center glow behind logo
cx, cy = SIZE // 2, SIZE // 2
for r in range(350, 0, -3):
    a = int(10 * (r / 350))
    gd.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(50, 180, 170, a))

bg = Image.alpha_composite(bg, glow_layer)

# ─── Step 2: Render SVG to PNG ───
svg_png = f'{OUT}/_temp_logo.png'

ret = os.system(f'which rsvg-convert > /dev/null 2>&1')
if ret == 0:
    os.system(f'rsvg-convert -w {SIZE} -h {SIZE} "{SVG_PATH}" -o "{svg_png}"')
    print('SVG rendered via rsvg-convert')
else:
    os.system(f'qlmanage -t -s {SIZE} -o "{OUT}" "{SVG_PATH}" 2>/dev/null')
    ql_out = f'{SVG_PATH}.png'
    if os.path.exists(ql_out):
        os.rename(ql_out, svg_png)
        print('SVG rendered via qlmanage')
    else:
        existing_png = f'{OUT}/technojaw-icon.png'
        if os.path.exists(existing_png):
            from shutil import copy2
            copy2(existing_png, svg_png)
            print('Using existing PNG as source')
        else:
            print('⚠️  Could not render SVG. Install rsvg-convert: brew install librsvg')
            exit(1)

# ─── Step 3: Composite logo onto background with glow halo ───
logo = Image.open(svg_png).convert('RGBA').resize((SIZE, SIZE), Image.LANCZOS)

logo_size = int(SIZE * 0.88)  # Larger — no text, just the symbol
logo_small = logo.resize((logo_size, logo_size), Image.LANCZOS)
offset = (SIZE - logo_size) // 2

# Create a glow behind the logo — blur a bright version
logo_glow = logo_small.copy()
# Make it brighter teal
glow_data = logo_glow.load()
for y in range(logo_size):
    for x in range(logo_size):
        r, g, b, a = glow_data[x, y]
        if a > 30:
            glow_data[x, y] = (40, 200, 190, min(a, 100))
logo_glow_layer = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
logo_glow_layer.paste(logo_glow, (offset, offset), logo_glow)
logo_glow_layer = logo_glow_layer.filter(ImageFilter.GaussianBlur(radius=12))

bg = Image.alpha_composite(bg, logo_glow_layer)

# Paste actual logo
logo_layer = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
logo_layer.paste(logo_small, (offset, offset), logo_small)
img = Image.alpha_composite(bg, logo_layer)

# ─── Step 4: Mask to rounded rect ───
mask = Image.new('L', (SIZE, SIZE), 0)
mask_draw = ImageDraw.Draw(mask)
mask_draw.rounded_rectangle((0, 0, SIZE - 1, SIZE - 1), radius=220, fill=255)
img.putalpha(mask)

# ─── Save outputs ───
img.save(f'{OUT}/technojaw-icon.png')
print('✅ Main icon saved')

iconset_dir = f'{OUT}/technojaw-icon.iconset'
os.makedirs(iconset_dir, exist_ok=True)
for s in [16, 32, 64, 128, 256, 512, 1024]:
    img.resize((s, s), Image.LANCZOS).save(f'{iconset_dir}/icon_{s}x{s}.png')
    if s <= 512:
        img.resize((s * 2, s * 2), Image.LANCZOS).save(f'{iconset_dir}/icon_{s}x{s}@2x.png')
print('✅ Iconset generated')

img.resize((16, 16), Image.LANCZOS).save(f'{OUT}/technojaw-tray.png')
img.resize((32, 32), Image.LANCZOS).save(f'{OUT}/technojaw-tray@2x.png')
print('✅ Tray icons generated')

os.system(f'iconutil -c icns "{iconset_dir}" -o "{OUT}/technojaw-icon.icns"')
print('✅ ICNS built')

if os.path.exists(svg_png):
    os.remove(svg_png)
print('✅ Done!')
