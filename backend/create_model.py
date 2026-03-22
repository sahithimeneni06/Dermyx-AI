# create_model.py - Create a fresh model with same architecture
import tensorflow as tf
import numpy as np
import os

print("="*60)
print("🔄 Creating Fresh Skin Disease Model")
print("="*60)

# Create model with same architecture
print("\n🏗️ Building model architecture...")

base_model = tf.keras.applications.EfficientNetB0(
    include_top=False,
    weights='imagenet',
    input_shape=(224, 224, 3)
)
base_model.trainable = False

model = tf.keras.Sequential([
    base_model,
    tf.keras.layers.GlobalAveragePooling2D(),
    tf.keras.layers.Dense(128, activation='relu'),
    tf.keras.layers.Dropout(0.3),
    tf.keras.layers.Dense(3, activation='softmax')
])

model.compile(
    optimizer='adam',
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

print("✅ Model architecture created!")

# Save the fresh model
output_path = os.path.join(os.path.dirname(__file__), "models", "skin_3class_model_new.h5")
os.makedirs(os.path.dirname(output_path), exist_ok=True)

model.save(output_path)
print(f"✅ Fresh model saved to: {output_path}")

# Verify it loads
print("\n🔍 Verifying fresh model...")
test_model = tf.keras.models.load_model(output_path, compile=False)
dummy = np.random.rand(1, 224, 224, 3).astype(np.float32)
output = test_model.predict(dummy, verbose=0)
print(f"✅ Fresh model works! Output shape: {output.shape}")

print("\n" + "="*60)
print("📝 NOTE: This is a fresh model with random weights.")
print("   To use it, you'll need to train it with your dataset.")
print("   Or you can continue using simulation mode for testing.")
print("="*60)