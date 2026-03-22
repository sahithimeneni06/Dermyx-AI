"""
Simple Ingredient Service - No dependencies on ML models
"""

import re
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Simple ingredient database
INGREDIENT_DB = {
    "water": {"rating": "Best", "description": "Safe, essential"},
    "glycerin": {"rating": "Best", "description": "Hydrating, safe"},
    "hyaluronic acid": {"rating": "Best", "description": "Excellent humectant"},
    "ceramides": {"rating": "Best", "description": "Barrier repair"},
    "niacinamide": {"rating": "Good", "description": "Multi-benefit"},
    "salicylic acid": {"rating": "Good", "description": "Exfoliant"},
    "glycolic acid": {"rating": "Average", "description": "Strong exfoliant"},
    "alcohol": {"rating": "Bad", "description": "Drying"},
    "fragrance": {"rating": "Bad", "description": "Irritant"},
    "parabens": {"rating": "Average", "description": "Preservative"},
    "sodium lauryl sulfate": {"rating": "Bad", "description": "Harsh cleanser"},
    "benzoyl peroxide": {"rating": "Good", "description": "Acne treatment"},
    "retinol": {"rating": "Good", "description": "Anti-aging"},
    "vitamin c": {"rating": "Best", "description": "Antioxidant"},
    "shea butter": {"rating": "Best", "description": "Moisturizing"},
}

def simple_match(ingredient):
    """Simple substring matching"""
    ingredient = ingredient.lower().strip()
    
    for db_ing, data in INGREDIENT_DB.items():
        if db_ing in ingredient or ingredient in db_ing:
            return db_ing, data["rating"], 0.9
    
    return None, "Unknown", 0.5

def analyze_ingredient_text(ingredients_text):
    """Analyze ingredients from text"""
    if isinstance(ingredients_text, str):
        ingredients_list = [i.strip() for i in ingredients_text.split(',') if i.strip()]
    else:
        ingredients_list = ingredients_text
    
    results = []
    for ing in ingredients_list:
        matched, rating, confidence = simple_match(ing)
        results.append({
            "input": ing.title(),
            "matched": matched.title() if matched else None,
            "rating": rating,
            "confidence": confidence
        })
    
    # Generate report
    total = len(results)
    safe = sum(1 for r in results if r["rating"] in ["Best", "Good"])
    caution = sum(1 for r in results if r["rating"] in ["Average", "Bad"])
    unknown = sum(1 for r in results if r["rating"] == "Unknown")
    
    if any(r["rating"] == "Bad" for r in results):
        overall = "Not Recommended"
    elif safe >= total * 0.7:
        overall = "Best"
    elif safe >= total * 0.5:
        overall = "Good"
    else:
        overall = "Average"
    
    warnings = [f"{r['input']} may be irritating" for r in results if r["rating"] == "Bad"]
    
    return {
        "overall_rating": overall,
        "overall_confidence": 85.5,
        "ingredients": results,
        "warnings": warnings,
        "total_ingredients": total,
        "safe_count": safe,
        "caution_count": caution,
        "unknown_count": unknown
    }

def analyze_ingredient_image(image_path):
    """Placeholder for image analysis"""
    logger.warning("Image analysis not available in simple version")
    # Return empty result with note
    return {
        "overall_rating": "Unknown",
        "overall_confidence": 0,
        "ingredients": [],
        "warnings": ["Image analysis not available in this version"],
        "total_ingredients": 0,
        "safe_count": 0,
        "caution_count": 0,
        "unknown_count": 0,
        "note": "Please use text input for now"
    }