from flask import Blueprint, request, jsonify
from services.disease_service import predict_disease  # ✅ 
import tempfile
import os
import logging

logger = logging.getLogger(__name__)

disease_bp = Blueprint("disease", __name__)

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg"}
MAX_FILE_SIZE = 5 * 1024 * 1024  


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@disease_bp.route("/detect-disease", methods=["POST"])
def detect_disease():
    try:
        if "image" not in request.files:
            return jsonify({"success": False, "error": "No image provided"}), 400

        file = request.files["image"]

        if file.filename == "":
            return jsonify({"success": False, "error": "Empty filename"}), 400

        if not allowed_file(file.filename):
            return jsonify({
                "success": False,
                "error": "Invalid file type (use PNG/JPG/JPEG)"
            }), 400

        file.seek(0, os.SEEK_END)
        size = file.tell()
        file.seek(0)

        if size > MAX_FILE_SIZE:
            return jsonify({
                "success": False,
                "error": "File too large (max 5MB)"
            }), 400

        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp:
            file.save(temp.name)
            temp_path = temp.name

        logger.info(f"📸 Processing image: {temp_path}")

        result = predict_disease(temp_path)

        if os.path.exists(temp_path):
            os.remove(temp_path)

        if "error" in result:
            return jsonify({
                "success": False,
                "error": result["error"]
            }), 500

        return jsonify({
            "success": True,
            "data": result
        }), 200

    except Exception as e:
        logger.error(f"❌ Error in detect_disease: {e}", exc_info=True)

        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

@disease_bp.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "service": "disease_detection"
    })


@disease_bp.route("/model-info", methods=["GET"])
def model_info():
    """Get information about the loaded model"""
    try:
        from services.disease_service import get_model_info
        info = get_model_info()
        return jsonify({
            "success": True,
            "data": info
        }), 200
    except Exception as e:
        logger.error(f"❌ Error getting model info: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500