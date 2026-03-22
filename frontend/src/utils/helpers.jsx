export const riskClass = (level) => {
  if (!level) return 'badge-low';
  const l = level.toUpperCase();
  if (l === 'LOW') return 'badge-low';
  if (l === 'MODERATE') return 'badge-mid';
  if (l === 'MODERATE-HIGH') return 'badge-midh';
  if (l === 'HIGH') return 'badge-high';
  return 'badge-mid';
};

export const formatDiseaseName = (name) => {
  if (!name) return '';
  return name.replace(/_/g, ' ');
};

export const calculateConfidence = (confidence) => {
  return Math.round((confidence || 0) * 100);
};