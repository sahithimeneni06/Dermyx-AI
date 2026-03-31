# Dermyx AI 🚀  
**Skin Disease Detection System**

Dermyx AI is an AI-powered web application designed to assist users in detecting skin diseases, analyzing allergy risks, and receiving personalized skincare recommendations.

This system combines **Deep Learning, NLP, and Symptom Analysis** to provide a comprehensive and user-friendly skin health support solution.

---

## 📌 Abstract

Dermyx AI analyzes skin images and user-reported symptoms to detect common skin diseases and assess allergy risks. It uses **EfficientNetB0 (transfer learning)** for image classification, along with **symptom analysis and NLP-based ingredient evaluation** to improve prediction accuracy.

The system also provides:
- Personalized skincare product recommendations  
- Food suggestions  
- Dermatologist locator using GPS   

---

## 🎯 Objectives

- Detect skin diseases using AI-based image classification  
- Improve prediction reliability using symptom analysis  
- Identify harmful skincare ingredients using NLP  
- Provide personalized product and dietary recommendations  
- Help users locate nearby dermatologists  
- Build a user-friendly web application  

---

## 💡 Features

- 🔍 Skin Disease Detection (Image-based AI)
- 📊 Symptom Checker with Risk Assessment
- 🧴 Ingredient Analysis for skincare products
- 🥗 Food Recommendations
- 🎯 Skin Tone Analysis (Fitzpatrick scale)
- 📍 Dermatologist Locator (GPS-based)
- ⚠️ Alerts for high-risk conditions

---

## 🧠 System Modules

### 1. Disease Detection Module
- Uses **EfficientNetB0 CNN**
- Input: Skin image  
- Output: Predicted disease + confidence score  
- Supports:
  - Acne  
  - Eczema  
  - Fungal infections  
  - Vitiligo  
  - Melanoma  
  - Normal skin  

---

### 2. Symptom Checker
- Accepts user symptoms (itching, redness, swelling, etc.)
- Uses semantic matching / rule-based logic  
- Outputs:
  - Possible conditions  
  - Risk level (LOW / MODERATE / HIGH)

---

### 3. Ingredient Analysis (NLP)
- Analyzes skincare product ingredients  
- Detects:
  - Allergens  
  - Harmful chemicals  
- Provides safety rating and recommendations  

---

### 4. Recommendation Engine
- Suggests:
  - Safe skincare products  
  - Food recommendations  
- Based on:
  - Detected disease  
  - Ingredient safety  
  - User profile  

---

### 5. Skin Tone Analyzer
- Classifies skin tone using image processing  
- Uses **Fitzpatrick scale (Type I–VI)**  
- Provides personalized skincare tips  

---

### 6. Dermatologist Locator
- Uses GPS & Maps API  
- Finds nearby dermatologists  
- Displays location and directions  

---

## ⚙️ Technologies Used

- **Frontend:** React, HTML, CSS, JavaScript  
- **Backend:** Flask  
- **Programming:** Python  
- **Deep Learning:** TensorFlow, Keras  
- **Model:** EfficientNetB0  
- **Image Processing:** OpenCV  
- **Data Handling:** NumPy, Pandas  
- **NLP:** Ingredient analysis  
- **APIs:** Google Maps / Geolocation  
- **Version Control:** Git, GitHub  

---

## ⚙️ How It Works

1. User uploads image or enters symptoms  
2. Image is preprocessed (resize, normalize)  
3. AI model predicts skin disease  
4. Symptoms are analyzed to refine prediction  
5. Ingredient analysis checks product safety  
6. System provides:
   - Final diagnosis (prediction)
   - Risk level  
   - Product recommendations  
   - Food suggestions  
7. Nearby dermatologists are suggested if needed  

---

## ⚠️ Limitations

- Accuracy depends on image quality  
- Limited disease categories  
- Symptom analysis is rule-based  
- Ingredient database may not cover all cases  
- Requires internet for GPS features  
- Not a replacement for medical diagnosis  

---

## 🚀 Future Enhancements

- Mobile application  
- Chatbot support  
- Larger dataset for better accuracy  
- Real-time skin analysis  
- User history tracking  
- Multilingual support  
- Telemedicine integration  

---

## ⚠️ Disclaimer

This project is for **educational purposes only**.  
It does not replace professional medical advice.  
Always consult a dermatologist for accurate diagnosis.
