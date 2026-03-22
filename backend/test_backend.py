from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins="*")  # Allow all origins for testing

@app.route('/health')
def health():
    return jsonify({"status": "ok", "message": "Test server is running"})

@app.route('/analyze-product', methods=['POST'])
def analyze_product():
    return jsonify({
        "overall_rating": "Test",
        "overall_confidence": 85,
        "ingredients": [
            {"input": "Water", "rating": "Best", "confidence": 0.95},
            {"input": "Glycerin", "rating": "Best", "confidence": 0.92},
            {"input": "Alcohol", "rating": "Bad", "confidence": 0.88}
        ],
        "warnings": ["Alcohol may irritate sensitive skin"],
        "total_ingredients": 3,
        "safe_count": 2,
        "caution_count": 1,
        "unknown_count": 0
    })

if __name__ == '__main__':
    print("🚀 Test server starting on port 5000...")
    app.run(debug=True, port=5000, host='0.0.0.0')