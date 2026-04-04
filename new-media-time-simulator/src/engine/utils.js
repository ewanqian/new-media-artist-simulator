export const clamp = (value, min = 0, max = 99) => Math.max(min, Math.min(max, value));

export const sumWeights = (answers) => {
  const acc = {};
  answers.forEach((answer) => {
    Object.entries(answer.weights || {}).forEach(([key, value]) => {
      acc[key] = (acc[key] || 0) + value;
    });
  });
  return acc;
};

export const randomPick = (array) => {
  if (!array?.length) return null;
  return array[Math.floor(Math.random() * array.length)];
};

export const formatInventory = (inventory = {}) =>
  Object.entries(inventory)
    .filter(([, count]) => count > 0)
    .map(([key, count]) => `${key} × ${count}`);
