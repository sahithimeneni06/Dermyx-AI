// hooks/useSkinPredict.js
import { useState, useCallback } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export function useSkinPredict() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);   // { prediction, recommendations }
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null); // base64 for display

  const predict = useCallback(async (imageFile, symptoms = []) => {
    setLoading(true);
    setError(null);
    setResult(null);

    // Generate preview URL
    setPreview(URL.createObjectURL(imageFile));

    const formData = new FormData();
    formData.append("image", imageFile);
    if (symptoms.length > 0) {
      formData.append("symptoms", symptoms.join(","));
    }

    try {
      const res = await fetch(`${API_URL}/api/predict`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Prediction failed");
      }

      setResult({
        prediction: data.prediction,
        recommendations: data.recommendations,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setPreview(null);
  }, []);

  return { predict, loading, result, error, preview, reset };
}