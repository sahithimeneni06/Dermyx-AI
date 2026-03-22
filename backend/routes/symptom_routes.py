# routes/symptom_routes.py
from flask import Blueprint, request, jsonify
from services.symptom_service import analyze_symptoms
import traceback
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

symptom_bp = Blueprint("symptom", __name__)


@symptom_bp.route("/analyze-symptoms", methods=["POST"])
def analyze():
    logger.info("=" * 50)
    logger.info("Received /analyze-symptoms request")

    try:
        data = request.get_json()
        logger.info(f"Request data: {data}")

        if not data or "symptoms" not in data:
            logger.error("No symptoms in request")
            return jsonify({"error": "symptoms list required"}), 400

        symptoms = data["symptoms"]
        logger.info(f"Symptoms received: {symptoms}")

        if not isinstance(symptoms, list) or len(symptoms) == 0:
            logger.error("Invalid symptoms format")
            return jsonify({"error": "symptoms must be a non-empty list"}), 400

        logger.info("Calling analyze_symptoms service...")
        result = analyze_symptoms(symptoms)
        logger.info(f"Service result: {result}")

        if isinstance(result, dict):
            return jsonify(result)
        else:
            logger.error(f"Unexpected result type: {type(result)}")
            return jsonify({"error": "Invalid result from analysis"}), 500

    except Exception as e:
        logger.error(f"Error in analyze endpoint: {e}")
        logger.error(traceback.format_exc())
        return jsonify({"error": str(e)}), 500