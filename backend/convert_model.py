# convert_model.py
import os
import tensorflow as tf

print("=" * 50)
print("Model Conversion Utility")
print("=" * 50)

# Path to your model
model_path = "models/skin_model_9class.keras"
h5_path = "models/skin_model_9class.h5"

if os.path.exists(model_path):
    print(f"✅ Found model: {model_path}")
    
    try:
        print("Loading model...")
        model = tf.keras.models.load_model(model_path, compile=False)
        print("✅ Model loaded successfully")
        
        print(f"Saving as H5 format: {h5_path}")
        model.save(h5_path, save_format='h5')
        print("✅ Model saved as H5")
        
        # Also save weights separately
        weights_path = "models/skin_model_9class_weights.h5"
        model.save_weights(weights_path)
        print(f"✅ Weights saved to: {weights_path}")
        
        # Test the saved model
        print("\nTesting the saved H5 model...")
        test_model = tf.keras.models.load_model(h5_path, compile=False)
        print("✅ H5 model loads successfully")
        
    except Exception as e:
        print(f"❌ Error: {e}")
else:
    print(f"❌ Model not found at: {model_path}")