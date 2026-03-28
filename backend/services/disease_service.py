import os
import json
import numpy as np
import tensorflow as tf
from tensorflow.keras.applications.efficientnet import preprocess_input
from tensorflow.keras.applications import EfficientNetB0
from tensorflow.keras import layers, models
import logging
from PIL import Image

logger = logging.getLogger(__name__)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

FULL_MODEL_PATH = os.path.join(BASE_DIR, "models", "skin_model_6class.h5")
WEIGHTS_PATH = os.path.join(BASE_DIR, "models", "skin_model_6class.weights.h5")
KERAS_MODEL_PATH = os.path.join(BASE_DIR, "models", "skin_model_6class.keras")
CLASS_NAMES_PATH = os.path.join(BASE_DIR, "models", "class_names.json")

IMG_SIZE = (224, 224)

model = None
class_names = None

def load_resources():
    global model, class_names
    
    if model is None:
        print("\n" + "="*60)
        print("🚀 LOADING SKIN DISEASE MODEL")
        print("="*60)
        
        # Load class names
        if os.path.exists(CLASS_NAMES_PATH):
            with open(CLASS_NAMES_PATH, "r") as f:
                class_names = json.load(f)
            print(f"✅ Class names loaded: {class_names}")
        else:
            class_names = ['acne', 'eczema_like', 'fungal', 'melanoma', 'normal', 'vitiligo']
            print(f"⚠️ Using default class names: {class_names}")
        
        # Try loading the full model first (this worked in your test)
        model_loaded = False
        
        # Try .h5 full model (this worked in your test)
        if os.path.exists(FULL_MODEL_PATH):
            try:
                print(f"📁 Loading full model from: {FULL_MODEL_PATH}")
                model = tf.keras.models.load_model(FULL_MODEL_PATH, compile=False)
                print("✅ Full model loaded successfully!")
                model_loaded = True
            except Exception as e:
                print(f"❌ Full model loading failed: {e}")
        
        # Try .keras model
        if not model_loaded and os.path.exists(KERAS_MODEL_PATH):
            try:
                print(f"📁 Loading keras model from: {KERAS_MODEL_PATH}")
                model = tf.keras.models.load_model(KERAS_MODEL_PATH, compile=False)
                print("✅ Keras model loaded successfully!")
                model_loaded = True
            except Exception as e:
                print(f"❌ Keras model loading failed: {e}")
        
        # Try weights file as last resort
        if not model_loaded and os.path.exists(WEIGHTS_PATH):
            try:
                print(f"📁 Building model and loading weights from: {WEIGHTS_PATH}")
                
                # Build model architecture
                base_model = EfficientNetB0(
                    include_top=False,
                    weights="imagenet",
                    input_shape=(224, 224, 3)
                )
                base_model.trainable = False
                
                model = models.Sequential([
                    tf.keras.Input(shape=(224, 224, 3)),
                    base_model,
                    layers.GlobalAveragePooling2D(),
                    layers.BatchNormalization(),
                    layers.Dense(512, activation="relu"),
                    layers.Dropout(0.5),
                    layers.Dense(256, activation="relu"),
                    layers.Dropout(0.4),
                    layers.Dense(len(class_names), activation="softmax")
                ])
                
                model.load_weights(WEIGHTS_PATH)
                print("✅ Weights loaded successfully!")
                model_loaded = True
            except Exception as e:
                print(f"❌ Weight loading failed: {e}")
        
        if not model_loaded:
            raise RuntimeError("❌ No model could be loaded!")
        
        # Verify model works
        print("\n🧪 Testing model with random input...")
        test_input = np.random.randn(1, 224, 224, 3).astype(np.float32)
        test_output = model.predict(test_input, verbose=0)[0]
        print(f"   Test output sum: {test_output.sum():.4f}")
        print(f"   Test output max: {test_output.max():.4f}")
        
        if test_output.max() < 0.1:
            print("⚠️ WARNING: Model outputs are very uniform. May not be loaded correctly.")
        else:
            print("✅ Model verification passed!")
        
        print("="*60 + "\n")

def preprocess_image(img_path):
    """Preprocess image - matches your working test exactly"""
    try:
        # Load image with PIL (same as your test)
        img = Image.open(img_path).convert("RGB")
        
        # Resize to 224x224 (same as your test)
        img = img.resize((224, 224))
        
        # Convert to array
        img_array = np.array(img).astype("float32")
        
        # Add batch dimension
        img_array = np.expand_dims(img_array, axis=0)
        
        # Apply EfficientNet preprocessing (scales to [-1, 1])
        img_array = preprocess_input(img_array)
        
        return img_array
        
    except Exception as e:
        raise ValueError(f"Failed to preprocess image: {e}")

def predict_disease(img_path):
    """
    Predict skin condition from image
    Returns dict with prediction results
    """
    try:
        # Load model if not loaded
        load_resources()
        
        # Preprocess image
        img_array = preprocess_image(img_path)
        
        # Make prediction
        predictions = model.predict(img_array, verbose=0)[0]
        
        # Get top 3 predictions
        top3_idx = np.argsort(predictions)[-3:][::-1]
        
        top3 = []
        for i in top3_idx:
            top3.append({
                "class": class_names[i],
                "confidence": float(predictions[i])
            })
        
        # Best prediction
        best_idx = top3_idx[0]
        best_conf = float(predictions[best_idx])
        best_class = class_names[best_idx]
        
        # All probabilities
        all_probabilities = {
            class_names[i]: float(predictions[i])
            for i in range(len(class_names))
        }
        
        # Build result
        result = {
            "prediction": best_class,
            "confidence": best_conf,
            "top3": top3,
            "all_probabilities": all_probabilities,
            "model_used": "efficientnetb0_6class"
        }
        
        # Add warnings for low confidence
        if best_conf < 0.6:
            result["warning"] = "Low confidence - please consult a dermatologist for proper diagnosis"
        
        # Add alert for high-risk conditions
        if best_class == "melanoma" and best_conf > 0.7:
            result["alert"] = "⚠️ Possible melanoma detected. Please seek immediate medical advice."
            result["emergency"] = True
        
        # Log prediction
        print(f"\n🎯 Prediction: {best_class} ({best_conf:.2%})")
        for i, pred in enumerate(top3):
            print(f"   {i+1}. {pred['class']}: {pred['confidence']:.2%}")
        
        return result
        
    except Exception as e:
        logger.error(f"❌ Prediction error: {e}", exc_info=True)
        return {"error": str(e)}

def get_model_info():
    """Get information about the loaded model"""
    load_resources()
    
    return {
        "model_loaded": model is not None,
        "model_path": FULL_MODEL_PATH if os.path.exists(FULL_MODEL_PATH) else 
                     KERAS_MODEL_PATH if os.path.exists(KERAS_MODEL_PATH) else 
                     WEIGHTS_PATH,
        "num_classes": len(class_names) if class_names else 0,
        "classes": class_names if class_names else [],
        "input_shape": [224, 224, 3],
        "tensorflow_version": tf.__version__
    }