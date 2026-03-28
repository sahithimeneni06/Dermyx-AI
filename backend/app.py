from flask import Flask, jsonify
from flask_cors import CORS
import logging
import sys
import os
from routes.location_routes import location_bp

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

app.register_blueprint(location_bp, url_prefix='/api/location')

try:
    
    from routes.disease_routes import disease_bp
    app.register_blueprint(disease_bp, url_prefix='/')
    logger.info("✅ disease_routes registered")
except Exception as e:
    logger.error(f"❌ Failed to register disease_routes: {e}")
   
    from flask import Blueprint
    disease_bp = Blueprint('disease', __name__)
    
    @disease_bp.route("/detect-disease", methods=["POST"])
    def detect_disease_fallback():
        return jsonify({
            "success": False,
            "error": "Model not available. Please train the model first."
        }), 503
    
    @disease_bp.route("/health", methods=["GET"])
    def health_fallback():
        return jsonify({"status": "error", "message": "Model not loaded"}), 503
    
    app.register_blueprint(disease_bp, url_prefix='/')
    logger.warning("⚠️ Using fallback disease routes (model not available)")

try:
    from routes.symptom_routes import symptom_bp
    app.register_blueprint(symptom_bp, url_prefix='/')
    logger.info("✅ symptom_routes registered")
except Exception as e:
    logger.error(f"❌ Failed to register symptom_routes: {e}")

try:
    from routes.product_routes import product_bp
    app.register_blueprint(product_bp, url_prefix='/')
    logger.info("✅ product_routes registered")
except Exception as e:
    logger.error(f"❌ Failed to register product_routes: {e}")

try:
    from routes.recommend_routes import recommend_bp
    app.register_blueprint(recommend_bp, url_prefix='/')
    logger.info("✅ recommend_routes registered")
except Exception as e:
    logger.error(f"❌ Failed to register recommend_routes: {e}")

try:
    from routes.skin_tone_routes import skin_tone_bp
    app.register_blueprint(skin_tone_bp, url_prefix='/')
    logger.info("✅ skin_tone_routes registered")
except Exception as e:
    logger.error(f"❌ Failed to register skin_tone_routes: {e}")

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "ok",
        "services": {
            "disease": disease_bp is not None,
            "symptom": True,
            "product": True,
            "recommend": True,
            "skin_tone": True
        }
    }), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)