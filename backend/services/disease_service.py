import os
import numpy as np
import tensorflow as tf
from tensorflow.keras.applications.efficientnet import preprocess_input
from tensorflow.keras.utils import load_img, img_to_array
import json
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ==============================
# CONFIG
# ==============================
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Try both model formats (prioritize .keras)
MODEL_PATH_KERAS = os.path.join(BASE_DIR, "models", "skin_model_9class_comp.keras")
MODEL_PATH_H5 = os.path.join(BASE_DIR, "models", "skin_model_9class.h5")
CLASS_NAMES_PATH = os.path.join(BASE_DIR, "models", "class_names.json")

# Choose which model to use
if os.path.exists(MODEL_PATH_KERAS):
    MODEL_PATH = MODEL_PATH_KERAS
    MODEL_FORMAT = "keras"
elif os.path.exists(MODEL_PATH_H5):
    MODEL_PATH = MODEL_PATH_H5
    MODEL_FORMAT = "h5"
else:
    raise RuntimeError(f"❌ No model found. Checked: {MODEL_PATH_KERAS} and {MODEL_PATH_H5}")

# Image preprocessing parameters (must match training)
IMG_SIZE = (224, 224)

# Load class names from training if available, otherwise use default
if os.path.exists(CLASS_NAMES_PATH):
    with open(CLASS_NAMES_PATH, 'r') as f:
        CLASS_NAMES = json.load(f)
    logger.info(f"📁 Loaded class names from file: {CLASS_NAMES}")
else:
    # Default class names (must match training order)
    CLASS_NAMES = [
    'acne',
    'contact_dermatitis',
    'eczema',
    'fungal',
    'melanoma',
    'normal',
    'rash',
    'urticaria',
    'vitiligo'
]
    logger.info(f"📁 Using default class names: {CLASS_NAMES}")

logger.info(f"📁 Using model: {MODEL_PATH} (format: {MODEL_FORMAT})")
logger.info(f"📊 Classes ({len(CLASS_NAMES)}): {CLASS_NAMES}")

# Display names for frontend
DISPLAY_NAMES = {
    'acne': 'Acne',
    'eczema': 'Eczema',
    'melanoma': 'Melanoma',
    'vitiligo': 'Vitiligo',
    'urticaria': 'Urticaria (Hives)',
    'contact_dermatitis': 'Contact Dermatitis',
    'rash': 'General Rash',
    'fungal': 'Fungal Infection',
    'normal': 'Normal Skin'
}

# Category mapping for UI styling
CATEGORY_MAPPING = {
    'urticaria': 'allergy',
    'contact_dermatitis': 'allergy',
    'rash': 'allergy',
    'acne': 'disease',
    'eczema': 'disease',
    'melanoma': 'disease',
    'vitiligo': 'disease',
    'fungal': 'disease',
    'normal': 'normal'
}

# Risk levels matching frontend RISK_COLORS
RISK_LEVELS = {
    'acne': {'level': 'MODERATE', 'requires_doctor': False},
    'eczema': {'level': 'MODERATE', 'requires_doctor': False},
    'melanoma': {'level': 'HIGH', 'requires_doctor': True},
    'vitiligo': {'level': 'MODERATE', 'requires_doctor': True},
    'urticaria': {'level': 'MODERATE', 'requires_doctor': False},
    'contact_dermatitis': {'level': 'LOW-MODERATE', 'requires_doctor': False},
    'rash': {'level': 'LOW-MODERATE', 'requires_doctor': False},
    'fungal': {'level': 'MODERATE', 'requires_doctor': False},
    'normal': {'level': 'LOW', 'requires_doctor': False}
}

# Emergency messages for high-risk conditions
EMERGENCY_MESSAGES = {
    'melanoma': {
        'message': '⚠️ HIGH RISK: This appears to be a potential melanoma',
        'action': 'Please consult a dermatologist immediately for proper diagnosis and treatment.'
    }
}

