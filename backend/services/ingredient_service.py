"""
Ingredient Analysis Service - Standalone Version with OCR Support
"""
import os
import re
import logging
from PIL import Image
import easyocr

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Comprehensive ingredient database
INGREDIENT_DATABASE = {
    # Best ingredients (safe and beneficial)
    "water": {"rating": "Best", "description": "Safe, essential base ingredient"},
    "glycerin": {"rating": "Best", "description": "Excellent humectant, safe for all skin types"},
    "hyaluronic acid": {"rating": "Best", "description": "Powerful humectant, very safe"},
    "sodium hyaluronate": {"rating": "Best", "description": "Hydrating, safe humectant"},
    "ceramides": {"rating": "Best", "description": "Restores skin barrier, excellent for dry skin"},
    "ceramide np": {"rating": "Best", "description": "Skin barrier repair ingredient"},
    "niacinamide": {"rating": "Best", "description": "Multi-benefit ingredient, generally safe"},
    "vitamin c": {"rating": "Best", "description": "Antioxidant, brightening, generally safe"},
    "ascorbic acid": {"rating": "Best", "description": "Vitamin C, antioxidant"},
    "shea butter": {"rating": "Best", "description": "Moisturizing, safe for most skin types"},
    "aloe vera": {"rating": "Best", "description": "Soothing, anti-inflammatory"},
    "aloe barbadensis": {"rating": "Best", "description": "Soothing, moisturizing"},
    "squalane": {"rating": "Best", "description": "Non-comedogenic moisturizer"},
    "panthenol": {"rating": "Best", "description": "Vitamin B5, soothing and moisturizing"},
    "allantoin": {"rating": "Best", "description": "Soothing, healing properties"},
    "tocopherol": {"rating": "Best", "description": "Vitamin E, antioxidant"},
    "centella asiatica": {"rating": "Best", "description": "Soothing, healing properties"},
    "madecassoside": {"rating": "Best", "description": "Calming, skin barrier support"},
    "green tea extract": {"rating": "Best", "description": "Antioxidant, anti-inflammatory"},
    "chamomile extract": {"rating": "Best", "description": "Soothing, calming"},
    
    # Good ingredients (generally safe, may have minor concerns)
    "salicylic acid": {"rating": "Good", "description": "Effective for acne, may irritate sensitive skin"},
    "benzoyl peroxide": {"rating": "Good", "description": "Effective for acne, can be drying"},
    "retinol": {"rating": "Good", "description": "Effective anti-aging, can cause irritation"},
    "glycolic acid": {"rating": "Good", "description": "Effective exfoliant, can cause irritation"},
    "lactic acid": {"rating": "Good", "description": "Gentle exfoliant, hydrating"},
    "mandelic acid": {"rating": "Good", "description": "Gentle exfoliant, good for sensitive skin"},
    "coconut oil": {"rating": "Good", "description": "Moisturizing, may clog pores for some"},
    "jojoba oil": {"rating": "Good", "description": "Non-comedogenic, similar to skin's natural oils"},
    "argan oil": {"rating": "Good", "description": "Moisturizing, rich in antioxidants"},
    "tea tree oil": {"rating": "Good", "description": "Antibacterial, may cause irritation if undiluted"},
    "witch hazel": {"rating": "Good", "description": "Astringent, may be drying"},
    "zinc oxide": {"rating": "Good", "description": "Physical sunscreen, generally safe"},
    "titanium dioxide": {"rating": "Good", "description": "Physical sunscreen, generally safe"},
    "kaolin": {"rating": "Good", "description": "Gentle clay, absorbs oil"},
    "bentonite": {"rating": "Good", "description": "Clay, good for oily skin"},
    
    # Average ingredients (neutral, may have concerns)
    "dimethicone": {"rating": "Average", "description": "Silicone, can be occlusive"},
    "cyclomethicone": {"rating": "Average", "description": "Silicone, can cause buildup"},
    "parabens": {"rating": "Average", "description": "Preservative, some concerns about safety"},
    "methylparaben": {"rating": "Average", "description": "Preservative, generally safe in small amounts"},
    "ethylparaben": {"rating": "Average", "description": "Preservative, generally safe in small amounts"},
    "propylparaben": {"rating": "Average", "description": "Preservative, some concerns"},
    "butylparaben": {"rating": "Average", "description": "Preservative, some concerns"},
    "phenoxyethanol": {"rating": "Average", "description": "Preservative, generally safe"},
    "ethylhexylglycerin": {"rating": "Average", "description": "Preservative booster, generally safe"},
    "cetearyl alcohol": {"rating": "Average", "description": "Fatty alcohol, can be comedogenic"},
    "cetyl alcohol": {"rating": "Average", "description": "Fatty alcohol, can be comedogenic"},
    "stearyl alcohol": {"rating": "Average", "description": "Fatty alcohol, can be comedogenic"},
    "polysorbate 20": {"rating": "Average", "description": "Emulsifier, generally safe"},
    "polysorbate 60": {"rating": "Average", "description": "Emulsifier, generally safe"},
    "carbomer": {"rating": "Average", "description": "Thickener, generally safe"},
    "xanthan gum": {"rating": "Average", "description": "Thickener, generally safe"},
    
    # Bad ingredients (avoid)
    "alcohol": {"rating": "Bad", "description": "Can be drying and irritating"},
    "alcohol denat": {"rating": "Bad", "description": "Drying, can damage skin barrier"},
    "sd alcohol": {"rating": "Bad", "description": "Drying, irritating"},
    "fragrance": {"rating": "Bad", "description": "Common allergen, can irritate sensitive skin"},
    "parfum": {"rating": "Bad", "description": "Fragrance, common allergen"},
    "sodium lauryl sulfate": {"rating": "Bad", "description": "Can be stripping and irritating"},
    "sls": {"rating": "Bad", "description": "Harsh surfactant, can strip skin"},
    "sodium laureth sulfate": {"rating": "Bad", "description": "Can be irritating"},
    "sles": {"rating": "Bad", "description": "Can be irritating"},
    "mineral oil": {"rating": "Bad", "description": "Can clog pores, derived from petroleum"},
    "petrolatum": {"rating": "Bad", "description": "Can be occlusive, may clog pores"},
    "lanolin": {"rating": "Bad", "description": "Common allergen"},
    "formaldehyde": {"rating": "Bad", "description": "Preservative, known irritant"},
    "dmdm hydantoin": {"rating": "Bad", "description": "Formaldehyde-releasing preservative"},
    "imidazolidinyl urea": {"rating": "Bad", "description": "Formaldehyde-releasing preservative"},
    "phthalates": {"rating": "Bad", "description": "Endocrine disruptor concerns"},
    "triclosan": {"rating": "Bad", "description": "Antibacterial, concerns about resistance"},
    "oxybenzone": {"rating": "Bad", "description": "Chemical sunscreen, potential hormone disruptor"},
}

