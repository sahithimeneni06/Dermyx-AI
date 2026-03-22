import { useState } from 'react';
import { analyzeImage } from '../api/diseaseAPI';

export const useImageUpload = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const uploadImage = async (file, mode) => {
    setLoading(true);
    setError('');
    
    try {
      const data = await analyzeImage(file, mode);
      setResult(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    setFile(null);
    setResult(null);
    setError('');
  };

  return {
    file,
    setFile,
    loading,
    error,
    result,
    uploadImage,
    clearImage
  };
};