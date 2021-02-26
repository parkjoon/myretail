const isPriceValid = (price) => Boolean(
  String(price).match(/^\d*(\.\d{1,2})?$/g)
);

module.exports = isPriceValid;
