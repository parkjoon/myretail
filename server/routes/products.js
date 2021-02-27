const express = require('express');

const ProductCache = require('../utils/product-cache');
const dataAccess = require('../utils/data-access');
const { getPriceInfo, setPriceInfo } = dataAccess;
const getProduct = require('../utils/get-product');
const isPriceValid = require('../utils/is-price-valid');

const featuredProductIds = ['13860428', '54456119', '13264003', '12954218'];

const router = express.Router();

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
    let originalPriceInfo;
    try {
      originalPriceInfo = JSON.parse(await getPriceInfo(tcin))
    } catch (e) {}
    await setPriceInfo(tcin, JSON.stringify({
      price: Number(price),
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
