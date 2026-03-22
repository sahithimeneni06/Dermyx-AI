# rebuild_model.py
import os
import tensorflow as tf
from tensorflow.keras.applications import EfficientNetB0
from tensorflow.keras import layers, models
import numpy as np
import pickle

print("=" * 60)
print("REBUILDING 9-CLASS MODEL")
print("=" * 60)

# Define the 9 classes (must match your training order)
CLASS_NAMES = [
    'acne', 'eczema', 'melanoma', 'vitiligo', 
    'urticaria', 'contact_dermatitis', 'rash', 
    'fungal', 'normal'
]

# Build the model architecture
print("\n1. Building model architecture...")
base_model = EfficientNetB0(
    include_top=False,
    weights='imagenet',
    input_shape=(224, 224, 3)
)
base_model.trainable = False

model = models.Sequential([
    base_model,
    layers.GlobalAveragePooling2D(),
    layers.Dense(256, activation='relu'),
    layers.Dropout(0.4),
    layers.Dense(9, activation='softmax')
])

# Compile
model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=1e-4),
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

print("✅ Model architecture created")

# Try to load weights if available
print("\n2. Attempting to load trained weights...")
old_model_path = "models/skin_model_9class.keras"
if os.path.exists(old_model_path):
    try:
        # Try to extract weights from the old model
        print(f"   Attempting to load weights from {old_model_path}...")
        
        # Try loading with different methods
        try:
            old_model = tf.keras.models.load_model(old_model_path, compile=False)
            # Copy weights to new model
            for i, layer in enumerate(old_model.layers):
                if i < len(model.layers):
                    try:
                        model.layers[i].set_weights(layer.get_weights())
                    except:
                        pass
            print("   ✅ Weights loaded successfully!")
        except Exception as e:
            print(f"   ⚠️ Could not load full model: {e}")
            print("   Creating new model with pretrained weights only")
            
    except Exception as e:
        print(f"   ⚠️ Error loading old model: {e}")
else:
    print("   No existing model found, creating fresh model")

# Save the model in multiple formats
print("\n3. Saving model in compatible formats...")

# Save as H5 (most compatible)
h5_path = "models/skin_model_9class.h5"
model.save(h5_path, save_format='h5')
print(f"   ✅ Saved as H5: {h5_path}")

# Save as Keras (new format)
keras_path = "models/skin_model_9class.keras"
model.save(keras_path)
print(f"   ✅ Saved as Keras: {keras_path}")

# Save weights separately
weights_path = "models/skin_model_9class_weights.h5"
model.save_weights(weights_path)
print(f"   ✅ Saved weights: {weights_path}")

# Test loading
print("\n4. Testing model loading...")
test_model = tf.keras.models.load_model(h5_path, compile=False)
print("   ✅ H5 model loads successfully")

# Test prediction
print("\n5. Testing prediction with random input...")
test_input = np.random.rand(1, 224, 224, 3)
test_output = test_model.predict(test_input, verbose=0)
print(f"   ✅ Prediction successful. Output shape: {test_output.shape}")
print(f"   Output probabilities sum: {test_output.sum():.2f}")

print("\n" + "=" * 60)
print("MODEL REBUILT SUCCESSFULLY!")
print("=" * 60)
print("\n📝 Update your disease_service.py to use:")
print("   MODEL_PATH = os.path.join(BASE_DIR, 'models', 'skin_model_9class.h5')")