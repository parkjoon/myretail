const ProductCache = require('../../utils/product-cache');
const request = require('supertest');
const app = require('../../app');

const featuredProducts = require('../fixtures/featured-products.json');

describe('/products/* routes', () => {
  beforeEach(() => {
    // Reset module instances for every test case.
    jest.resetModules();
  });

  describe("GET /products/", () => {
    it('returns product data for all products', async () => {
      const res = await request(app).get('/products');
      expect(res.status).toBe(200);
      expect(res.body).toEqual(featuredProducts.map(p => p.product));
    });
  });

  describe("GET /products/:tcin", () => {
    it('returns product data for specified tcin', async () => {
      const res = await request(app).get('/products/13860428');
      expect(res.status).toBe(200);
      expect(res.body).toEqual(featuredProducts[0].product);
    });

    it('returns an error when invalid tcin is specified', async () => {
      const res = await request(app).get('/products/asdf');
      expect(res.status).toBe(404);
      expect(res.text).toBe("Product not found");
    });
  });

  describe("PUT /products/:tcin", () => {
    it('updates price in store', async () => {
      const expected = { ...featuredProducts[0].product };
      expected.priceInfo = {
        price: 1234,
        currency: "myCurrency"
      };

      let res = await request(app).put('/products/13860428')
        .send({
          price: 1234,
          currency: "myCurrency"
        });
      expect(res.status).toBe(200);
      res = await request(app).get('/products/13860428');
      expect(res.status).toBe(200);
      expect(res.body).toEqual(expected);
    });

    it('removes cached product data from cache', async () => {
      ProductCache.set("13860428", "value");
      expect(ProductCache.get("13860428")).toBe("value");
      const res = await request(app).put('/products/13860428')
        .send({
          price: 1234,
          currency: "myCurrency"
        });
      expect(res.status).toBe(200);
      expect(ProductCache.get("13860428")).toBeUndefined();
    });

    it('uses fallback currency from existing price info data when currency input is missing', async () => {
      const expected = { ...featuredProducts[0].product };
      expected.priceInfo = {
        price: 1234,
        currency: "myCurrency"
      };

      await request(app).put('/products/13860428')
        .send({
          price: 1,
          currency: "myCurrency"
        });

      let res = await request(app).put('/products/13860428')
        .send({
          price: 1234
        });
      expect(res.status).toBe(200);
      res = await request(app).get('/products/13860428');
      expect(res.status).toBe(200);
      expect(res.body).toEqual(expected);
    });

    it('returns a status 201 when price info has been created for a new key', async () => {
      const res = await request(app).put('/products/1234')
        .send({
          price: 1234
        });
      expect(res.status).toBe(201);
    });

    it('returns a status 400 error when price is invalid', async () => {
      const res = await request(app).put('/products/13860428')
          .send({
            price: "asdf"
          });
      expect(res.status).toBe(400);
    });
  });
});
