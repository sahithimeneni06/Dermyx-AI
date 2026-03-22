import os
import numpy as np
import tensorflow as tf
from tensorflow.keras.applications.efficientnet import preprocess_input
from tensorflow.keras.utils import load_img, img_to_array
from services.recommend_service import SkinDiseaseRecommender
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ==============================
# CONFIG
# ==============================
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# ✅ Use the H5 model we just created
MODEL_PATH = os.path.join(BASE_DIR, "models", "skin_model_9class.h5")

# Verify model exists
if not os.path.exists(MODEL_PATH):
    raise RuntimeError(f"❌ Model not found at {MODEL_PATH}. Please run create_test_model.py first.")

logger.info(f"📁 Using model: {MODEL_PATH}")

# ⚠️ MUST MATCH TRAINING ORDER - 9 CLASSES
CLASS_NAMES = [
    'acne', 'eczema', 'melanoma', 'vitiligo', 
    'urticaria', 'contact_dermatitis', 'rash', 
    'fungal', 'normal'
]

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
    # Allergies (shown with orange styling)
    'urticaria': 'allergy',
    'contact_dermatitis': 'allergy',
    'rash': 'allergy',
    
    # Diseases (shown with red styling)
    'acne': 'disease',
    'eczema': 'disease',
    'melanoma': 'disease',
    'vitiligo': 'disease',
    'fungal': 'disease',
    
    # Normal (shown with green styling)
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
    """Load the H5 model"""
    global model
    
    logger.info(f"📦 Loading model from: {MODEL_PATH}")
    logger.info(f"🐍 TensorFlow version: {tf.__version__}")
    
    try:
        # Load the H5 model - this should work with TF 2.12
        model = tf.keras.models.load_model(MODEL_PATH, compile=False)
        logger.info("✅ Model loaded successfully!")
        
        # Print model summary for debugging
        model.summary(line_length=100)
        
        return model
    except Exception as e:
        logger.error(f"❌ Failed to load model: {e}")
        raise RuntimeError(f"Cannot load model: {e}")


def load_resources():
    """Load model and recommender once"""
    global model, recommender

    if model is None:
        model = load_model()
        logger.info(f"✅ Model ready with {len(CLASS_NAMES)} classes")
        logger.info(f"📊 Classes: {CLASS_NAMES}")

    if recommender is None:
        try:
            recommender = SkinDiseaseRecommender()
            logger.info("✅ Recommender initialized")
        except Exception as e:
            logger.warning(f"⚠️ Recommender initialization failed: {e}")
            recommender = None


# ==============================
# HELPER FUNCTIONS
# ==============================
def preprocess_single_image(image_path):
    """Preprocess image for prediction"""
    try:
        img = load_img(image_path, target_size=(224, 224))
        arr = img_to_array(img)
        
        # Normalize pixel values to [0, 1] for the simple CNN model
        # Note: This is different from EfficientNet's preprocess_input
        arr = arr / 255.0
        
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
    Predict skin condition using 9-class model.
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
        
        logger.info(f"🔥 RAW OUTPUT (9 classes): {predictions}")
        
        # Create mapping for logging
        class_probs = dict(zip(CLASS_NAMES, predictions))
        logger.info(f"📊 Class probabilities: {class_probs}")

        # Get top prediction
        idx = int(np.argmax(predictions))
        confidence = float(predictions[idx])
        condition = CLASS_NAMES[idx]

        logger.info(f"👉 Predicted: {condition} ({confidence:.2%})")

        # Create all probabilities dictionary
        all_probabilities = {
            CLASS_NAMES[i]: float(predictions[i])
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
        recommendations = {}
        risk_assessment = {}
        
        if recommender:
            try:
                rec = recommender.get_complete_recommendations(
                    disease=condition,
                    symptoms=[]
                )
                recommendations = rec.get("recommendations", {})
                risk_assessment = rec.get("risk_assessment", {})
                
                # Ensure risk level is included
                if 'risk_level' not in recommendations:
                    recommendations['risk_level'] = risk_info['level']
                if 'requires_doctor' not in recommendations:
                    recommendations['requires_doctor'] = risk_info['requires_doctor']
                    
            except Exception as e:
                logger.warning(f"⚠️ Recommendation failed: {e}")
                # Provide default recommendations
                recommendations = {
                    'risk_level': risk_info['level'],
                    'requires_doctor': risk_info['requires_doctor'],
                    'precautions': [
                        'Consult a dermatologist for proper diagnosis',
                        'Keep the area clean and dry',
                        'Avoid scratching or touching the affected area'
                    ]
                }
        
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
            "model_used": "simple_cnn_9class",
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
        "model_exists": os.path.exists(MODEL_PATH),
        "num_classes": len(CLASS_NAMES),
        "classes": CLASS_NAMES,
        "model_loaded": model is not None,
        "recommender_loaded": recommender is not None,
        "tensorflow_version": tf.__version__
    }