# test_full_integration.py
import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.disease_service import get_model_info, predict_disease

print("=" * 60)
print("TESTING FULL INTEGRATION")
print("=" * 60)

# Test model info
print("\n1. Getting model info...")
info = get_model_info()
print(f"   Model path: {info['model_path']}")
print(f"   Model exists: {info['model_exists']}")
print(f"   Model loaded: {info['model_loaded']}")
print(f"   Classes: {info['classes']}")

# Force model loading
print("\n2. Loading model...")
from services.disease_service import load_resources
load_resources()

# Check again
info2 = get_model_info()
print(f"   Model loaded after load_resources(): {info2['model_loaded']}")

# Test with a random image if available
print("\n3. Testing prediction with sample image...")
test_image = input("Enter path to test image (or press Enter to use random): ").strip()

if test_image and os.path.exists(test_image):
    result = predict_disease(test_image)
else:
    # Create a dummy image for testing
    import numpy as np
    from PIL import Image
    
    dummy_path = "test_dummy.jpg"
    dummy_img = np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)
    Image.fromarray(dummy_img).save(dummy_path)
    
    print(f"   Created dummy image: {dummy_path}")
    result = predict_disease(dummy_path)
    
    # Clean up
    if os.path.exists(dummy_path):
        os.remove(dummy_path)

if "error" in result:
    print(f"   ❌ Error: {result['error']}")
else:
    print(f"   ✅ Prediction successful!")
    print(f"   Condition: {result['condition']}")
    print(f"   Display name: {result['display_name']}")
    print(f"   Category: {result['category']}")
    print(f"   Confidence: {result['confidence']:.2%}")
    print(f"\n   Top 3 predictions:")
    sorted_probs = sorted(result['all_probabilities'].items(), key=lambda x: x[1], reverse=True)[:3]
    for cls, prob in sorted_probs:
        print(f"      - {cls}: {prob:.2%}")

print("\n✅ Test complete!")