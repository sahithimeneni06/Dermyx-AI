# test_skin_tone_model.py - Debug script
import os
import sys
import torch
import numpy as np
from PIL import Image
import timm
import torch.nn as nn
from torchvision import transforms

# Add backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import your model class
from services.skin_tone_service import EnhancedSkinToneClassifier, CLASS_NAMES, transform

MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "best_skin_tone_model.pth")

print("="*60)
print("SKIN TONE MODEL DEBUGGING")
print("="*60)

# Check if model exists
if not os.path.exists(MODEL_PATH):
    print(f"❌ Model not found at: {MODEL_PATH}")
    print("\nLooking for model in:")
    for root, dirs, files in os.walk(os.path.dirname(__file__)):
        for file in files:
            if 'skin_tone' in file.lower() or 'best' in file.lower():
                print(f"  Found: {os.path.join(root, file)}")
    sys.exit(1)

print(f"✅ Model found: {MODEL_PATH}")
print(f"   Size: {os.path.getsize(MODEL_PATH) / (1024*1024):.2f} MB")

# Load model
print("\n📦 Loading model...")
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"   Device: {device}")

try:
    model = EnhancedSkinToneClassifier(num_classes=2)
    
    # Load checkpoint
    checkpoint = torch.load(MODEL_PATH, map_location=device, weights_only=False)
    print(f"📋 Checkpoint keys: {list(checkpoint.keys())}")
    
    # Load state dict
    if 'model_state_dict' in checkpoint:
        model.load_state_dict(checkpoint['model_state_dict'])
        print(f"   Loaded from checkpoint (epoch: {checkpoint.get('epoch', 'unknown')})")
        if 'val_acc' in checkpoint:
            print(f"   Validation accuracy: {checkpoint['val_acc']:.2f}%")
    else:
        model.load_state_dict(checkpoint)
        print("   Loaded directly from state dict")
    
    model.to(device)
    model.eval()
    print("✅ Model loaded successfully")
    
except Exception as e:
    print(f"❌ Failed to load model: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Test with dummy input
print("\n🧪 Testing with dummy input...")
dummy_input = torch.randn(1, 3, 224, 224).to(device)
with torch.no_grad():
    output = model(dummy_input)
    probs = torch.softmax(output, dim=1)
    print(f"   Output shape: {output.shape}")
    print(f"   Probabilities: {probs[0].cpu().numpy()}")
    print(f"   Predicted class: {CLASS_NAMES[torch.argmax(output).item()]}")

# Test with a real image if provided
if len(sys.argv) > 1:
    image_path = sys.argv[1]
    print(f"\n📸 Testing with image: {image_path}")
    
    if os.path.exists(image_path):
        try:
            img = Image.open(image_path).convert("RGB")
            img_tensor = transform(img).unsqueeze(0).to(device)
            
            with torch.no_grad():
                output = model(img_tensor)
                probs = torch.softmax(output, dim=1)
                pred_idx = torch.argmax(output).item()
                confidence = probs[0][pred_idx].item()
            
            print(f"\n🎯 PREDICTION RESULT:")
            print(f"   Skin Tone: {CLASS_NAMES[pred_idx]}")
            print(f"   Confidence: {confidence:.2%}")
            print(f"   Probabilities:")
            for i, name in enumerate(CLASS_NAMES):
                print(f"     {name}: {probs[0][i].item():.2%}")
            
        except Exception as e:
            print(f"❌ Error processing image: {e}")
    else:
        print(f"❌ Image not found: {image_path}")
else:
    print("\n💡 To test with an image: python test_skin_tone_model.py <image_path>")

print("\n" + "="*60)