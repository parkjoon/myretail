const ProductCache = require('./product-cache');
const dataAccess = require('./data-access');
const { getPriceInfo, getProductDetails } = dataAccess;

const getProduct = (tcin) => {
  // Check cache first
  const cachedValue = ProductCache.get(tcin);
  if (cachedValue) {
    // Return cached value if found
    return cachedValue;
  }

  // Trigger promises for product details (redsky)
  // and price info (redis)
  const getProductPriceInfo = getPriceInfo(tcin);
  return Promise.all([
    getProductDetails(tcin),
    getProductPriceInfo
  ]).then(([ productDetails, productPriceInfo ]) => {
    // Combine product details and price info into a single response.
    const data = {
      ...productDetails.data.product,
      priceInfo: JSON.parse(productPriceInfo)
    };
    // Update cache
    ProductCache.set(tcin, data);
    return data;
  });
};

module.exports = getProduct;
