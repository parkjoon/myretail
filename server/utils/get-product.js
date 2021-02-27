const ProductCache = require('./product-cache');
const dataAccess = require('./data-access');

// TODO - Remove getter params and find better way to mock & test edge cases.
const getProduct = (tcin, getPriceInfo = dataAccess.getPriceInfo, getProductDetails = dataAccess.getProductDetails) => {
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
    let parsedProductPriceInfo;
    try {
      parsedProductPriceInfo = JSON.parse(productPriceInfo);
    } catch (e) {
      // Handle parsing error
    }
    // Combine product details and price info into a single response.
    const data = {
      ...productDetails?.data?.product,
      priceInfo: parsedProductPriceInfo
    };
    // Update cache
    ProductCache.set(tcin, data);
    return data;
  });
};

module.exports = getProduct;
