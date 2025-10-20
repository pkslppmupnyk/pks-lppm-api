/**
 * Text Formatter Module (ES6)
 * Module untuk formatting text dengan berbagai style
 */

/**
 * Fungsi 1: Mengubah semua huruf menjadi KAPITAL
 * @param {string} text - Text input yang akan diformat
 * @returns {string} Text dengan semua huruf kapital
 */
export function toAllCapital(text) {
  if (typeof text !== "string") {
    throw new TypeError("Input harus berupa string");
  }
  return text.toUpperCase();
}

/**
 * Fungsi 2: Mengubah huruf pertama setiap kata menjadi kapital
 * @param {string} text - Text input yang akan diformat
 * @returns {string} Text dengan huruf pertama setiap kata kapital
 */
export function toCapitalizeFirst(text) {
  if (typeof text !== "string") {
    throw new TypeError("Input harus berupa string");
  }

  return text
    .toLowerCase()
    .split(" ")
    .map((word) => {
      if (word.length === 0) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

// Export default untuk kemudahan import
export default {
  toAllCapital,
  toCapitalizeFirst,
};