# ==============================
# GLOBAL MODEL (LAZY LOAD)
# ==============================
model = None
recommender = None


def load_model():
    """Load model with compatibility handling for different TF versions"""
    global model
    
    logger.info(f"📦 Loading model from: {MODEL_PATH}")
    logger.info(f"🐍 TensorFlow version: {tf.__version__}")
    
    try:
        # Try loading with custom objects to handle compatibility
        if MODEL_FORMAT == "keras":
            try:
                # First attempt: standard load
                model = tf.keras.models.load_model(MODEL_PATH)
            except TypeError as e:
                if "InputLayer" in str(e) and "batch_shape" in str(e):
                    logger.warning("⚠️ InputLayer compatibility issue detected. Trying alternative loading method...")
                    # Alternative: load with custom_objects to handle InputLayer
                    model = tf.keras.models.load_model(
                        MODEL_PATH,
                        custom_objects={'InputLayer': tf.keras.layers.InputLayer}
                    )
                else:
                    raise
        else:
            # For H5 format, use legacy loading
            model = tf.keras.models.load_model(MODEL_PATH, compile=False)
        
        logger.info("✅ Model loaded successfully!")
        
        # Print model summary for debugging
        try:
            model.summary(line_length=100)
        except:
            logger.info("Model summary not available")
        
        return model
        
    except Exception as e:
        logger.error(f"❌ Failed to load model: {e}")
        logger.error(f"Model path: {MODEL_PATH}")
        logger.error(f"Model format: {MODEL_FORMAT}")
        
        # Try fallback: rebuild model architecture
        try:
            logger.info("🔄 Attempting fallback: rebuilding model from scratch...")
            model = rebuild_model_from_scratch()
            if model:
                logger.info("✅ Model rebuilt successfully!")
                return model
        except Exception as fallback_error:
            logger.error(f"❌ Fallback failed: {fallback_error}")
        
        raise RuntimeError(f"Cannot load model: {e}")


def rebuild_model_from_scratch():
    """Rebuild the model architecture if loading fails"""
    try:
        # Recreate the same architecture as training
        from tensorflow.keras.applications import EfficientNetB0
        from tensorflow.keras import layers, models
        
        base_model = EfficientNetB0(
            include_top=False,
            weights='imagenet',
            input_shape=(224, 224, 3)
        )
        base_model.trainable = False
        
        model = models.Sequential([
            tf.keras.Input(shape=(224, 224, 3)),
            layers.RandomFlip("horizontal"),
            layers.RandomRotation(0.1),
            layers.RandomZoom(0.1),
            base_model,
            layers.GlobalAveragePooling2D(),
            layers.Dense(256, activation='relu'),
            layers.Dropout(0.4),
            layers.Dense(len(CLASS_NAMES), activation='softmax')
        ])
        
        # Try to load weights if available
        weights_path = MODEL_PATH
        if os.path.exists(weights_path):
            try:
                model.load_weights(weights_path)
                logger.info("✅ Weights loaded successfully")
            except Exception as e:
                logger.warning(f"⚠️ Could not load weights: {e}")
        
        return model
    except Exception as e:
        logger.error(f"❌ Failed to rebuild model: {e}")
        return None


def load_resources():
    """Load model and recommender once"""
    global model, recommender

    if model is None:
        model = load_model()
        logger.info(f"✅ Model ready with {len(CLASS_NAMES)} classes")

    # Optional: Load recommender if available
    if recommender is None:
        try:
            # Only import if available
            import importlib.util
            spec = importlib.util.find_spec("services.recommend_service")
            if spec is not None:
                from services.recommend_service import SkinDiseaseRecommender
                recommender = SkinDiseaseRecommender()
                logger.info("✅ Recommender initialized")
            else:
                logger.info("ℹ️ Recommender not available, using basic predictions")
                recommender = None
        except Exception as e:
            logger.warning(f"⚠️ Recommender initialization failed: {e}")
            recommender = None


