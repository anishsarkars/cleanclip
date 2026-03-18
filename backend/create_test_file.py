from PIL import Image, ImageDraw
import os

def create_sample_gif(path="test.gif"):
    images = []
    width, height = 100, 100
    for i in range(10):
        # White background
        img = Image.new("RGB", (width, height), (255, 255, 255))
        draw = ImageDraw.Draw(img)
        x = i * 10
        # Red square
        draw.rectangle([x, 40, x+20, 60], fill=(255, 0, 0))
        images.append(img)
    
    # Save as GIF
    images[0].save(path, save_all=True, append_images=images[1:], duration=100, loop=0)
    print(f"✅ Created {os.path.abspath(path)}")

if __name__ == "__main__":
    create_sample_gif("test.gif")
