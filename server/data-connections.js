const redis = require('redis');
var util = require('util');

const bootstrapData = require('./bootstrap-data.json')

const priceInfoDBClient = redis.createClient(process.env.REDIS_URL || 'redis-animate-20506');
priceInfoDBClient.on('error', (e) => {
  console.error('Error connecting to Redis Store:', e);
});
// Bootstrap some sample data
bootstrapData.map(d => {
  priceInfoDBClient.set(d);
});

const getPriceInfo = util.promisify(priceInfoDBClient.get).bind(priceInfoDBClient);
const setPriceInfo = util.promisify(priceInfoDBClient.set).bind(priceInfoDBClient);

const productAPI = {
  baseUrl: 'https://redsky.target.com/v3/pdp/tcin',
  queryParams: 'excludes=taxonomy,price,promotion,%20bulk_ship,rating_and_review_reviews,rating_and_review_statistics,question_answer_st%20atistics&key=candidate'
};

module.exports = {
  getPriceInfo,
  setPriceInfo,
  productAPI
};
