var express = require('express');
var axios = require('axios');

var productAPI = require('../connection-info').product;
var LRUCache = require('../lru-cache');

const ProductCache = new LRUCache(3);

const featuredProductIds = ['13860428', '54456119', '13264003', '12954218'];

const database = {
  13860428: {
    price: 13.86,
    currency: '$'
  },
  54456119: {
    price: 54.45,
    currency: '$'
  },
  13264003: {
    price: 13.26,
    currency: '$'
  },
  12954218: {
    price: 12.95,
    currency: '$'
  }
};

const getProduct = (tcin) => {
  // Check cache first
  const cachedValue = ProductCache.get(tcin);
  if (cachedValue) {
    return cachedValue;
  }

  const getProductDetails = axios.get(`${productAPI.baseUrl}/${tcin}?${productAPI.queryParams}`);
  const getProductPriceInfo = Promise.resolve(database[tcin]);
  return Promise.all([
    getProductDetails,
    getProductPriceInfo
  ]).then(([ productDetails, productPriceInfo ]) => {
    const data = {
      ...productDetails.data.product,
      priceInfo: productPriceInfo
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
  });
  res.send(products);
});

router.get('/:tcin', async (req, res) => {
  const tcin = req.params.tcin;
  res.send(await getProduct(tcin));
});

router.put('/:tcin', async (req, res) => {
  const tcin = req.params.tcin;
  const { price } = req.body;
  if (database[tcin]) {
    database[tcin].price = price;
    res.status(200).send();
  } else {
    database[tcin] = {
      price,
      currency: '$'
    }
    res.status(201).send();
  }
});

module.exports = router;
