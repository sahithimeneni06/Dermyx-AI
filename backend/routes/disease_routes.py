# routes/disease_routes.py

from flask import Blueprint, request, jsonify
from services.disease_service import predict_disease
import tempfile
import os
import logging

logger = logging.getLogger(__name__)

disease_bp = Blueprint("disease", __name__)

# Allowed image types
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@disease_bp.route("/detect-disease", methods=["POST"])
def detect_disease():
    """Detect skin disease from uploaded image"""

    try:
        # ✅ Check file existence
        if "image" not in request.files:
            return jsonify({
                "success": False,
                "error": "No image provided"
            }), 400

        file = request.files["image"]

        # ✅ Check filename
        if file.filename == "":
            return jsonify({
                "success": False,
                "error": "Empty filename"
            }), 400

        # ✅ Validate file type
        if not allowed_file(file.filename):
            return jsonify({
                "success": False,
                "error": "Invalid file type. Use PNG/JPG/JPEG"
            }), 400

        # ✅ Check file size
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)

        if file_size > MAX_FILE_SIZE:
            return jsonify({
                "success": False,
                "error": "File too large (max 5MB)"
            }), 400

        # ✅ Use temp file (SAFE)
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp:
            file.save(temp.name)
            temp_path = temp.name

        logger.info(f"📸 Processing image: {temp_path}")

        # 🔍 Run prediction
        result = predict_disease(temp_path)

        # 🧹 Cleanup temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)

        # ❌ If model error
        if "error" in result:
            return jsonify({
                "success": False,
                "error": result["error"]
            }), 500

        # ✅ Success response
        response = {
            "success": True,
            "data": {
                "condition": result.get("condition"),
                "display_name": result.get("display_name"),
                "confidence": result.get("confidence"),
                "all_probabilities": result.get("all_probabilities"),
                "recommendations": result.get("recommendations"),
                "model_used": result.get("model_used")
            }
        }

        logger.info(
            f"✅ Result: {response['data']['display_name']} "
            f"({response['data']['confidence']:.2%})"
        )

        return jsonify(response), 200

    except Exception as e:
        logger.error(f"❌ Error in detect_disease: {e}", exc_info=True)

        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500


# ✅ HEALTH CHECK (VERY IMPORTANT FOR DEPLOYMENT)
@disease_bp.route("/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "ok",
        "service": "disease_detection"
    })