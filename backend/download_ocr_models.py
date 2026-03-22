import easyocr
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def download_ocr_models():
    logger.info("📥 Downloading EasyOCR models...")
    logger.info("This may take a few minutes but only happens once.")
    
    try:
        reader = easyocr.Reader(['en'], gpu=False)
        logger.info("✅ EasyOCR models downloaded successfully!")
        return True
    except Exception as e:
        logger.error(f"❌ Failed to download EasyOCR models: {e}")
        return False

if __name__ == "__main__":
    download_ocr_models()