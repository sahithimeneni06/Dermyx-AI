# quick_train.py
import os
import tensorflow as tf
from tensorflow.keras.applications import EfficientNetB0
from tensorflow.keras import layers, models
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import numpy as np

print("Quick Training Script for 9-Class Model")
print("=" * 50)

# Define classes
CLASS_NAMES = [
    'acne', 'eczema', 'melanoma', 'vitiligo', 
    'urticaria', 'contact_dermatitis', 'rash', 
    'fungal', 'normal'
]

# Build model
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

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=1e-4),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

print("✅ Model built")

# Check if training data exists
train_dir = "skin_9class_dataset/train"
if os.path.exists(train_dir):
    print(f"✅ Training data found at {train_dir}")
    
    # Data generators
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=20,
        width_shift_range=0.2,
        height_shift_range=0.2,
        horizontal_flip=True,
        zoom_range=0.2,
        fill_mode='nearest'
    )
    
    train_generator = train_datagen.flow_from_directory(
        train_dir,
        target_size=(224, 224),
        batch_size=32,
        class_mode='categorical',
        classes=CLASS_NAMES
    )
    
    print(f"Found {train_generator.samples} images in {len(CLASS_NAMES)} classes")
    
    # Quick training (just a few epochs to get weights)
    print("\nTraining for 5 epochs...")
    history = model.fit(
        train_generator,
        epochs=5,
        steps_per_epoch=min(50, train_generator.samples // 32),
        verbose=1
    )
    
    print("✅ Training complete")
    
else:
    print(f"⚠️ Training data not found at {train_dir}")
    print("Creating model with random weights (for testing only)")

# Save model
model.save("models/skin_model_9class.h5", save_format='h5')
print("✅ Model saved to models/skin_model_9class.h5")