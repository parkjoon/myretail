const isPriceValid = (price) => Boolean(
  // Should match any amount of digits followed by an option period,
  // which can also optionally followed by up to 2 digits.
  String(price).match(/^\d*(\.\d{1,2})?$/g)
);

module.exports = isPriceValid;
