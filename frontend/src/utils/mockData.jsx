// Mock disease detection response matching your 5-class model
export const mockDiseaseResult = {
  disease: "acne", // can be: acne, eczema, melanoma, vitiligo, normal
  confidence: 0.87,
  all_predictions: {
    acne: 0.87,
    eczema: 0.05,
    melanoma: 0.02,
    vitiligo: 0.03,
    normal: 0.03
  }
};

// Example with melanoma (high risk)
export const mockMelanomaResult = {
  disease: "melanoma",
  confidence: 0.92,
  all_predictions: {
    acne: 0.02,
    eczema: 0.02,
    melanoma: 0.92,
    vitiligo: 0.02,
    normal: 0.02
  }
};

// Example with normal skin
export const mockNormalResult = {
  disease: "normal",
  confidence: 0.95,
  all_predictions: {
    acne: 0.01,
    eczema: 0.01,
    melanoma: 0.01,
    vitiligo: 0.02,
    normal: 0.95
  }
};