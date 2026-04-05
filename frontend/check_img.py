from PIL import Image

def get_image_size(filepath):
    try:
        with Image.open(filepath) as img:
            print(f"{filepath}: {img.size}")
    except Exception as e:
        print(f"Error reading {filepath}: {e}")

get_image_size('public/remake_logo192.png')
get_image_size('public/remake_logo512.png')
