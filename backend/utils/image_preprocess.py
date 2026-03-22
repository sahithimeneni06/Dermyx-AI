import numpy as np
from PIL import Image
import io
import tensorflow as tf

def preprocess_image(img_input, target_size=(224, 224)):
    """
    Preprocess image for EfficientNetB0.
    Returns normalized image array ready for prediction.
    """
    try:
        # Load image
        if isinstance(img_input, str):
            img = Image.open(img_input)
        else:
            img = Image.open(io.BytesIO(img_input.read()))

        # Ensure RGB
        if img.mode != 'RGB':
            img = img.convert('RGB')

        # Resize
        img = img.resize(target_size, Image.Resampling.LANCZOS)

        # Convert to numpy array and normalize to [0, 1]
        img_array = np.array(img, dtype=np.float32) / 255.0

        # Add batch dimension
        img_array = np.expand_dims(img_array, axis=0)

        return img_array
        
    except Exception as e:
        print(f"Error preprocessing image: {e}")
        raise