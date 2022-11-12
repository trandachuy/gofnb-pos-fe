export const capitalize = str => {
  const strLowerCase = str.toLowerCase();
  return strLowerCase.charAt(0).toUpperCase() + strLowerCase.slice(1);
};
