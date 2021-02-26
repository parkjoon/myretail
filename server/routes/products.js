var express = require('express');

var LRUCache = require('../lru-cache');
var dataAccess = require('../data-access');
const { getPriceInfo, setPriceInfo, getProductDetails } = dataAccess;

const ProductCache = new LRUCache(3);

const featuredProductIds = ['13860428', '54456119', '13264003', '12954218'];

const isPriceValid = (price) => Boolean(
  String(price).match(/^\d*(\.\d{1,2})?$/g)
);

const getProduct = (tcin) => {
  // Check cache first
  const cachedValue = ProductCache.get(tcin);
  if (cachedValue) {
    return cachedValue;
  }

  const getProductPriceInfo = getPriceInfo(tcin);
  return Promise.all([
    getProductDetails(tcin),
    getProductPriceInfo
  ]).then(([ productDetails, productPriceInfo ]) => {
    const data = {
      ...productDetails.data.product,
      priceInfo: JSON.parse(productPriceInfo)
    };
    // Update cache
    ProductCache.set(tcin, data);
    return data;
  });
};

var router = express.Router();

router.get('/', async (req, res) => {
  let products = [];
  const promises = featuredProductIds.map(tcin => getProduct(tcin));
  await Promise.all(promises).then(responses => {
    products = responses;
  }).catch(e => {
    res.status(404).send(e.message);
  });
  res.send(products);
});

router.get('/:tcin', async (req, res) => {
  try {
    const tcin = req.params.tcin;
    const result = await getProduct(tcin);
    res.send(result);
  } catch (e) {
    res.status(404).send(e.message);
  }
});

router.put('/:tcin', async (req, res) => {
  const tcin = req.params.tcin;
  const { price, currency } = req.body;

  if (isPriceValid(price)) {
    const originalPriceInfo = await getPriceInfo(tcin);
    await setPriceInfo(tcin, JSON.stringify({
      price: Number(price),
      currency: currency || JSON.parse(originalPriceInfo)?.currency || '$'
    }));
    // Don't want to serve invalid price.
    ProductCache.delete(tcin);

    res.status(originalPriceInfo ? 200 : 201).send();
  } else {
    res.status(400).send('Price value is not valid. Accepts numbers up to 2 decimal places.');
  }
});

module.exports = router;
