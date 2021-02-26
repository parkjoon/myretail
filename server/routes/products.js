var express = require('express');
var axios = require('axios');

var LRUCache = require('../lru-cache');
var dataConnections = require('../data-connections');
const { getPriceInfo, setPriceInfo, productAPI } = dataConnections;

const ProductCache = new LRUCache(3);

const featuredProductIds = ['13860428', '54456119', '13264003', '12954218'];

const getProduct = (tcin) => {
  // Check cache first
  const cachedValue = ProductCache.get(tcin);
  if (cachedValue) {
    return cachedValue;
  }

  const getProductDetails = axios.get(`${productAPI.baseUrl}/${tcin}?${productAPI.queryParams}`);
  const getProductPriceInfo = getPriceInfo(tcin);
  return Promise.all([
    getProductDetails,
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

router.get('/', async (req, res, next) => {
  let products = [];
  const promises = featuredProductIds.map(tcin => getProduct(tcin));
  await Promise.all(promises).then(responses => {
    products = responses;
  }).catch(e => {
    next(e);
  });
  res.send(products);
});

router.get('/:tcin', async (req, res, next) => {
  try {
    const tcin = req.params.tcin;
    const result = await getProduct(tcin);
    res.send(result);
  } catch (e) {
    next(e);
  }
});

router.put('/:tcin', async (req, res, next) => {
  try {
    const tcin = req.params.tcin;
    const { price, currency } = req.body;

    const originalPriceInfo = await getPriceInfo(tcin);
    await setPriceInfo(tcin, JSON.stringify({
      price,
      currency: currency || JSON.parse(originalPriceInfo)?.currency || '$'
    }));
    // Don't want to serve invalid price.
    ProductCache.delete(tcin);

    res.status(originalPriceInfo ? 200 : 201).send();
  } catch(e) {
    next(e);
  }
});

module.exports = router;
