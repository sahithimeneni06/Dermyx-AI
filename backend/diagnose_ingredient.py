import os
import sys
import traceback

print("="*60)
print("INGREDIENT ANALYZER DIAGNOSTIC")
print("="*60)

print(f"\n📌 Python version: {sys.version}")

print(f"\n📌 Current directory: {os.getcwd()}")

base_dir = os.path.dirname(os.path.abspath(__file__))
models_dir = os.path.join(base_dir, "models")
print(f"\n📌 Models directory: {models_dir}")
print(f"    Exists: {os.path.exists(models_dir)}")

if os.path.exists(models_dir):
    print("\n📂 Files in models directory:")
    for f in os.listdir(models_dir):
        size = os.path.getsize(os.path.join(models_dir, f)) / 1024
        print(f"  • {f} ({size:.1f} KB)")

pipeline_path = os.path.join(models_dir, "ingredient_analysis_pipeline.pkl")
print(f"\n📌 Pipeline file: {pipeline_path}")
print(f"    Exists: {os.path.exists(pipeline_path)}")

print("\n📦 Checking dependencies:")
try:
    import easyocr
    print(f"  ✅ easyocr: {easyocr.__version__}")
except ImportError as e:
    print(f"  ❌ easyocr: {e}")

try:
    from sentence_transformers import SentenceTransformer
    print(f"  ✅ sentence-transformers")
except ImportError as e:
    print(f"  ❌ sentence-transformers: {e}")

try:
    import sklearn
    print(f"  ✅ scikit-learn: {sklearn.__version__}")
except ImportError as e:
    print(f"  ❌ scikit-learn: {e}")

try:
    import torch
    print(f"  ✅ torch: {torch.__version__}")
except ImportError as e:
    print(f"  ❌ torch: {e}")

try:
    import cv2
    print(f"  ✅ opencv: {cv2.__version__}")
except ImportError as e:
    print(f"  ❌ opencv: {e}")

try:
    from PIL import Image
    print(f"  ✅ PIL: {Image.__version__}")
except ImportError as e:
    print(f"  ❌ PIL: {e}")

# Try to load the service
print("\n🔧 Testing ingredient service import:")
try:
    from services.ingredient_service import analyze_ingredient_image_api
    print("  ✅ Service imported successfully")
except Exception as e:
    print(f"  ❌ Import failed: {e}")
    traceback.print_exc()

print("\n" + "="*60)