from flask import Blueprint, request, jsonify
import os
import uuid
import logging

logger = logging.getLogger(__name__)
skin_tone_bp = Blueprint("skin_tone", __name__)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@skin_tone_bp.route("/detect-skin-tone", methods=["POST"])
def detect_skin_tone():
    """Detect skin tone from uploaded image"""
    try:
        if "image" not in request.files:
            return jsonify({"error": "No image provided"}), 400

        file = request.files["image"]
        if file.filename == "":
            return jsonify({"error": "Empty filename"}), 400

        filename = f"{uuid.uuid4()}_{file.filename}"
        path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(path)

        logger.info(f"File saved: {path}")

        # Try to use the trained model service first
        result = None
        try:
            from services.skin_tone_service import predict_skin_tone
            result = predict_skin_tone(path)
            logger.info(f"✅ Used trained model: {result.get('skin_tone', 'unknown')}")
        except Exception as model_err:
            logger.warning(f"Trained model failed: {model_err}, falling back to simple analysis")
            result = None

        # Fallback to simple LAB analysis if model fails
        if result is None or result.get("error"):
            result = _simple_skin_tone_analysis(path)

        if os.path.exists(path):
            os.remove(path)

        if result:
            logger.info(f"✅ Skin tone: {result.get('skin_tone')} ({result.get('confidence', 0):.2%})")
            return jsonify(result)
        else:
            return jsonify({"error": "Failed to analyze skin tone"}), 500

    except Exception as e:
        logger.error(f"Error: {e}")
        return jsonify({"error": str(e)}), 500


def _simple_skin_tone_analysis(image_path):
    """Simple skin tone analysis using LAB color space as fallback"""
    try:
        import numpy as np
        from PIL import Image

        img = Image.open(image_path).convert('RGB')
        img_lab = img.convert('LAB')
        img_arr = np.array(img_lab)
        l_channel = img_arr[:, :, 0]
        mean_l = float(np.mean(l_channel))

        if mean_l > 128:
            skin_tone = "Light-Medium (I-III)"
            confidence = min(0.95, 0.70 + (mean_l - 128) / 127 * 0.25)
            description = "Light to medium skin tone (Fitzpatrick I-III). This skin type may burn with sun exposure."
            tips = [
                "Use broad-spectrum sunscreen SPF 50+ daily",
                "Reapply sunscreen every 2 hours",
                "Wear protective clothing and hats",
                "Check skin regularly for changes"
            ]
            fitzpatrick_types = ["Type I", "Type II", "Type III"]
            all_predictions = {
                "Light-Medium (I-III)": round(confidence, 4),
                "Tan-Dark (IV-VI)": round(1 - confidence, 4)
            }
        else:
            skin_tone = "Tan-Dark (IV-VI)"
            confidence = min(0.95, 0.70 + (128 - mean_l) / 128 * 0.25)
            description = "Tan to dark skin tone (Fitzpatrick IV-VI). Natural sun protection but still needs SPF."
            tips = [
                "Use broad-spectrum sunscreen SPF 30+ daily",
                "Look for sunscreens that don't leave a white cast",
                "Consider products with vitamin C and niacinamide",
                "Be gentle to prevent hyperpigmentation"
            ]
            fitzpatrick_types = ["Type IV", "Type V", "Type VI"]
            all_predictions = {
                "Light-Medium (I-III)": round(1 - confidence, 4),
                "Tan-Dark (IV-VI)": round(confidence, 4)
            }

        return {
            "skin_tone": skin_tone,
            "confidence": round(confidence, 4),
            "description": description,
            "tips": tips,
            "all_predictions": all_predictions,
            "fitzpatrick_types": fitzpatrick_types
        }
    except Exception as e:
        logger.error(f"Simple skin tone analysis failed: {e}")
        return None


@skin_tone_bp.route("/skin-tone-info", methods=["GET"])
def skin_tone_info():
    """Get skin tone classification info"""
    return jsonify({
        "classes": ["Light-Medium (I-III)", "Tan-Dark (IV-VI)"],
        "fitzpatrick_scale": {
            "I-III": "Light to medium skin that burns easily",
            "IV-VI": "Tan to dark skin that rarely burns"
        }
    })