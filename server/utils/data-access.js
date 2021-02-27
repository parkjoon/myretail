const redis = require('redis');
var util = require('util');
var axios = require('axios');

const bootstrapData = require('./bootstrap-data.json');
const mockProducts = require('../tests/fixtures/featured-products.json');

// TODO - Need a cleaner way to mock data sources.
const isTestEnv = process.env.NODE_ENV === 'test';
const testRedisStore = {};

// If the environment is test, we replace the Redis client handlers
// with mocked Promises.
const priceInfoDBClient = isTestEnv ? {
  get: (key) => new Promise(resolve => {
    setTimeout(() => {
      resolve(testRedisStore[key]);
    }, 50);
  }),
  set: (key, value) => new Promise(resolve => {
    setTimeout(() => {
      testRedisStore[key] = value;
      resolve('OK');
    }, 50);
  }),
  on: () => {}
} : redis.createClient(process.env.REDIS_URL);
priceInfoDBClient.on('error', (e) => {
  console.error('Error connecting to Redis Store:', e);
});
// Bootstrap some sample data into the price info Redis store.
bootstrapData.forEach(d => {
  priceInfoDBClient.set(...d);
});

const getPriceInfo = isTestEnv
  ? priceInfoDBClient.get
  : util.promisify(priceInfoDBClient.get).bind(priceInfoDBClient);
const setPriceInfo = isTestEnv
  ? priceInfoDBClient.set
  : util.promisify(priceInfoDBClient.set).bind(priceInfoDBClient);

const productAPI = {
  baseUrl: 'https://redsky.target.com/v3/pdp/tcin',
  queryParams: 'excludes=taxonomy,price,promotion,%20bulk_ship,rating_and_review_reviews,rating_and_review_statistics,question_answer_st%20atistics&key=candidate'
};

const getProductDetails = (tcin) => {
  // If this is test environment, serve data from the mock products JSON file.
  if (isTestEnv) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const productDetails = mockProducts.find(p => p?.product?.item?.tcin === tcin);
        productDetails ? resolve({ data: productDetails }) : reject(new Error('Product not found'));
      }, 100);
    });
  }
  return axios.get(`${productAPI.baseUrl}/${tcin}?${productAPI.queryParams}`);
};

module.exports = {
  getPriceInfo,
  setPriceInfo,
  getProductDetails
};
