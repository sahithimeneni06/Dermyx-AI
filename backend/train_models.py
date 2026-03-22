# train_model_local.py - Run this to train your model locally
import os
import shutil
import tensorflow as tf
import numpy as np
import matplotlib.pyplot as plt
from sklearn.metrics import classification_report
import kagglehub
import zipfile
import random

print("="*60)
print("🚀 Training Skin Disease Classifier")
print("="*60)

# Configuration
IMG_SIZE = (224, 224)
BATCH_SIZE = 16
EPOCHS = 15  # Increased for better accuracy
BASE_DIR = "skin_training_data"

# Create directories
print("\n📁 Creating directories...")
for split in ["train", "test"]:
    for cls in ["normal", "disease", "allergy"]:
        os.makedirs(os.path.join(BASE_DIR, split, cls), exist_ok=True)

# Download dataset
print("\n📥 Downloading DermNet dataset...")
path = kagglehub.dataset_download("shubhamgoel27/dermnet")
print(f"✅ Dataset at: {path}")

# Mapping
mapping = {
    "disease": [
        "Acne and Rosacea Photos",
        "Eczema Photos",
        "Melanoma Skin Cancer Nevi and Moles",
        "Light Diseases and Disorders of Pigmentation"
    ],
    "allergy": [
        "Urticaria Hives",
        "Poison Ivy Photos and other Contact Dermatitis",
        "Exanthems and Drug Eruptions"
    ]
}

# Copy disease and allergy images
print("\n📋 Copying disease and allergy images...")
for split in ["train", "test"]:
    for cls, folders in mapping.items():
        for folder in folders:
            src = os.path.join(path, split, folder)
            dst = os.path.join(BASE_DIR, split, cls)

            if not os.path.exists(src):
                continue

            copied = 0
            for img in os.listdir(src):
                if img.lower().endswith((".jpg", ".jpeg", ".png")):
                    try:
                        shutil.copy(os.path.join(src, img), os.path.join(dst, img))
                        copied += 1
                    except:
                        continue
            if copied > 0:
                print(f"  ✅ {split}/{cls}: {copied} images from {folder}")

# Add normal images
NORMAL_ZIP = "/content/Normal Skin Images.zip"  # Update path if needed
if os.path.exists(NORMAL_ZIP):
    print("\n🩺 Adding normal images...")
    with zipfile.ZipFile(NORMAL_ZIP, 'r') as zip_ref:
        zip_ref.extractall("normal_images")

    def copy_normal(split_ratio=0.8):
        all_imgs = []
        for root, _, files in os.walk("normal_images"):
            for f in files:
                if f.lower().endswith((".jpg", ".jpeg", ".png")):
                    all_imgs.append(os.path.join(root, f))

        random.shuffle(all_imgs)
        split_idx = int(len(all_imgs) * split_ratio)
        train_imgs = all_imgs[:split_idx]
        test_imgs = all_imgs[split_idx:]

        for img in train_imgs:
            shutil.copy(img, os.path.join(BASE_DIR, "train", "normal"))

        for img in test_imgs:
            shutil.copy(img, os.path.join(BASE_DIR, "test", "normal"))
        
        print(f"  ✅ Copied {len(train_imgs)} training normals, {len(test_imgs)} test normals")

    copy_normal()
else:
    print("\n⚠️ Normal images zip not found, using only DermNet data")

# Load datasets
print("\n📊 Loading datasets...")
train_ds = tf.keras.utils.image_dataset_from_directory(
    os.path.join(BASE_DIR, "train"),
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=True,
    seed=42
)

val_ds = tf.keras.utils.image_dataset_from_directory(
    os.path.join(BASE_DIR, "test"),
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=False
)

class_names = train_ds.class_names
print(f"✅ Classes: {class_names}")

# Apply preprocessing
from tensorflow.keras.applications.efficientnet import preprocess_input

def preprocess_train(image, label):
    image = tf.cast(image, tf.float32)
    # Augmentation for training
    image = tf.image.random_flip_left_right(image)
    image = tf.image.random_brightness(image, max_delta=0.1)
    image = preprocess_input(image)
    return image, label

def preprocess_val(image, label):
    image = tf.cast(image, tf.float32)
    image = preprocess_input(image)
    return image, label

train_ds = train_ds.map(preprocess_train, num_parallel_calls=tf.data.AUTOTUNE)
val_ds = val_ds.map(preprocess_val, num_parallel_calls=tf.data.AUTOTUNE)

train_ds = train_ds.cache().prefetch(tf.data.AUTOTUNE)
val_ds = val_ds.cache().prefetch(tf.data.AUTOTUNE)

# Build model
print("\n🏗️ Building model...")
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

model.summary()

# Train
print("\n🚀 Training...")
history = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=EPOCHS,
    verbose=1
)

# Evaluate
print("\n📊 Evaluation...")
y_true = []
y_pred = []

for x, y in val_ds:
    preds = model.predict(x, verbose=0)
    y_true.extend(y.numpy())
    y_pred.extend(np.argmax(preds, axis=1))

print("\n📋 Classification Report:")
print(classification_report(y_true, y_pred, target_names=class_names))

# Calculate final accuracy
accuracy = np.mean(np.array(y_true) == np.array(y_pred))
print(f"\n✅ Test Accuracy: {accuracy*100:.2f}%")

# Save model
print("\n💾 Saving model...")
os.makedirs("models", exist_ok=True)
model.save("models/skin_3class_model_trained.h5")
print("✅ Model saved to: models/skin_3class_model_trained.h5")

# Plot training history
fig, axes = plt.subplots(1, 2, figsize=(12, 4))

axes[0].plot(history.history['accuracy'], label='Train')
axes[0].plot(history.history['val_accuracy'], label='Validation')
axes[0].set_title('Model Accuracy')
axes[0].set_xlabel('Epoch')
axes[0].set_ylabel('Accuracy')
axes[0].legend()
axes[0].grid(True)

axes[1].plot(history.history['loss'], label='Train')
axes[1].plot(history.history['val_loss'], label='Validation')
axes[1].set_title('Model Loss')
axes[1].set_xlabel('Epoch')
axes[1].set_ylabel('Loss')
axes[1].legend()
axes[1].grid(True)

plt.tight_layout()
plt.savefig('training_history.png', dpi=100)
plt.show()

print("\n" + "="*60)
print("✅ Training complete!")
print(f"✅ Model saved at: models/skin_3class_model_trained.h5")
print(f"✅ Final Accuracy: {accuracy*100:.2f}%")
print("="*60)