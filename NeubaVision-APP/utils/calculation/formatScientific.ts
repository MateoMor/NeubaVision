export const formatScientific = (num: number) => {
  if (num === 0) return "0";
  if (num > 10000 || num < 0.001) {
    return num.toExponential(2);
  }
  return Math.round(num).toLocaleString();
};