# Common non-ingredient words to filter out
STOP_WORDS = {
    'and', 'with', 'may', 'contain', 'contains', 'ingredients', 'ingrédients', 
    'composition', 'other', 'product', 'cosmetic', 'vanilla', 'beige', 
    'fragrance', 'parfum', 'for', 'the', 'this', 'that', 'from', 'are',
    'not', 'but', 'has', 'have', 'been', 'was', 'were', 'will', 'can',
    'could', 'should', 'would', 'more', 'less', 'some', 'any', 'all',
    'each', 'every', 'both', 'either', 'neither', 'only', 'just'
}

# Initialize OCR
try:
    reader = easyocr.Reader(['en'])
    OCR_AVAILABLE = True
    logger.info("✅ EasyOCR initialized successfully")
except Exception as e:
    OCR_AVAILABLE = False
    logger.error(f"❌ OCR init failed: {e}")


class StandaloneIngredientAnalyzer:
    """Fast, standalone ingredient analyzer - no external dependencies"""
    
    def __init__(self):
        self.ingredient_db = INGREDIENT_DATABASE
        logger.info("✅ StandaloneIngredientAnalyzer initialized")
        logger.info(f"   Database contains {len(self.ingredient_db)} ingredients")
    
    def extract_ingredients_from_text(self, text):
        """Extract ingredients from text input"""
        if not text:
            return []
        
        text = text.lower()
        
        # Try to find ingredients section
        ingredients_text = text
        patterns = [
            r'ingredients[:\s]+(.+?)(?:\n\n|$)',
            r'ingr[ée]dients[:\s]+(.+?)(?:\n\n|$)',
            r'contains[:\s]+(.+?)(?:\n\n|$)',
            r'list of ingredients[:\s]+(.+?)(?:\n\n|$)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.DOTALL)
            if match:
                ingredients_text = match.group(1)
                logger.info(f"Found ingredients section with pattern: {pattern}")
                break
        
        # Split by common separators
        separators = r'[,;•\n•-]'
        raw_parts = re.split(separators, ingredients_text)
        
        # Clean and filter
        ingredients = []
        for part in raw_parts:
            # Clean the ingredient
            ing = part.strip()
            # Remove numbers, special chars, and extra spaces
            ing = re.sub(r'[^\w\s-]', '', ing)
            ing = re.sub(r'\s+', ' ', ing).strip()
            
            # Filter out stop words and short items
            if (len(ing) > 2 and 
                not ing.isdigit() and 
                ing not in STOP_WORDS and
                not ing in ['', ' ', '.', ',', ';']):
                ingredients.append(ing)
        
        # Remove duplicates while preserving order
        seen = set()
        unique_ingredients = []
        for ing in ingredients:
            if ing not in seen:
                seen.add(ing)
                unique_ingredients.append(ing)
        
        logger.info(f"Extracted {len(unique_ingredients)} ingredients from text")
        return unique_ingredients[:30]  # Limit to 30 ingredients
    
    def match_ingredient(self, ingredient):
        """Match ingredient against database"""
        ingredient_lower = ingredient.lower()
        
        # Try exact match first
        if ingredient_lower in self.ingredient_db:
            data = self.ingredient_db[ingredient_lower]
            return {
                "input": ingredient,
                "matched": ingredient,
                "rating": data["rating"],
                "confidence": 0.95,
                "description": data["description"]
            }
        
        # Try partial match (ingredient contains known word)
        for known_ing, data in self.ingredient_db.items():
            if known_ing in ingredient_lower:
                return {
                    "input": ingredient,
                    "matched": known_ing,
                    "rating": data["rating"],
                    "confidence": 0.75,
                    "description": data["description"]
                }
        
        # Try word-by-word matching
        words = ingredient_lower.split()
        for word in words:
            if len(word) > 3:
                for known_ing, data in self.ingredient_db.items():
                    if word in known_ing or known_ing in word:
                        return {
                            "input": ingredient,
                            "matched": known_ing,
                            "rating": data["rating"],
                            "confidence": 0.65,
                            "description": data["description"]
                        }
        
        # Unknown ingredient
        return {
            "input": ingredient,
            "matched": None,
            "rating": "Unknown",
            "confidence": 0.3,
            "description": "Not in our database - research this ingredient"
        }
    
    def analyze_ingredients(self, ingredients_list):
        """Analyze a list of ingredients"""
        results = []
        for ing in ingredients_list:
            results.append(self.match_ingredient(ing))
        return results
    
    def analyze_text(self, text):
        """Analyze ingredients from text"""
        ingredients = self.extract_ingredients_from_text(text)
        if not ingredients:
            return []
        return self.analyze_ingredients(ingredients)
    
    def generate_report(self, results):
        """Generate comprehensive report from analysis results"""
        if not results:
            return {
                "overall_rating": "Unknown",
                "overall_confidence": 0,
                "ingredients": [],
                "warnings": [],
                "summary": "No ingredients detected. Please check the input.",
                "total_ingredients": 0,
                "best_count": 0,
                "good_count": 0,
                "average_count": 0,
                "bad_count": 0,
                "unknown_count": 0,
                "safe_count": 0,
                "caution_count": 0,
                "breakdown": {"Best": 0, "Good": 0, "Average": 0, "Bad": 0, "Unknown": 0},
                "safe_percentage": 0,
                "bad_percentage": 0
            }
        
        # Count ratings
        breakdown = {"Best": 0, "Good": 0, "Average": 0, "Bad": 0, "Unknown": 0}
        for r in results:
            rating = r.get("rating", "Unknown")
            breakdown[rating] = breakdown.get(rating, 0) + 1
        
        total = len(results)
        best_count = breakdown.get("Best", 0)
        good_count = breakdown.get("Good", 0)
        average_count = breakdown.get("Average", 0)
        bad_count = breakdown.get("Bad", 0)
        unknown_count = breakdown.get("Unknown", 0)
        
        safe_count = best_count + good_count
        caution_count = average_count + bad_count
        
        # Calculate percentages
        safe_percentage = (safe_count / total) * 100 if total > 0 else 0
        bad_percentage = (bad_count / total) * 100 if total > 0 else 0
        
        # Determine overall rating
        if bad_count >= total * 0.3:  # 30% or more are Bad
            overall_rating = "Not Recommended"
            summary = f"⚠️ Contains {bad_count} potentially harmful ingredients. Consider alternatives."
        elif bad_count >= total * 0.15:  # 15-30% are Bad
            overall_rating = "Use with Caution"
            summary = f"⚠️ Contains {bad_count} concerning ingredients. Patch test before use."
        elif safe_percentage >= 70:  # 70% or more are Best/Good
            overall_rating = "Recommended"
            summary = f"✅ {safe_count} safe ingredients. This product is likely safe for most skin types."
        elif safe_percentage >= 50:  # 50-70% are Best/Good
            overall_rating = "Good"
            summary = f"👍 {safe_count} good ingredients. Generally safe with minor concerns."
        elif unknown_count >= total * 0.5:  # 50% or more are Unknown
            overall_rating = "Unknown"
            summary = f"❓ {unknown_count} unknown ingredients. Research recommended."
        else:
            overall_rating = "Average"
            summary = f"📊 Mixed ingredients. {safe_count} safe, {bad_count} concerning."
        
        # Calculate overall confidence (weighted average)
        valid_confidences = [r.get("confidence", 0) for r in results if r.get("rating") != "Unknown"]
        overall_confidence = round((sum(valid_confidences) / len(valid_confidences)) * 100, 1) if valid_confidences else 50.0
        
        # Generate warnings for Bad ingredients
        warnings = [f"{r['input']}: {r['description']}" for r in results if r.get("rating") == "Bad"]
        
        # Sort results by rating (Best first)
        rating_order = {"Best": 1, "Good": 2, "Average": 3, "Bad": 4, "Unknown": 5}
        sorted_results = sorted(results, key=lambda x: rating_order.get(x.get("rating", "Unknown"), 99))
        
        return {
            "overall_rating": overall_rating,
            "overall_confidence": overall_confidence,
            "ingredients": sorted_results,
            "warnings": warnings[:10],  # Limit to 10 warnings
            "summary": summary,
            "total_ingredients": total,
            "best_count": best_count,
            "good_count": good_count,
            "average_count": average_count,
            "bad_count": bad_count,
            "unknown_count": unknown_count,
            "safe_count": safe_count,
            "caution_count": caution_count,
            "breakdown": breakdown,
            "safe_percentage": round(safe_percentage, 1),
            "bad_percentage": round(bad_percentage, 1)
        }


# Global analyzer instance
analyzer = None

try:
    analyzer = StandaloneIngredientAnalyzer()
    logger.info("✅ StandaloneIngredientAnalyzer initialized successfully")
except Exception as e:
    logger.error(f"❌ Failed to initialize analyzer: {e}")
    import traceback
    traceback.print_exc()
    analyzer = None


def analyze_ingredient_image(image_path):
    """Analyze ingredients from an image using OCR"""
    global analyzer

    if analyzer is None:
        raise RuntimeError("Ingredient analyzer not initialized")

    logger.info(f"Analyzing image: {image_path}")

    if not OCR_AVAILABLE:
        return {
            "overall_rating": "OCR Not Available",
            "overall_confidence": 0,
            "ingredients": [],
            "warnings": [],
            "summary": "OCR system not initialized. Please use text input instead.",
            "total_ingredients": 0,
            "best_count": 0,
            "good_count": 0,
            "average_count": 0,
            "bad_count": 0,
            "unknown_count": 0,
            "safe_count": 0,
            "caution_count": 0,
            "breakdown": {"Best": 0, "Good": 0, "Average": 0, "Bad": 0, "Unknown": 0},
            "safe_percentage": 0,
            "bad_percentage": 0,
            "note": "OCR failed to load. Please install easyocr and ensure dependencies are available."
        }

    try:
        # 🔍 Extract text using OCR
        logger.info("Running OCR on image...")
        results = reader.readtext(image_path, detail=0)
        extracted_text = " ".join(results)

        logger.info(f"OCR Extracted Text: {extracted_text[:200]}...")

        if not extracted_text.strip():
            return {
                "overall_rating": "No Text Found",
                "overall_confidence": 0,
                "ingredients": [],
                "warnings": [],
                "summary": "Could not detect any ingredients text in the image. Please ensure the image is clear and contains readable text.",
                "total_ingredients": 0,
                "best_count": 0,
                "good_count": 0,
                "average_count": 0,
                "bad_count": 0,
                "unknown_count": 0,
                "safe_count": 0,
                "caution_count": 0,
                "breakdown": {"Best": 0, "Good": 0, "Average": 0, "Bad": 0, "Unknown": 0},
                "safe_percentage": 0,
                "bad_percentage": 0,
                "note": "OCR detected no text. Try a clearer image or use text input."
            }

        # 🔥 Use existing analyzer
        analysis_results = analyzer.analyze_text(extracted_text)
        report = analyzer.generate_report(analysis_results)
        
        # Add OCR metadata to the report
        report["ocr_text_preview"] = extracted_text[:500]
        report["ocr_available"] = True
        
        logger.info(f"Image analysis complete: {report['overall_rating']} - {report['total_ingredients']} ingredients found")
        
        return report

    except Exception as e:
        logger.error(f"OCR processing failed: {e}")
        import traceback
        traceback.print_exc()
        return {
            "overall_rating": "Error",
            "overall_confidence": 0,
            "ingredients": [],
            "warnings": [],
            "summary": f"Failed to process image: {str(e)}",
            "total_ingredients": 0,
            "best_count": 0,
            "good_count": 0,
            "average_count": 0,
            "bad_count": 0,
            "unknown_count": 0,
            "safe_count": 0,
            "caution_count": 0,
            "breakdown": {"Best": 0, "Good": 0, "Average": 0, "Bad": 0, "Unknown": 0},
            "safe_percentage": 0,
            "bad_percentage": 0,
            "note": f"Error: {str(e)}"
        }


def analyze_ingredient_text(ingredients_text):
    """Analyze ingredients from text input"""
    global analyzer
    
    if analyzer is None:
        raise RuntimeError("Ingredient analyzer not initialized")
    
    logger.info(f"Analyzing text: {ingredients_text[:100]}...")
    
    # Handle different input types
    if isinstance(ingredients_text, str):
        # Direct text analysis
        results = analyzer.analyze_text(ingredients_text)
    elif isinstance(ingredients_text, list):
        # List of ingredients
        results = analyzer.analyze_ingredients(ingredients_text)
    else:
        raise ValueError(f"Invalid ingredients type: {type(ingredients_text)}")
    
    report = analyzer.generate_report(results)
    logger.info(f"Analysis complete: {report['overall_rating']} - {report['total_ingredients']} ingredients")
    
    return report


# Optional: Add a convenience function for direct OCR
def extract_text_from_image(image_path):
    """Extract raw text from an image using OCR"""
    if not OCR_AVAILABLE:
        raise RuntimeError("OCR not available. Please install easyocr.")
    
    try:
        results = reader.readtext(image_path, detail=0)
        return " ".join(results)
    except Exception as e:
        logger.error(f"OCR extraction failed: {e}")
        raise