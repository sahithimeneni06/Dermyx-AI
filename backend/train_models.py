import os
import tensorflow as tf
import numpy as np

# ==============================
# CONFIG
# ==============================
IMG_SIZE = (224, 224)
BATCH_SIZE = 16
EPOCHS = 25

# 🔥 SAVE DIRECTLY TO BACKEND
SAVE_PATH = os.path.join("backend", "models", "skin_model_9class_final.keras")

# ==============================
# LOAD DATA
# ==============================
train_ds = tf.keras.utils.image_dataset_from_directory(
    "skin_9class_dataset/train",
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE
)

val_ds = tf.keras.utils.image_dataset_from_directory(
    "skin_9class_dataset/test",
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE
)

class_names = train_ds.class_names
print("Classes:", class_names)

# ==============================
# AUGMENTATION 🔥
# ==============================
data_aug = tf.keras.Sequential([
    tf.keras.layers.RandomFlip("horizontal"),
    tf.keras.layers.RandomRotation(0.1),
    tf.keras.layers.RandomZoom(0.1)
])

train_ds = train_ds.map(lambda x, y: (data_aug(x), y))

# ==============================
# PREPROCESS
# ==============================
from tensorflow.keras.applications.efficientnet import preprocess_input

train_ds = train_ds.map(lambda x, y: (preprocess_input(x), y))
val_ds = val_ds.map(lambda x, y: (preprocess_input(x), y))

AUTOTUNE = tf.data.AUTOTUNE
train_ds = train_ds.prefetch(AUTOTUNE)
val_ds = val_ds.prefetch(AUTOTUNE)

# ==============================
# MODEL (FINE-TUNE 🔥)
# ==============================
base_model = tf.keras.applications.EfficientNetB0(
    include_top=False,
    weights='imagenet',
    input_shape=(224, 224, 3)
)

# 🔥 UNFREEZE TOP LAYERS
base_model.trainable = True
for layer in base_model.layers[:-20]:
    layer.trainable = False

model = tf.keras.Sequential([
    base_model,
    tf.keras.layers.GlobalAveragePooling2D(),
    tf.keras.layers.BatchNormalization(),
    tf.keras.layers.Dense(256, activation='relu'),
    tf.keras.layers.Dropout(0.5),
    tf.keras.layers.Dense(len(class_names), activation='softmax')
])

model.compile(
    optimizer=tf.keras.optimizers.Adam(1e-5),
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

# ==============================
# CALLBACKS
# ==============================
early_stop = tf.keras.callbacks.EarlyStopping(
    patience=5,
    restore_best_weights=True
)

# ==============================
# TRAIN
# ==============================
print("🚀 Training...")
model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=EPOCHS,
    callbacks=[early_stop]
)

# ==============================
# SAVE MODEL DIRECTLY
# ==============================
os.makedirs("backend/models", exist_ok=True)

model.save(SAVE_PATH)

print(f"✅ Model saved at: {SAVE_PATH}")