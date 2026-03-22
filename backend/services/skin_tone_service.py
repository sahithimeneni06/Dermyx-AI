"""
Skin Tone Service - Using Trained Model
"""

import os
import torch
import torch.nn as nn
import timm
from torchvision import transforms
from PIL import Image
import numpy as np
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# Use the exact filename with space and parentheses
MODEL_PATH = os.path.join(BASE_DIR, "models", "best_skin_tone_model (1).pth")
IMG_SIZE = 224
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Class names for 2-class system
CLASS_NAMES = ["Light-Medium (I-III)", "Tan-Dark (IV-VI)"]

# Detailed descriptions
CLASS_DESCRIPTIONS = {
    0: "Light to medium skin (Fitzpatrick I-III): Fair to light brown skin that may burn with sun exposure",
    1: "Tan to dark skin (Fitzpatrick IV-VI): Moderate brown to dark skin with natural sun protection"
}

# Fitzpatrick scale mapping
FITZPATRICK_MAPPING = {
    "Light-Medium (I-III)": ["Type I", "Type II", "Type III"],
    "Tan-Dark (IV-VI)": ["Type IV", "Type V", "Type VI"]
}

# Personalized tips
SKIN_TONE_TIPS = {
    "Light-Medium (I-III)": [
        "Use broad-spectrum sunscreen SPF 50+ daily",
        "Reapply sunscreen every 2 hours when outdoors",
        "Wear protective clothing and wide-brimmed hats",
        "Avoid tanning beds",
        "Check skin regularly for new or changing moles"
    ],
    "Tan-Dark (IV-VI)": [
        "Use broad-spectrum sunscreen SPF 30+ daily",
        "Look for sunscreens that don't leave a white cast",
        "Consider products with vitamin C and niacinamide",
        "Be gentle to prevent hyperpigmentation",
        "Check skin regularly for any changes"
    ]
}


class EnhancedSkinToneClassifier(nn.Module):
    """Skin Tone Classifier - MUST match training architecture"""
    
    def __init__(self, num_classes=2):
        super().__init__()
        
        # Load EfficientNet backbone
        self.backbone = timm.create_model(
            'efficientnet_b0',
            pretrained=False,
            num_classes=0
        )
        
        # Get number of features
        num_features = self.backbone.num_features
        
        # Attention mechanism
        self.attention = nn.Sequential(
            nn.Linear(num_features, 256),
            nn.ReLU(),
            nn.Linear(256, num_features),
            nn.Sigmoid()
        )
        
        # Classifier head
        self.classifier = nn.Sequential(
            nn.Dropout(0.5),
            nn.Linear(num_features, 128),
            nn.BatchNorm1d(128),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(128, num_classes)
        )
        
    def forward(self, x):
        features = self.backbone(x)
        attention_weights = self.attention(features)
        attended_features = features * attention_weights
        output = self.classifier(attended_features)
        return output


# Image transforms (must match training)
transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


# Load model globally
model = None

print("="*60)
print("🔍 Loading Skin Tone Model...")
print("="*60)

# Check if model exists
if os.path.exists(MODEL_PATH):
    print(f"✅ Model found: {MODEL_PATH}")
    print(f"   Size: {os.path.getsize(MODEL_PATH) / (1024*1024):.2f} MB")
    
    try:
        # Create model instance
        model = EnhancedSkinToneClassifier(num_classes=2)
        
        # Load checkpoint
        checkpoint = torch.load(MODEL_PATH, map_location=DEVICE, weights_only=False)
        print(f"📋 Checkpoint keys: {list(checkpoint.keys())}")
        
        # Load state dict
        if 'model_state_dict' in checkpoint:
            model.load_state_dict(checkpoint['model_state_dict'])
            print(f"✅ Loaded model from checkpoint")
            if 'val_acc' in checkpoint:
                print(f"   Validation accuracy: {checkpoint['val_acc']:.2f}%")
            if 'train_acc' in checkpoint:
                print(f"   Training accuracy: {checkpoint['train_acc']:.2f}%")
        else:
            model.load_state_dict(checkpoint)
            print("✅ Loaded model directly from state dict")
        
        model.to(DEVICE)
        model.eval()
        print(f"✅ Model ready on {DEVICE}")
        
        # Test with dummy input
        dummy_input = torch.randn(1, 3, IMG_SIZE, IMG_SIZE).to(DEVICE)
        with torch.no_grad():
            test_output = model(dummy_input)
            test_probs = torch.softmax(test_output, dim=1)
            print(f"✅ Model test successful")
            print(f"   Output shape: {test_output.shape}")
            print(f"   Dummy probabilities: {test_probs[0].cpu().numpy()}")
        
    except Exception as e:
        print(f"❌ Failed to load model: {e}")
        import traceback
        traceback.print_exc()
        model = None
