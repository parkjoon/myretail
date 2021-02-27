const getProduct = require('../../utils/get-product');
const ProductCache = require('../../utils/product-cache');

const featuredProducts = require('../fixtures/featured-products.json');

describe('getProduct(tcin) helper', () => {
  it('returns product details and price info', async () => {
    expect(await getProduct("13860428")).toEqual(featuredProducts[0].product);
  });

  it('returns cached value if found', async () => {
    ProductCache.set("13860428", "cached value");
    expect(await getProduct("13860428")).toBe("cached value");
  });

  it('returns price info when product details call fails', async () => {
    ProductCache.delete("13860428");
    expect(await getProduct("13860428", undefined, () => {})).toEqual({
      priceInfo: {
        "currency": "$",
        "price": 13.86
      }
    });
  });

  it('returns product details when product price info call fails', async () => {
    const {
      priceInfo,
      ...expected
    } = featuredProducts[0].product;
    ProductCache.delete("13860428");
    expect(await getProduct("13860428", () => {})).toEqual(expected);
  });

  it('returns no data when both product details and price info calls fail', async () => {
    ProductCache.delete("13860428");
    expect(await getProduct("13860428", () => {}, () => {})).toEqual({});
  });

  it('sets product cache when data resolves successfully', async () => {
    ProductCache.delete("13860428");
    expect(ProductCache.get("13860428")).toBeUndefined();
    await getProduct("13860428");
    expect(ProductCache.get("13860428")).toEqual(featuredProducts[0].product);
  });
});
