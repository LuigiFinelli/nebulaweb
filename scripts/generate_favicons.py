"""Generate tightly-cropped transparent favicons from the NebulaWeb logo icon."""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
IMAGES = ROOT / "images"
SOURCE = IMAGES / "logo.png"
OUTPUTS = {
    16: IMAGES / "favicon-16x16.png",
    32: IMAGES / "favicon-32x32.png",
    512: IMAGES / "favicon-512x512.png",
}
LEGACY_FAVICON = IMAGES / "favicon.png"
FILL_RATIO = 0.85
BLACK_THRESHOLD = 45


def remove_black_background(img: Image.Image) -> Image.Image:
    img = img.convert("RGBA")
    pixels = img.load()
    width, height = img.size

    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if r <= BLACK_THRESHOLD and g <= BLACK_THRESHOLD and b <= BLACK_THRESHOLD:
                pixels[x, y] = (r, g, b, 0)

    return img


def crop_icon_from_logo(img: Image.Image) -> Image.Image:
    """Keep only the left-hand N icon (exclude NebulaWeb wordmark)."""
    img = remove_black_background(img)
    width, height = img.size
    column_counts = []

    for x in range(width):
        count = 0
        for y in range(height):
            if img.getpixel((x, y))[3] > 0:
                count += 1
        column_counts.append(count)

    # Find the wide empty gap between icon and text.
    gap_start = None
    gap_end = None
    for x in range(int(width * 0.25), int(width * 0.85)):
        if column_counts[x] == 0:
            if gap_start is None:
                gap_start = x
            gap_end = x
        elif gap_start is not None and (x - gap_end) > 8:
            break

    if gap_start is not None and gap_end is not None and gap_start > width * 0.2:
        icon_width = gap_start + max(4, int((gap_end - gap_start) * 0.35))
    else:
        icon_width = int(width * 0.42)

    icon = img.crop((0, 0, icon_width, height))
    bbox = icon.getbbox()
    return icon.crop(bbox) if bbox else icon


def make_square_favicon(icon: Image.Image, size: int) -> Image.Image:
    bbox = icon.getbbox()
    if not bbox:
        raise ValueError("No visible logo content found after background removal.")

    icon = icon.crop(bbox)
    content_w, content_h = icon.size
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))

    target = int(size * FILL_RATIO)
    scale = target / max(content_w, content_h)
    new_w = max(1, int(content_w * scale))
    new_h = max(1, int(content_h * scale))

    resized = icon.resize((new_w, new_h), Image.Resampling.LANCZOS)
    offset_x = (size - new_w) // 2
    offset_y = (size - new_h) // 2
    canvas.paste(resized, (offset_x, offset_y), resized)
    return canvas


def main() -> None:
    if not SOURCE.exists():
        raise FileNotFoundError(f"Source logo not found: {SOURCE}")

    icon = crop_icon_from_logo(Image.open(SOURCE))

    for size, path in OUTPUTS.items():
        favicon = make_square_favicon(icon, size)
        favicon.save(path, format="PNG", optimize=True)
        print(f"Saved {path.name} ({size}x{size})")

    make_square_favicon(icon, 32).save(LEGACY_FAVICON, format="PNG", optimize=True)
    print(f"Replaced {LEGACY_FAVICON.name}")


if __name__ == "__main__":
    main()