else:
    print(f"❌ Model not found at: {MODEL_PATH}")
    print("\n📁 Looking for model in:")
    for root, dirs, files in os.walk(os.path.join(BASE_DIR, "models")):
        for file in files:
            if 'skin_tone' in file.lower():
                print(f"   Found: {os.path.join(root, file)}")

print("="*60)


def predict_skin_tone(image_path: str) -> dict:
    """
    Predict skin tone category from an image.
    """
    logger.info(f"predict_skin_tone called with: {image_path}")
    
    # Fix path if needed
    if image_path and not os.path.exists(image_path):
        # Try with uploads folder
        alt_path = os.path.join(BASE_DIR, "uploads", os.path.basename(image_path))
        if os.path.exists(alt_path):
            image_path = alt_path
            logger.info(f"Using alternative path: {image_path}")
    
    # Check if image exists
    if not os.path.exists(image_path):
        error_msg = f"Image file not found: {image_path}"
        logger.error(error_msg)
        return {
            "skin_tone": "Unknown",
            "confidence": 0,
            "error": error_msg,
            "description": "Could not load image",
            "tips": ["Please try uploading a clearer image"],
            "all_predictions": {name: 0.5 for name in CLASS_NAMES},
            "fitzpatrick_types": ["Unknown"]
        }
    
    # Check if model is loaded
    if model is None:
        logger.warning("⚠️ Model not loaded, using fallback")
        return fallback_prediction()
    
    try:
        # Load and preprocess image (same as working script)
        img = Image.open(image_path).convert("RGB")
        img_tensor = transform(img).unsqueeze(0).to(DEVICE)
        
        # Predict (same as working script)
        with torch.no_grad():
            outputs = model(img_tensor)
            probs = torch.softmax(outputs, dim=1)
            pred_idx = torch.argmax(probs).item()
            confidence = probs[0][pred_idx].item()
        
        # Get skin tone
        skin_tone = CLASS_NAMES[pred_idx]
        description = CLASS_DESCRIPTIONS[pred_idx]
        tips = SKIN_TONE_TIPS[skin_tone]
        
        # All probabilities
        all_predictions = {
            CLASS_NAMES[i]: float(probs[0][i].item())
            for i in range(len(CLASS_NAMES))
        }
        
        # Fitzpatrick types
        fitzpatrick_types = FITZPATRICK_MAPPING[skin_tone]
        
        logger.info(f"✅ Prediction: {skin_tone} ({confidence:.2%})")
        logger.info(f"   Probabilities: {all_predictions}")
        
        return {
            "skin_tone": skin_tone,
            "confidence": round(confidence, 4),
            "description": description,
            "tips": tips,
            "all_predictions": all_predictions,
            "fitzpatrick_types": fitzpatrick_types
        }
        
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        import traceback
        traceback.print_exc()
        return fallback_prediction()


def fallback_prediction():
    """Fallback prediction when model fails"""
    return {
        "skin_tone": "Light-Medium (I-III)",
        "confidence": 0.75,
        "description": "Light to medium skin (Fitzpatrick I-III) - Using fallback",
        "tips": SKIN_TONE_TIPS["Light-Medium (I-III)"],
        "all_predictions": {
            "Light-Medium (I-III)": 0.75,
            "Tan-Dark (IV-VI)": 0.25
        },
        "fitzpatrick_types": ["Type I", "Type II", "Type III"],
        "note": "Model not loaded - using fallback"
    }


# Test function for direct execution
if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        image_path = sys.argv[1]
        result = predict_skin_tone(image_path)
        print(f"\n🔍 SKIN TONE PREDICTION")
        print(f"Skin Tone  : {result.get('skin_tone', 'Unknown')}")
        print(f"Confidence : {result.get('confidence', 0):.2%}")
        if 'error' in result:
            print(f"Error      : {result['error']}")
        else:
            print("Probabilities:")
            for k, v in result.get('all_predictions', {}).items():
                print(f"  {k}: {v:.2%}")
            print(f"\nDescription: {result.get('description', '')}")
            if result.get('tips'):
                print("\n💡 Tips:")
                for tip in result['tips'][:2]:
                    print(f"  • {tip}")
    else:
        print("Usage: python skin_tone_service.py <image_path>")