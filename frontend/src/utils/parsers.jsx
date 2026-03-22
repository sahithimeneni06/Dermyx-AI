export const parseCSV = (str) => {
  return str.split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
};

export const parseIngredients = (ingredients) => {
  if (Array.isArray(ingredients)) return ingredients;
  if (typeof ingredients === 'string') return parseCSV(ingredients);
  return [];
};