# ==============================
# HELPER FUNCTIONS
# ==============================
def preprocess_single_image(image_path):
    """
    Preprocess image for prediction using the same preprocessing as training.
    Must match: load_img -> img_to_array -> preprocess_input (EfficientNet) -> expand_dims
    """
    try:
        # Load image with target size (224, 224) as used in training
        img = load_img(image_path, target_size=IMG_SIZE)
        
        # Convert to array
        arr = img_to_array(img)
        
        # Apply EfficientNet preprocessing (important!)
        # This scales pixels to [-1, 1] range as expected by EfficientNet
        arr = preprocess_input(arr)
        
        # Add batch dimension
        arr = np.expand_dims(arr, axis=0)
        
        return arr
    except Exception as e:
        raise ValueError(f"Failed to preprocess image: {e}")


def get_condition_info(condition):
    """Get all information about a specific condition"""
    return {
        "condition": condition,
        "display_name": DISPLAY_NAMES.get(condition, condition.replace('_', ' ').title()),
        "category": CATEGORY_MAPPING.get(condition, 'disease'),
        "risk": RISK_LEVELS.get(condition, {'level': 'MODERATE', 'requires_doctor': False})
    }


# ==============================
# MAIN PREDICTION FUNCTION
# ==============================
def predict_disease(image_path):
    """
    Predict skin condition using the trained model.
    Returns comprehensive analysis with recommendations.
    """
    try:
        load_resources()

        if not os.path.exists(image_path):
            return {
                "error": f"Image not found: {image_path}",
                "condition": "normal",
                "display_name": "Normal Skin",
                "confidence": 0
            }

        # ---------- PREPROCESS ----------
        arr = preprocess_single_image(image_path)

        # ---------- PREDICT ----------
        predictions = model.predict(arr, verbose=0)[0]
        
        logger.info(f"🔥 RAW OUTPUT ({len(CLASS_NAMES)} classes): {predictions[:5]}...")
        
        # Get top prediction
        idx = int(np.argmax(predictions))
        confidence = float(predictions[idx])
        condition = CLASS_NAMES[idx] if idx < len(CLASS_NAMES) else "normal"

        logger.info(f"👉 Predicted: {condition} ({confidence:.2%})")

        # Create all probabilities dictionary
        all_probabilities = {
            CLASS_NAMES[i]: float(predictions[i]) if i < len(predictions) else 0.0
            for i in range(len(CLASS_NAMES))
        }

        # Sort probabilities for display
        sorted_probabilities = dict(
            sorted(all_probabilities.items(), key=lambda x: x[1], reverse=True)
        )

        # Get category and display name
        category = CATEGORY_MAPPING.get(condition, 'disease')
        display_name = DISPLAY_NAMES.get(condition, condition.replace('_', ' ').title())

        # Get risk assessment
        risk_info = RISK_LEVELS.get(condition, {
            'level': 'MODERATE', 
            'requires_doctor': False
        })

        # ---------- RECOMMENDATIONS ----------
        recommendations = {
            'risk_level': risk_info['level'],
            'requires_doctor': risk_info['requires_doctor'],
            'precautions': [
                'Consult a dermatologist for proper diagnosis',
                'Keep the area clean and dry',
                'Avoid scratching or touching the affected area'
            ]
        }
        risk_assessment = {}
        
        # Try to get advanced recommendations if available
        if recommender:
            try:
                rec = recommender.get_complete_recommendations(
                    disease=condition,
                    symptoms=[]
                )
                if rec:
                    recommendations.update(rec.get("recommendations", {}))
                    risk_assessment = rec.get("risk_assessment", {})
            except Exception as e:
                logger.warning(f"⚠️ Advanced recommendation failed: {e}")
        
        # Add emergency message for high-risk conditions
        note = None
        if condition == 'melanoma':
            note = EMERGENCY_MESSAGES['melanoma']['message']
        elif confidence < 0.6:
            note = f"ℹ️ Confidence is {confidence:.1%}. Consider getting a second opinion from a dermatologist."
        elif condition in ['acne', 'eczema', 'fungal'] and confidence > 0.7:
            note = f"✅ High confidence detection of {display_name}. Follow the recommendations below for management."

        # ---------- RESPONSE ----------
        response = {
            "condition": condition,
            "display_name": display_name,
            "category": category,
            "confidence": round(confidence, 4),
            "all_probabilities": all_probabilities,
            "sorted_probabilities": sorted_probabilities,
            "recommendations": recommendations,
            "risk_assessment": risk_assessment,
            "model_used": f"efficientnetb0_9class_{MODEL_FORMAT}",
            "class_names": CLASS_NAMES
        }
        
        # Add note if applicable
        if note:
            response["note"] = note
            
        # Add emergency info if condition is melanoma
        if condition == 'melanoma':
            response["emergency"] = EMERGENCY_MESSAGES['melanoma']

        logger.info(f"✅ Prediction successful for {condition} with {confidence:.2%} confidence")
        return response

    except Exception as e:
        logger.error(f"❌ Prediction error: {e}", exc_info=True)
        return {
            "error": str(e),
            "condition": "normal",
            "display_name": "Normal Skin",
            "confidence": 0,
            "category": "normal",
            "all_probabilities": {cls: 0.0 for cls in CLASS_NAMES},
            "recommendations": {
                "risk_level": "LOW",
                "requires_doctor": False,
                "precautions": ["Unable to analyze image. Please try again with a clearer image."]
            }
        }


