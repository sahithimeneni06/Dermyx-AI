# 🧴 Dermyx AI — Skin Disease and Allergy Detection with Recommendation Engine

Dermyx AI is an **AI-powered full-stack web application** that analyzes skin conditions, detects diseases/allergies, evaluates skincare products, and provides personalized recommendations using **Machine Learning, Computer Vision, and NLP**.

---

## 🚀 Features

### 🔬 1. Skin Disease Detection

* Upload an image of skin
* Detects:

  * Acne
  * Eczema
  * Melanoma
  * Vitiligo

* Uses **EfficientNet-based Deep Learning model**

---

### ⚠️ 2. Allergy Detection

* Identifies:

  * Contact Dermatitis
  * Urticaria
  * Fungal Infections
  * Rashes
### ⚠️ 3. Normal Skin
---

### 🧴 4. Product Ingredient Analysis (OCR + NLP)

* Upload product image OR paste ingredients
* Extracts text using **EasyOCR**
* Classifies ingredients into:

  * ✅ Best
  * 👍 Good
  * ⚠️ Average
  * ❌ Harmful

---

### 🧠 5. AI Recommendation Engine

* Suggests:

  * Food to eat
  * Products
  * Food to avoid
    
* Based on:

  * Detected condition
  * Ingredient safety
  * User profile

---

### 🎨 6. Skin Tone Detection

* Detects skin tone using Computer Vision
* Helps in personalized product recommendations

### 🧠 7. Symptom Analysis

* Takes symptoms
* Detects Disease
* Generates Recommendation(Food, Products)

---

## 🛠️ Tech Stack

### 🔹 Backend

* Python
* Flask
* TensorFlow / Keras
* OpenCV
* EasyOCR
* Scikit-learn

### 🔹 Frontend

* React.js
* JavaScript
* HTML/CSS

### 🔹 AI/ML

* EfficientNet (Image Classification)
* NLP for ingredient parsing
* Custom rule-based recommendation system

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/sahithimeneni06/Dermyx-AI.git
cd Dermyx-AI
```

---

### 2️⃣ Backend Setup

```bash
cd backend
python -m venv venv
source venv/Scripts/activate  
pip install -r requirements.txt
```

---

### 3️⃣ Run Backend

```bash
python app.py
```

---

### 4️⃣ Frontend Setup

```bash
cd frontend
npm install
npm start
```

---

## 🧪 Example Workflow

1. Upload skin image
2. AI detects condition
3. Get:

   * Disease name
   * Confidence score
4. System recommends:

   * Products
   * Diet
   * Precautions

---

## ⚠️ Disclaimer

Dermyx AI is for **educational and informational purposes only**.
Always consult a certified dermatologist for medical advice.

---
