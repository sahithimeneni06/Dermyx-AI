import easyocr
import re

reader = easyocr.Reader(['en'], gpu=False)

# Your image
results = reader.readtext('inggg.jpg', detail=0, paragraph=True)
text = " ".join(results).lower()

print("Raw text:", text)

# Look for ingredients
ingredients = []
for line in text.split('\n'):
    # Skip lines that look like product names
    if 'vanilla' in line or 'beige' in line:
        continue
    
    # Extract potential ingredients
    words = re.findall(r'[a-zA-Z]{4,}', line)
    ingredients.extend(words)

# Remove duplicates and common non-ingredients
skip_words = ['ingredients', 'and', 'with', 'this', 'product', 'contains']
ingredients = list(set([i for i in ingredients if i not in skip_words and len(i) > 3]))

print("\nExtracted ingredients:", ingredients)