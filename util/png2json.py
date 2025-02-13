#! /usr/bin/env python3

from PIL import Image
import json

# Define image files (replace with your actual filenames)
image_files = ["frame0.png", "frame1.png"]  # Update with actual file paths

# Define LED matrix dimensions
MATRIX_SIZE = 16

# Function to extract pixel colors from an image
def image_to_frame(image_path):
    img = Image.open(image_path).convert("RGB")  # Convert to RGB mode
    pixels = list(img.getdata())  # Get all pixels as a flat list
    frame = [f"#{r:02X}{g:02X}{b:02X}" for r, g, b in pixels]  # Convert to #RRGGBB
    return frame

# Convert all images to frames
frames = [image_to_frame(image) for image in image_files]

# Create JSON structure
animation_data = {
    "id": 4,
    "timing": 500,  # 100ms per frame
    "frame_amount": len(frames),
    "data": frames
}

# Save JSON to a file
json_filename = "animation.json"
with open(json_filename, "w") as json_file:
    json.dump(animation_data, json_file, indent=2)

print(f"JSON animation file '{json_filename}' created successfully!")
