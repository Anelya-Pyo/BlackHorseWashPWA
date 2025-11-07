"""
convert_images.py

Small helper to generate cropped/resized WebP images from the `image/` folder.
Usage:
  pip install pillow
  python scripts/convert_images.py

This script will create files like `image/foo-480.webp`, `image/foo-800.webp`, `image/foo-1200.webp`
by center-cropping images to the desired aspect ratio and resizing.
"""
from PIL import Image
from pathlib import Path

# Configuration: list of filenames to process (relative to repo root `image/`)
FILES = [
    'shampoo-car.jpg',
    'lustrant-voiture.jpg',
    'micro-fibre.jpg',
    'interieur-voiture.jpg',
    'exterieur-voiture.jpg',
    'lavage-les-2.jpg'
]

# Desired aspect ratios per group (width/height)
PRODUCT_RATIO = (4, 3)  # products/services
ABONNEMENT_RATIO = (3, 2)

# Output widths (px)
SIZES = [480, 800, 1200]

IMAGE_DIR = Path(__file__).resolve().parents[1] / 'image'

def center_crop(im, target_ratio):
    w, h = im.size
    target_w, target_h = target_ratio
    target_ratio_val = target_w / target_h
    current_ratio = w / h

    if current_ratio > target_ratio_val:
        # image too wide -> crop left/right
        new_w = int(h * target_ratio_val)
        offset = (w - new_w) // 2
        box = (offset, 0, offset + new_w, h)
    else:
        # image too tall -> crop top/bottom
        new_h = int(w / target_ratio_val)
        offset = (h - new_h) // 2
        box = (0, offset, w, offset + new_h)
    return im.crop(box)


def process_file(filename, aspect_ratio=PRODUCT_RATIO):
    input_path = IMAGE_DIR / filename
    if not input_path.exists():
        print(f"Skipping missing file: {input_path}")
        return

    try:
        im = Image.open(input_path).convert('RGB')
        cropped = center_crop(im, aspect_ratio)

        base = input_path.stem
        for s in SIZES:
            out_name = f"{base}-{s}.webp"
            out_path = IMAGE_DIR / out_name
            resized = cropped.resize((s, int(s * aspect_ratio[1] / aspect_ratio[0])), Image.LANCZOS)
            resized.save(out_path, format='WEBP', quality=80)
            print(f"Saved {out_path}")
    except Exception as e:
        print(f"Error processing {input_path}: {e}")


if __name__ == '__main__':
    # Process product images with PRODUCT_RATIO
    product_files = FILES[:3]
    service_files = FILES[3:]

    for f in product_files + service_files:
        process_file(f, PRODUCT_RATIO)

    # Note: abonnement images can be processed manually if desired
    print('\nDone. Now update your HTML to reference the generated webp files (srcset).')
