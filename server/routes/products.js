const express = require('express');

const ProductCache = require('../utils/product-cache');
const dataAccess = require('../utils/data-access');
const { getPriceInfo, setPriceInfo } = dataAccess;
const getProduct = require('../utils/get-product');
const isPriceValid = require('../utils/is-price-valid');

const featuredProductIds = ['13860428', '54456119', '13264003', '12954218'];

const router = express.Router();

// Get and return product data for all featured products.
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

// Get and return product data for specified tcin.
router.get('/:tcin', async (req, res) => {
  try {
    const tcin = req.params.tcin;
    const result = await getProduct(tcin);
    res.send(result);
  } catch (e) {
    res.status(404).send(e.message);
  }
});

// Update price info for specified tcin.
router.put('/:tcin', async (req, res) => {
  const tcin = req.params.tcin;
  const { price, currency } = req.body;

  if (isPriceValid(price)) {
    let originalPriceInfo;
    try {
      // We pre-emptively get any existing price info so we can send the correct response
      // code and fallback to it if any input data is missing.
      // Ideally, we want to avoid this extra call and do partial updates (when data is missing)
      // and let the data source tell us the correct response code.
      // However, due to the limitations of the Redis store and time, this is not yet implemented.
      originalPriceInfo = JSON.parse(await getPriceInfo(tcin))
    } catch (e) {}
    await setPriceInfo(tcin, JSON.stringify({
      price: Number(price),
      // Fall back to existing data if currency input is missing.
      currency: currency || originalPriceInfo?.currency || '$'
    }));
    // Don't want to serve invalid price.
    ProductCache.delete(tcin);

    res.status(originalPriceInfo ? 200 : 201).send();
  } else {
    res.status(400).send('Price value is not valid. Accepts numbers up to 2 decimal places.');
  }
});

module.exports = router;
