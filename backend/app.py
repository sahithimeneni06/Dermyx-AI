# app.py
import os
import sys
import logging
from flask import Flask, jsonify
from flask_cors import CORS

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

app = Flask(__name__)
CORS(app, origins=["*"], supports_credentials=False)

# Ensure folders exist
os.makedirs("uploads", exist_ok=True)
os.makedirs("models", exist_ok=True)

# ============================================================================
# Register all blueprints
# ============================================================================

try:
    from routes.disease_routes import disease_bp
    app.register_blueprint(disease_bp)
    logger.info("✅ disease_routes registered")
except Exception as e:
    logger.error(f"❌ Failed to register disease_routes: {e}", exc_info=True)

try:
    from routes.symptom_routes import symptom_bp
    app.register_blueprint(symptom_bp)
    logger.info("✅ symptom_routes registered")
except Exception as e:
    logger.error(f"❌ Failed to register symptom_routes: {e}", exc_info=True)

try:
    from routes.product_routes import product_bp
    app.register_blueprint(product_bp)
    logger.info("✅ product_routes registered")
except Exception as e:
    logger.error(f"❌ Failed to register product_routes: {e}", exc_info=True)

try:
    from routes.recommend_routes import recommend_bp
    app.register_blueprint(recommend_bp)
    logger.info("✅ recommend_routes registered")
except Exception as e:
    logger.error(f"❌ Failed to register recommend_routes: {e}", exc_info=True)

try:
    from routes.skin_tone_routes import skin_tone_bp
    app.register_blueprint(skin_tone_bp)
    logger.info("✅ skin_tone_routes registered")
except Exception as e:
    logger.error(f"❌ Failed to register skin_tone_routes: {e}", exc_info=True)


# ============================================================================
# Basic endpoints
# ============================================================================

@app.route("/")
def home():
    return jsonify({
        "message": "Dermyx AI running 🚀",
        "endpoints": {
            "disease": "/detect-disease",
            "symptom": "/analyze-symptoms",
            "product": "/analyze-product",
            "ingredients": "/analyze-ingredients",
            "recommend": "/recommend",
            "skin_tone": "/detect-skin-tone"
        }
    })


@app.route("/health")
def health():
    import os
    model_h5 = os.path.exists("models/skin_3class_model_new.h5")
    model_pth = os.path.exists("models/best_skin_tone_model (1).pth")
    return jsonify({
        "status": "ok",
        "message": "Server is running",
        "models": {
            "disease_model": model_h5,
            "skin_tone_model": model_pth
        }
    })


@app.route("/test-predict")
def test_predict():
    return jsonify({"status": "working", "message": "API is ready"})


# ============================================================================
# Error handlers
# ============================================================================

@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Endpoint not found", "message": str(e)}), 404


@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": "Internal server error", "message": str(e)}), 500


if __name__ == "__main__":
    logger.info("=" * 60)
    logger.info("🚀 Starting Dermyx AI Server")
    logger.info("=" * 60)
    logger.info("Available endpoints:")
    logger.info("  POST /detect-disease      - Skin disease detection")
    logger.info("  POST /analyze-symptoms    - Symptom analysis")
    logger.info("  POST /analyze-product     - Product ingredient analysis (image)")
    logger.info("  POST /analyze-ingredients - Product ingredient analysis (text)")
    logger.info("  POST /recommend           - Get recommendations")
    logger.info("  POST /detect-skin-tone    - Skin tone detection")
    logger.info("  GET  /health              - Health check")
    logger.info("=" * 60)
    app.run(debug=True, port=5000, use_reloader=False)