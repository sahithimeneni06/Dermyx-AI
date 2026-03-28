
from flask import Blueprint, request, jsonify
import logging

logger = logging.getLogger(__name__)
recommend_bp = Blueprint("recommend", __name__)

RECOMMENDATIONS = {
    'acne': {
        "risk_level": "MODERATE",
        "requires_doctor": False,
        "products": [
            {"name": "Salicylic Acid Cleanser", "brand": "Neutrogena", "score": 0.88},
            {"name": "Benzoyl Peroxide Gel", "brand": "Clean & Clear", "score": 0.85},
            {"name": "Adapalene Gel", "brand": "Differin", "score": 0.82}
        ],
        "food": {
            "eat": [
                {"name": "Zinc-rich foods", "reason": "Helps reduce inflammation"},
                {"name": "Omega-3 fatty acids", "reason": "Anti-inflammatory properties"}
            ],
            "avoid": [
                {"name": "Dairy products", "reason": "May trigger acne"},
                {"name": "High glycemic foods", "reason": "Can increase inflammation"}
            ]
        },
        "precautions": ["Wash face twice daily", "Don't pop pimples", "Use non-comedogenic products"]
    },
    'eczema': {
        "risk_level": "MODERATE-HIGH",
        "requires_doctor": True,
        "products": [
            {"name": "Ceramide Moisturizer", "brand": "CeraVe", "score": 0.92},
            {"name": "Colloidal Oatmeal Cream", "brand": "Aveeno", "score": 0.88},
            {"name": "Hydrocortisone Cream", "brand": "Cortizone-10", "score": 0.85}
        ],
        "food": {
            "eat": [
                {"name": "Anti-inflammatory foods", "reason": "Reduce inflammation"},
                {"name": "Probiotics", "reason": "Support gut health"}
            ],
            "avoid": [
                {"name": "Dairy", "reason": "Common trigger"},
                {"name": "Eggs", "reason": "May trigger flare-ups"}
            ]
        },
        "precautions": ["Moisturize immediately after bathing", "Avoid harsh soaps", "Use lukewarm water"]
    },
    'melanoma': {
        "risk_level": "HIGH",
        "requires_doctor": True,
        "products": [],
        "food": {"eat": [], "avoid": []},
        "precautions": ["🚨 SEEK IMMEDIATE MEDICAL ATTENTION", "Visit a dermatologist immediately"],
        "emergency": {
            "message": "⚠️ URGENT: Potential Melanoma Detected",
            "action": "Please seek immediate dermatologist consultation"
        }
    },
    'vitiligo': {
        "risk_level": "MODERATE",
        "requires_doctor": True,
        "products": [
            {"name": "Sunscreen SPF 50+", "brand": "La Roche-Posay", "score": 0.95},
            {"name": "Vitamin D Cream", "brand": "CeraVe", "score": 0.80}
        ],
        "food": {
            "eat": [
                {"name": "Antioxidant-rich foods", "reason": "Protect skin cells"},
                {"name": "Vitamin B12 foods", "reason": "Support pigmentation"}
            ],
            "avoid": [
                {"name": "Gluten", "reason": "May worsen autoimmune response"},
                {"name": "Processed foods", "reason": "Can trigger inflammation"}
            ]
        },
        "precautions": ["Use high SPF sunscreen daily", "Avoid sun exposure on affected areas"]
    },
    'contact_dermatitis': {
        "risk_level": "MODERATE",
        "requires_doctor": False,
        "products": [
            {"name": "Soothing Cream", "brand": "CeraVe", "score": 0.88},
            {"name": "Calamine Lotion", "brand": "Caladryl", "score": 0.82}
        ],
        "food": {
            "eat": [
                {"name": "Anti-inflammatory foods", "reason": "Support healing"},
                {"name": "Vitamin C foods", "reason": "Boost immune response"}
            ],
            "avoid": [
                {"name": "Known allergens", "reason": "Prevent flare-ups"}
            ]
        },
        "precautions": ["Identify and avoid triggers", "Wear gloves when handling chemicals", "Use gentle products"]
    },
    'urticaria': {
        "risk_level": "MODERATE",
        "requires_doctor": False,
        "products": [
            {"name": "Antihistamine Cream", "brand": "Benadryl", "score": 0.85},
            {"name": "Cooling Gel", "brand": "Aveeno", "score": 0.80}
        ],
        "food": {
            "eat": [
                {"name": "Fresh fruits and vegetables", "reason": "Reduce histamine levels"},
                {"name": "Quercetin-rich foods", "reason": "Natural antihistamine"}
            ],
            "avoid": [
                {"name": "Shellfish", "reason": "Common trigger"},
                {"name": "Fermented foods", "reason": "High in histamine"}
            ]
        },
        "precautions": ["Take antihistamines as directed", "Apply cool compresses", "Avoid known triggers"]
    },
    'fungal': {
        "risk_level": "MODERATE",
        "requires_doctor": False,
        "products": [
            {"name": "Antifungal Cream", "brand": "Lotrimin", "score": 0.90},
            {"name": "Clotrimazole Cream", "brand": "Canesten", "score": 0.88}
        ],
        "food": {
            "eat": [
                {"name": "Probiotic foods", "reason": "Restore healthy microbiome"},
                {"name": "Garlic", "reason": "Natural antifungal properties"}
            ],
            "avoid": [
                {"name": "Sugar", "reason": "Feeds fungal growth"},
                {"name": "Refined carbohydrates", "reason": "Promotes fungal overgrowth"}
            ]
        },
        "precautions": ["Keep area dry", "Wear breathable fabrics", "Complete full course of treatment"]
    },
    'rash': {
        "risk_level": "MODERATE",
        "requires_doctor": False,
        "products": [
            {"name": "Hydrocortisone Cream", "brand": "Cortizone-10", "score": 0.85},
            {"name": "Soothing Lotion", "brand": "Aveeno", "score": 0.82}
        ],
        "food": {
            "eat": [
                {"name": "Anti-inflammatory foods", "reason": "Support healing"},
                {"name": "Vitamin E foods", "reason": "Skin repair"}
            ],
            "avoid": [
                {"name": "Spicy foods", "reason": "Can worsen inflammation"},
                {"name": "Alcohol", "reason": "Dilates blood vessels"}
            ]
        },
        "precautions": ["Avoid scratching", "Keep moisturized", "Use gentle fragrance-free products"]
    },
    'normal': {
        "risk_level": "LOW",
        "requires_doctor": False,
        "products": [
            {"name": "Gentle Moisturizer", "brand": "CeraVe", "score": 0.95},
            {"name": "Sunscreen SPF 50", "brand": "La Roche-Posay", "score": 0.92}
        ],
        "food": {
            "eat": [
                {"name": "Balanced diet", "reason": "Maintain healthy skin"},
                {"name": "Antioxidant-rich foods", "reason": "Protect skin cells"},
                {"name": "Water-rich foods", "reason": "Keep skin hydrated"}
            ],
            "avoid": []
        },
        "precautions": ["Use sunscreen daily", "Stay hydrated", "Cleanse gently twice daily"]
    }
}


@recommend_bp.route("/recommend", methods=["POST"])
def recommend():
    """Get recommendations for a condition"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "JSON body required"}), 400

        disease = data.get("disease", "").lower().strip()
        symptoms = data.get("symptoms", [])

        logger.info(f"Recommendations requested for: {disease}")

        recs = RECOMMENDATIONS.get(disease, RECOMMENDATIONS.get('normal'))

        result = {
            "disease": disease,
            "symptoms": symptoms,
            "risk_assessment": {
                "level": recs.get("risk_level", "MODERATE"),
                "requires_doctor": recs.get("requires_doctor", False)
            },
            "recommendations": {
                "products": recs.get("products", []),
                "food": recs.get("food", {"eat": [], "avoid": []}),
                "precautions": recs.get("precautions", [])
            }
        }

        if disease == 'melanoma' or recs.get("emergency"):
            result["emergency"] = recs.get("emergency", {
                "message": "⚠️ URGENT: High risk condition detected",
                "action": "Please seek immediate dermatologist consultation"
            })

        return jsonify(result)

    except Exception as e:
        logger.error(f"Error in recommend: {e}")
        return jsonify({"error": str(e)}), 500