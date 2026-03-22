import sys
import os
import cv2
import easyocr
import re
from PIL import Image

def test_extraction(image_path):
    print(f"\n{'='*60}")
    print(f"TESTING INGREDIENT EXTRACTION ON: {image_path}")
    print('='*60)
    
    # Initialize reader
    reader = easyocr.Reader(['en'], gpu=False)
    
    # Read image
    img = cv2.imread(image_path)
    if img is None:
        print("❌ Failed to read image")
        return
    
    print(f"📐 Image size: {img.shape}")
    
    # Try multiple preprocessing methods
    versions = {
        'original': image_path,
    }
    
    # Grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray_path = "test_gray.jpg"
    cv2.imwrite(gray_path, gray)
    versions['grayscale'] = gray_path
    
    # Threshold
    _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    thresh_path = "test_thresh.jpg"
    cv2.imwrite(thresh_path, thresh)
    versions['threshold'] = thresh_path
    
    # Try OCR on each version
    all_text = []
    
    for name, path in versions.items():
        print(f"\n📸 Testing {name}...")
        result = reader.readtext(path, detail=0, paragraph=True)
        text = " ".join(result).lower()
        print(f"  Text: {text[:200]}...")
        all_text.append(text)
    
    # Cleanup
    for path in [gray_path, thresh_path]:
        if os.path.exists(path):
            os.remove(path)
    
    # Combine all text
    combined = " ".join(all_text)
    print(f"\n📝 COMBINED TEXT: {combined[:500]}")
    
    # Try to find ingredients section
    print("\n🔍 LOOKING FOR INGREDIENTS SECTION...")
    
    # Look for common patterns
    patterns = [
        r'ingredients?:?\s*(.+?)(?:\n\n|\Z)',
        r'contains?:?\s*(.+?)(?:\n\n|\Z)',
        r'composition:?\s*(.+?)(?:\n\n|\Z)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, combined, re.IGNORECASE | re.DOTALL)
        if match:
            print(f"✅ Found with pattern: {pattern}")
            ingredients_text = match.group(1)
            print(f"📋 Ingredients text: {ingredients_text[:200]}")
            break
    else:
        print("❌ No ingredients section found")
        ingredients_text = combined
    
    # Split into ingredients
    print("\n🔍 SPLITTING INTO INGREDIENTS...")
    
    # Try comma separation
    if ',' in ingredients_text:
        ingredients = [i.strip() for i in ingredients_text.split(',') if len(i.strip()) > 2]
        print(f"✅ Split by commas: {len(ingredients)} ingredients")
    
    # Try semicolons
    elif ';' in ingredients_text:
        ingredients = [i.strip() for i in ingredients_text.split(';') if len(i.strip()) > 2]
        print(f"✅ Split by semicolons: {len(ingredients)} ingredients")
    
    # Try newlines
    elif '\n' in ingredients_text:
        ingredients = [i.strip() for i in ingredients_text.split('\n') if len(i.strip()) > 2]
        print(f"✅ Split by newlines: {len(ingredients)} ingredients")
    
    else:
        ingredients = [ingredients_text.strip()]
        print("⚠️ No clear separators found")
    
    # Filter and clean
    clean_ingredients = []
    stopwords = ['and', 'with', 'may', 'contain', 'contains', 'ingredients']
    
    for ing in ingredients:
        # Remove special characters
        ing = re.sub(r'[^\w\s]', '', ing).strip()
        if ing and ing not in stopwords and len(ing) > 2:
            clean_ingredients.append(ing)
    
    print(f"\n✅ FINAL INGREDIENTS ({len(clean_ingredients)}):")
    for i, ing in enumerate(clean_ingredients, 1):
        print(f"  {i}. {ing}")
    
    return clean_ingredients

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_ingredient_extraction.py <image_path>")
        sys.exit(1)
    
    test_extraction(sys.argv[1])