# ==============================
# BATCH PREDICTION (OPTIONAL)
# ==============================
def predict_batch(image_paths):
    """Predict multiple images"""
    results = []
    for path in image_paths:
        result = predict_disease(path)
        results.append(result)
    return results


# ==============================
# GET CONDITION DETAILS (OPTIONAL)
# ==============================
def get_condition_details(condition):
    """Get detailed information about a specific condition"""
    if condition not in CLASS_NAMES:
        return {"error": f"Unknown condition: {condition}"}
    
    return {
        "condition": condition,
        "display_name": DISPLAY_NAMES.get(condition),
        "category": CATEGORY_MAPPING.get(condition),
        "risk_level": RISK_LEVELS.get(condition, {}).get('level'),
        "requires_doctor": RISK_LEVELS.get(condition, {}).get('requires_doctor', False)
    }


# ==============================
# MODEL INFO (OPTIONAL)
# ==============================
def get_model_info():
    """Get information about the loaded model"""
    return {
        "model_path": MODEL_PATH,
        "model_format": MODEL_FORMAT,
        "model_exists": os.path.exists(MODEL_PATH),
        "num_classes": len(CLASS_NAMES),
        "classes": CLASS_NAMES,
        "model_loaded": model is not None,
        "recommender_loaded": recommender is not None,
        "tensorflow_version": tf.__version__,
        "image_size": IMG_SIZE
    }


# ==============================
# TEST FUNCTION (OPTIONAL)
# ==============================
def test_prediction(image_path):
    """Simple test function matching notebook style"""
    if model is None:
        load_model()
    
    img = tf.keras.utils.load_img(image_path, target_size=IMG_SIZE)
    img = tf.keras.utils.img_to_array(img)
    img = preprocess_input(img)
    img = np.expand_dims(img, axis=0)
    
    pred = model.predict(img)[0]
    idx = np.argmax(pred)
    
    print("Prediction:", CLASS_NAMES[idx])
    print("Confidence:", float(pred[idx]))
    
    return {
        "prediction": CLASS_NAMES[idx],
        "confidence": float(pred[idx]),
        "all_probabilities": {CLASS_NAMES[i]: float(pred[i]) for i in range(len(CLASS_NAMES))}
    }