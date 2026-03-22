# services/symptom_service.py
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Symptom to condition mapping
SYMPTOM_CATEGORIES = {
    "itchy": ["eczema", "urticaria", "contact_dermatitis", "fungal"],
    "itching": ["eczema", "urticaria", "contact_dermatitis", "fungal"],
    "redness": ["acne", "eczema", "rosacea", "contact_dermatitis"],
    "red": ["acne", "eczema", "contact_dermatitis"],
    "rash": ["eczema", "contact_dermatitis", "urticaria", "fungal"],
    "dryness": ["eczema", "vitiligo", "psoriasis"],
    "dry": ["eczema", "vitiligo", "psoriasis"],
    "swelling": ["acne", "urticaria", "contact_dermatitis"],
    "swollen": ["acne", "urticaria", "contact_dermatitis"],
    "pain": ["acne", "melanoma", "fungal"],
    "painful": ["acne", "melanoma", "fungal"],
    "blistering": ["contact_dermatitis", "fungal", "eczema"],
    "blisters": ["contact_dermatitis", "fungal", "eczema"],
    "scaling": ["eczema", "psoriasis", "fungal"],
    "flaking": ["eczema", "psoriasis", "fungal"],
    "hives": ["urticaria", "contact_dermatitis"],
    "welts": ["urticaria"],
    "burning": ["contact_dermatitis", "acne", "fungal"],
    "pimples": ["acne"],
    "blackheads": ["acne"],
    "whiteheads": ["acne"],
    "oily": ["acne"],
    "pigmentation": ["vitiligo", "melanoma"],
    "white patches": ["vitiligo"],
    "dark spots": ["melanoma", "acne"],
    "mole": ["melanoma"],
    "peeling": ["fungal", "eczema", "contact_dermatitis"],
    "cracking": ["eczema", "fungal"],
    "oozing": ["eczema", "contact_dermatitis"],
    "crusty": ["eczema", "fungal", "contact_dermatitis"],
    "bumps": ["acne", "urticaria", "contact_dermatitis"],
    "inflammation": ["acne", "eczema", "contact_dermatitis"],
}

# Condition risk levels
CONDITION_RISK = {
    "melanoma": "HIGH",
    "eczema": "MODERATE-HIGH",
    "psoriasis": "MODERATE-HIGH",
    "vitiligo": "MODERATE",
    "acne": "MODERATE",
    "contact_dermatitis": "MODERATE",
    "urticaria": "MODERATE",
    "fungal": "LOW-MODERATE",
    "rosacea": "MODERATE",
}

# Basic care recommendations per condition
CONDITION_RECOMMENDATIONS = {
    "acne": ["Wash face twice daily with gentle cleanser", "Avoid touching your face", "Use non-comedogenic products", "Apply salicylic acid or benzoyl peroxide"],
    "eczema": ["Moisturize immediately after bathing", "Use fragrance-free products", "Avoid harsh soaps", "Wear soft breathable clothing"],
    "contact_dermatitis": ["Identify and avoid the trigger", "Apply cool compresses", "Use gentle fragrance-free products", "Consider patch testing"],
    "urticaria": ["Take antihistamines as directed", "Apply cool compresses", "Avoid known triggers", "Wear loose comfortable clothing"],
    "fungal": ["Keep affected area clean and dry", "Use antifungal cream as directed", "Wear breathable fabrics", "Complete full course of treatment"],
    "vitiligo": ["Use high SPF sunscreen on affected areas", "Consult a dermatologist for treatment options", "Avoid sun exposure without protection"],
    "melanoma": ["🚨 SEEK IMMEDIATE MEDICAL ATTENTION", "Do not delay — see a dermatologist today", "Avoid any sun exposure on affected area"],
    "rosacea": ["Use gentle fragrance-free skincare", "Wear SPF 30+ daily", "Avoid triggers like alcohol and spicy food"],
    "psoriasis": ["Moisturize frequently", "Take lukewarm baths", "Avoid skin injury", "Consult a dermatologist"],
}


def analyze_symptoms(symptoms: list) -> dict:
    """Analyze symptoms and return risk assessment with recommendations"""

    logger.info(f"Analyzing symptoms: {symptoms}")

    if not symptoms:
        return {"error": "No symptoms provided", "symptoms_analyzed": []}

    # Normalize symptoms
    normalized = [s.lower().strip() for s in symptoms]

    # Score each condition
    condition_scores = {}
    matched_keywords = []

    for symptom in normalized:
        # Direct match
        if symptom in SYMPTOM_CATEGORIES:
            matched_keywords.append(symptom)
            for condition in SYMPTOM_CATEGORIES[symptom]:
                condition_scores[condition] = condition_scores.get(condition, 0) + 1
        else:
            # Partial match — check if any keyword is contained in symptom
            for keyword, conditions in SYMPTOM_CATEGORIES.items():
                if keyword in symptom or symptom in keyword:
                    matched_keywords.append(keyword)
                    for condition in conditions:
                        condition_scores[condition] = condition_scores.get(condition, 0) + 0.5
                    break

    if not condition_scores:
        return {
            "risk": "LOW",
            "message": "Your symptoms are not clearly associated with a specific skin condition. Consider consulting a dermatologist if symptoms persist.",
            "inferred_condition": "unknown",
            "symptoms_analyzed": symptoms,
            "matched_keywords": [],
            "recommendations": ["Keep skin clean and moisturized", "Monitor symptoms", "Consult a dermatologist if symptoms persist"],
            "analysis_method": "rule-based"
        }

    # Get top condition
    top_condition = max(condition_scores, key=condition_scores.get)
    risk = CONDITION_RISK.get(top_condition, "MODERATE")

    # Build message
    display_name = top_condition.replace("_", " ").title()
    if risk == "HIGH":
        message = f"🚨 URGENT: Your symptoms strongly suggest {display_name}. Please seek immediate medical attention."
    elif risk == "MODERATE-HIGH":
        message = f"⚠️ Your symptoms suggest {display_name}. Please consult a dermatologist soon."
    else:
        message = f"Based on your symptoms, you may have {display_name}. Monitor and consult a doctor if symptoms persist."

    # Sort conditions by score for display
    sorted_conditions = sorted(condition_scores.items(), key=lambda x: x[1], reverse=True)
    top_conditions = [{"condition": c, "score": round(s, 2)} for c, s in sorted_conditions[:5]]

    result = {
        "risk": risk,
        "message": message,
        "inferred_condition": top_condition,
        "display_name": display_name,
        "symptoms_analyzed": symptoms,
        "matched_keywords": list(set(matched_keywords)),
        "top_conditions": top_conditions,
        "recommendations": CONDITION_RECOMMENDATIONS.get(top_condition, ["Consult a dermatologist", "Keep area clean"]),
        "analysis_method": "rule-based"
    }

    if top_condition == "melanoma":
        result["emergency"] = {
            "message": "⚠️ URGENT: Potential Melanoma Symptoms Detected",
            "action": "Please seek immediate dermatologist consultation"
        }

    return result