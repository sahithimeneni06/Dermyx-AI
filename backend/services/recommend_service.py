
import json
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from typing import Dict, List, Tuple, Optional
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")

class SkinDiseaseRecommender:
    
    def __init__(self, data_path: str = None):
        """
        Initialize the recommender system with all required data files
        """
        if data_path is None:
            self.data_path = DATA_DIR
        else:
            self.data_path = data_path
            
        logger.info(f"📂 Loading data from: {self.data_path}")
        self.load_data()
        self.prepare_features()
        
    def load_data(self):
        """Load all required JSON data files"""
        try:
            # Load product catalog - try multiple possible filenames
            product_files = ['product_catalog.json', 'product_catalog (1).json']
            self.products = None
            
            for product_file in product_files:
                product_path = os.path.join(self.data_path, product_file)
                if os.path.exists(product_path):
                    with open(product_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        if isinstance(data, dict) and "products" in data:
                            self.products = data["products"]
                        elif isinstance(data, list):
                            self.products = data
                        logger.info(f"✅ Loaded products from: {product_file}")
                        break
            
            if self.products is None:
                logger.warning("⚠️ No product catalog found, using empty list")
                self.products = []
            
            # Load food rules
            food_path = os.path.join(self.data_path, "food_rules.json")
            if os.path.exists(food_path):
                with open(food_path, 'r', encoding='utf-8') as f:
                    self.food_rules = json.load(f)
                logger.info(f"✅ Loaded food rules: {len(self.food_rules)} items")
            else:
                logger.warning("⚠️ food_rules.json not found")
                self.food_rules = {}
            
            # Load ingredient triggers
            triggers_path = os.path.join(self.data_path, "ingredient_triggers.json")
            if os.path.exists(triggers_path):
                with open(triggers_path, 'r', encoding='utf-8') as f:
                    self.triggers = json.load(f)
                logger.info(f"✅ Loaded ingredient triggers: {len(self.triggers)} items")
            else:
                logger.warning("⚠️ ingredient_triggers.json not found")
                self.triggers = {}
            
            # Load symptom weights
            symptom_weights_path = os.path.join(self.data_path, "symptom_weights.json")
            if os.path.exists(symptom_weights_path):
                with open(symptom_weights_path, 'r', encoding='utf-8') as f:
                    self.symptom_weights = json.load(f)
                logger.info(f"✅ Loaded symptom weights: {len(self.symptom_weights)} items")
            else:
                logger.warning("⚠️ symptom_weights.json not found")
                self.symptom_weights = {}
            
            # Load ingredient database
            ingr_path = os.path.join(self.data_path, "ingr_file.json")
            if os.path.exists(ingr_path):
                with open(ingr_path, 'r', encoding='utf-8') as f:
                    self.ingredient_db = json.load(f)
                logger.info(f"✅ Loaded ingredient database: {len(self.ingredient_db)} items")
            else:
                logger.warning("⚠️ ingr_file.json not found")
                self.ingredient_db = []
            
            # Load disease profiles
            disease_profiles_path = os.path.join(self.data_path, "disease_profiles.json")
            if os.path.exists(disease_profiles_path):
                with open(disease_profiles_path, 'r', encoding='utf-8') as f:
                    self.disease_profiles = json.load(f)
                logger.info(f"✅ Loaded disease profiles: {len(self.disease_profiles)} items")
            else:
                logger.warning("⚠️ disease_profiles.json not found")
                self.disease_profiles = {}
                
            logger.info("✓ All data files loaded successfully")
            
        except Exception as e:
            logger.error(f"✗ Error loading data files: {e}")
            # Initialize empty defaults
            self.products = []
            self.food_rules = {}
            self.triggers = {}
            self.symptom_weights = {}
            self.ingredient_db = []
            self.disease_profiles = {}
    
    def prepare_features(self):
        """Prepare all features and lookup tables"""
        
        # High risk diseases
        self.high_risk_diseases = []
        if self.disease_profiles:
            self.high_risk_diseases = [
                d.lower() for d, v in self.disease_profiles.items() 
                if v.get("risk", "").lower() == "high"
            ]
        
        # Ingredient rating lookup
        self.ingredient_lookup = {}
        if self.ingredient_db:
            for item in self.ingredient_db:
                if isinstance(item, dict) and "ingredient" in item:
                    self.ingredient_lookup[item["ingredient"].lower()] = item.get("rating", "Unknown")
        
        # Rating to score mapping
        self.rating_score_map = {
            "Best": 1.0,
            "Good": 0.8,
            "Average": 0.5,
            "Poor": 0.3,
            "Bad": 0.1,
            "Avoid": 0.0,
            "Unknown": 0.4
        }
        
        # Create TF-IDF vectors if products exist
        if self.products:
            self._prepare_vectors()
        
        logger.info("✓ Features prepared successfully")
    
    def _prepare_vectors(self):
        """Create TF-IDF vectors for products"""
        try:
            corpus = []
            valid_products = []
            
            for p in self.products:
                if "ingredients" in p and isinstance(p["ingredients"], list):
                    text = " ".join([
                        p.get("name", ""),
                        " ".join(p.get("ingredients", [])),
                        p.get("category", ""),
                        " ".join(p.get("safe_for", []))
                    ]).lower()
                    corpus.append(text)
                    valid_products.append(p)
            
            if corpus:
                self.products = valid_products
                self.vectorizer = TfidfVectorizer(max_features=500, stop_words='english')
                self.product_vectors = self.vectorizer.fit_transform(corpus)
                logger.info(f"✅ Created vectors for {len(self.products)} products")
            else:
                logger.warning("⚠️ No valid products for vectorization")
                self.product_vectors = None
                
        except Exception as e:
            logger.error(f"❌ Failed to create vectors: {e}")
            self.product_vectors = None
    
    # ---------------------------------
    # RISK ASSESSMENT
    # ---------------------------------
    
    def assess_risk(self, disease: str, symptoms: List[str]) -> Dict:
        disease = disease.lower()
        
        # Check if high risk
        if disease in self.high_risk_diseases:
            return {
                "level": "HIGH",
                "score": 1.0,
                "requires_doctor": True,
                "message": f"HIGH-RISK CONDITION: {disease.upper()} requires immediate medical attention"
            }
        
        # Calculate severity score
        if not symptoms:
            severity_score = 0
        else:
            severity = 0
            for symptom in symptoms:
                weight = self.symptom_weights.get(symptom.lower(), 0.5)
                severity += weight
            
            severity_score = severity / len(symptoms)
            severity_score = min(severity_score, 1.0)
        
        # Determine risk level
        if severity_score >= 0.8:
            risk_level = "HIGH"
            requires_doctor = True
        elif severity_score >= 0.6:
            risk_level = "MODERATE-HIGH"
            requires_doctor = True
        elif severity_score >= 0.4:
            risk_level = "MODERATE"
            requires_doctor = False
        else:
            risk_level = "LOW"
            requires_doctor = False
        
        return {
            "level": risk_level,
            "score": severity_score,
            "requires_doctor": requires_doctor,
            "message": f"Risk Level: {risk_level} (Severity: {severity_score:.2f})"
        }
    
    # ---------------------------------
    # SAFETY FILTERING
    # ---------------------------------
    
    def apply_safety_filters(self, disease: str) -> List[Dict]:
        """
        Apply strict safety filters to products
        """
        disease = disease.lower()
        safe_products = []
        
        for product in self.products:
            # Check unsafe_for list
            if "unsafe_for" in product:
                unsafe_diseases = [d.lower() for d in product["unsafe_for"]]
                if disease in unsafe_diseases:
                    continue
            
            # Check safe_for list (if exists)
            if "safe_for" in product:
                safe_diseases = [d.lower() for d in product["safe_for"]]
                if disease not in safe_diseases:
                    continue
            
            # Check ingredient triggers
            has_conflict = False
            for ingredient in product.get("ingredients", []):
                ing_lower = ingredient.lower()
                
                for trigger_ing, diseases in self.triggers.items():
                    if trigger_ing.lower() == ing_lower:
                        trigger_diseases = [d.lower() for d in diseases]
                        if disease in trigger_diseases:
                            has_conflict = True
                            break
                
                if has_conflict:
                    break
            
            if not has_conflict:
                safe_products.append(product)
        
        return safe_products
    
    # ---------------------------------
    # SCORING FUNCTIONS
    # ---------------------------------
    
    def ingredient_score(self, ingredients: List[str], disease: str = None) -> float:
        """
        Calculate score based on ingredient quality
        """
        if not ingredients:
            return 0.5
        
        scores = []
        for ingredient in ingredients:
            ing_lower = ingredient.lower()
            
            rating = self.ingredient_lookup.get(ing_lower)
            if rating:
                score = self.rating_score_map.get(rating, 0.5)
                scores.append(score)
            else:
                scores.append(0.4)  # Unknown ingredient
        
        return np.mean(scores) if scores else 0.5
    
    def content_score(self, user_profile: str, product: Dict) -> float:
        """
        Calculate content-based similarity score
        """
        if self.product_vectors is None:
            return 0.5
        
        # Create product description
        product_text = " ".join([
            product.get("name", ""),
            " ".join(product.get("ingredients", [])),
            product.get("category", ""),
            " ".join(product.get("safe_for", []))
        ]).lower()
        
        # Create user profile
        user_text = user_profile.lower()
        
        try:
            user_vec = self.vectorizer.transform([user_text])
            product_vec = self.vectorizer.transform([product_text])
            similarity = cosine_similarity(user_vec, product_vec)[0][0]
            return float(similarity)
        except:
            return 0.3
    
    def disease_match_score(self, disease: str, product: Dict) -> float:
        """
        Calculate disease-specific match score
        """
        disease = disease.lower()
        
        # Direct match in safe_for
        if "safe_for" in product:
            if disease in [d.lower() for d in product["safe_for"]]:
                return 1.0
        
        # Partial match in description/category
        product_text = f"{product.get('name', '')} {product.get('category', '')}".lower()
        if disease in product_text:
            return 0.7
        
        return 0.2
    
    # ---------------------------------
    # PRODUCT RECOMMENDATIONS
    # ---------------------------------
    
    def recommend_products(self, 
                          disease: str, 
                          symptoms: List[str],
                          top_n: int = 5) -> List[Dict]:
        """
        Generate product recommendations using hybrid ranking
        """
        if not self.products:
            return [{
                "name": "No Products Available",
                "message": "Product catalog is empty. Please check data files.",
                "score": 0
            }]
        
        # Create user profile
        user_profile = f"{disease} {' '.join(symptoms)}"
        
        # Apply safety filters
        safe_products = self.apply_safety_filters(disease)
        
        if not safe_products:
            return [{
                "name": "No Safe Products Found",
                "message": "No clinically safe products found. Please consult a dermatologist.",
                "score": 0
            }]
        
        # Calculate scores for each product
        ranked_products = []
        
        for product in safe_products:
            ing_score = self.ingredient_score(product.get("ingredients", []), disease)
            content_sim = self.content_score(user_profile, product)
            disease_match = self.disease_match_score(disease, product)
            
            risk = self.assess_risk(disease, symptoms)
            
            # Hybrid scoring
            if risk["level"] in ["MODERATE-HIGH", "HIGH"]:
                final_score = (
                    0.50 * ing_score +
                    0.25 * content_sim +
                    0.25 * disease_match
                )
            else:
                final_score = (
                    0.40 * ing_score +
                    0.35 * content_sim +
                    0.25 * disease_match
                )
            
            ranked_products.append({
                "name": product.get("name", "Unknown"),
                "brand": product.get("brand", "Unknown"),
                "price": product.get("price", "N/A"),
                "category": product.get("category", "General"),
                "ingredients": product.get("ingredients", []),
                "scores": {
                    "ingredient": round(ing_score, 3),
                    "similarity": round(content_sim, 3),
                    "disease_match": round(disease_match, 3),
                    "final": round(final_score, 3)
                },
                "score": final_score
            })
        
        # Sort by final score
        ranked_products.sort(key=lambda x: x["score"], reverse=True)
        
        return ranked_products[:top_n]
    
    # ---------------------------------
    # FOOD RECOMMENDATIONS
    # ---------------------------------
    
    def recommend_food(self, disease: str) -> Dict:
        """
        Generate food recommendations
        """
        disease = disease.lower()
        eat = []
        avoid = []
        
        for food, rules in self.food_rules.items():
            # Check if recommended
            if "recommended_for" in rules:
                recommended_diseases = [d.lower() for d in rules["recommended_for"]]
                if disease in recommended_diseases:
                    eat.append({
                        "name": food,
                        "reason": rules.get("reason", "Recommended for this condition")
                    })
            
            # Check if avoid
            if "avoid_for" in rules:
                avoid_diseases = [d.lower() for d in rules["avoid_for"]]
                if disease in avoid_diseases:
                    avoid.append({
                        "name": food,
                        "reason": rules.get("avoid_reason", "May trigger symptoms")
                    })
        
        return {
            "eat": eat,
            "avoid": avoid
        }
    
    # ---------------------------------
    # COMPLETE RECOMMENDATIONS
    # ---------------------------------
    
    def get_complete_recommendations(self, 
                                    disease: str, 
                                    symptoms: List[str]) -> Dict:
        """
        Get complete recommendations including products and food
        """
        disease = disease.lower()
        
        # Step 1: Assess risk
        risk_assessment = self.assess_risk(disease, symptoms)
        
        # Step 2: Get product recommendations
        product_recommendations = self.recommend_products(disease, symptoms)
        
        # Step 3: Get food recommendations
        food_recommendations = self.recommend_food(disease)
        
        # Prepare response
        response = {
            "disease": disease,
            "symptoms": symptoms,
            "risk_assessment": risk_assessment,
            "recommendations": {
                "products": product_recommendations,
                "food": food_recommendations
            }
        }
        
        # Add emergency message for high risk
        if risk_assessment["requires_doctor"]:
            response["emergency"] = {
                "message": "⚠️ URGENT: Please consult a dermatologist immediately.",
                "action": "Seek medical attention before using any products."
            }
        
        return response