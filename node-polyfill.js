// Polyfill for Node.js < 22.1.0 where URL.parse static method is not yet implemented
if (typeof URL !== 'undefined' && !URL.parse) {
  URL.parse = function (input, base) {
    try {
      return new URL(input, base);
    } catch {
      return null;
    }
  };
}
