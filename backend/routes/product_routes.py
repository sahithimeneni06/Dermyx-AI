# routes/product_routes.py
from flask import Blueprint, request, jsonify
from services.ingredient_service import analyze_ingredient_image, analyze_ingredient_text
import os
import uuid
import traceback
import logging
import signal
from functools import wraps
import time

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

product_bp = Blueprint("product", __name__)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Timeout decorator for functions that might hang
def timeout_handler(signum, frame):
    raise TimeoutError("Function timed out")

def with_timeout(seconds=30):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Set timeout handler
            signal.signal(signal.SIGALRM, timeout_handler)
            signal.alarm(seconds)
            try:
                result = func(*args, **kwargs)
                signal.alarm(0)  # Disable alarm
                return result
            except TimeoutError:
                logger.error(f"Function {func.__name__} timed out after {seconds} seconds")
                return {"error": f"Analysis timed out after {seconds} seconds", "ingredients": []}
            finally:
                signal.alarm(0)
        return wrapper
    return decorator


@product_bp.route("/analyze-product", methods=["POST"])
def analyze_product():
    """Analyze product ingredients from image upload with timeout"""
    logger.info("="*50)
    logger.info("Received /analyze-product request")
    
    start_time = time.time()
    
    try:
        if "image" not in request.files:
            return jsonify({"error": "No image file provided"}), 400

        file = request.files["image"]
        if file.filename == "":
            return jsonify({"error": "Empty filename"}), 400

        # Save file
        unique_filename = f"{uuid.uuid4()}_{file.filename}"
        path = os.path.join(UPLOAD_FOLDER, unique_filename)
        file.save(path)
        
        logger.info(f"File saved: {path}")
        logger.info(f"File size: {os.path.getsize(path)} bytes")
        
        # Analyze image with timeout (30 seconds)
        try:
            # Import here to avoid circular imports
            from services.ingredient_service import analyzer
            
            if analyzer is None:
                logger.error("Ingredient analyzer not initialized")
                return jsonify({
                    "error": "Ingredient analyzer not initialized",
                    "overall_rating": "Unknown",
                    "ingredients": [],
                    "note": "Service temporarily unavailable. Please try again later."
                }), 503
            
            # Analyze with timeout
            result = analyze_ingredient_image(path)
            
            # Check if analysis took too long
            elapsed = time.time() - start_time
            logger.info(f"Analysis completed in {elapsed:.2f} seconds")
            
            # Add processing time to response
            if isinstance(result, dict):
                result["processing_time"] = round(elapsed, 2)
            
        except TimeoutError:
            logger.error("Analysis timed out")
            return jsonify({
                "error": "Analysis timed out",
                "overall_rating": "Unknown",
                "ingredients": [],
                "note": "Analysis took too long. Please try with a clearer image or use text input."
            }), 408
            
        except Exception as e:
            logger.error(f"Analysis error: {e}")
            traceback.print_exc()
            return jsonify({
                "error": str(e),
                "overall_rating": "Unknown",
                "ingredients": [],
                "note": "Failed to analyze ingredients. Please try again."
            }), 500
        
        # Clean up
        try:
            os.remove(path)
            logger.info(f"Cleaned up: {path}")
        except Exception as e:
            logger.warning(f"Failed to clean up {path}: {e}")
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error: {e}")
        traceback.print_exc()
        return jsonify({
            "error": str(e),
            "overall_rating": "Unknown",
            "ingredients": [],
            "note": "Server error. Please try again."
        }), 500


@product_bp.route("/analyze-ingredients", methods=["POST"])
def analyze_ingredients_text():
    """Analyze ingredients from text input"""
    logger.info("="*50)
    logger.info("Received /analyze-ingredients request")
    
    try:
        data = request.get_json()
        
        if not data or "ingredients" not in data:
            return jsonify({"error": "ingredients list required"}), 400
        
        ingredients = data["ingredients"]
        
        if isinstance(ingredients, str):
            ingredients_list = [i.strip() for i in ingredients.split(',') if i.strip()]
        elif isinstance(ingredients, list):
            ingredients_list = ingredients
        else:
            return jsonify({"error": "ingredients must be string or list"}), 400
        
        if not ingredients_list:
            return jsonify({"error": "ingredients list cannot be empty"}), 400
        
        result = analyze_ingredient_text(ingredients_list)
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


# Health check for product service
@product_bp.route("/product-health", methods=["GET"])
def product_health():
    """Check if product analysis service is healthy"""
    from services.ingredient_service import analyzer
    
    return jsonify({
        "status": "ok" if analyzer is not None else "degraded",
        "analyzer_initialized": analyzer is not None,
        "ocr_available": analyzer.reader is not None if analyzer else False,
        "embedder_available": analyzer.embedder is not None if analyzer else False
    })