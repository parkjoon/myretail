const featuredProducts = require('../fixtures/featured-products.json');

describe('ProductCache', () => {
  beforeEach(() => {
    // Reset cache instance for every test case.
    jest.resetModules();
  });

  it('sets max size of cache with constructor', () => {
    const ProductCache = require('../../utils/product-cache');
    expect(ProductCache.maxSize).toBe(3);
  });

  it('sets and gets value in cache with key and value', () => {
    const ProductCache = require('../../utils/product-cache');
    ProductCache.set("myKey", "myValue");
    expect(ProductCache.get("myKey")).toBe("myValue");
  });

  it('deletes key and value from cache with key', () => {
    const ProductCache = require('../../utils/product-cache');
    ProductCache.set("myKey", "myValue");
    expect(ProductCache.get("myKey")).toBe("myValue");
    ProductCache.delete("myKey");
    expect(ProductCache.get("myKey")).toBeUndefined();
  });

  it('setting and getting an existing key moves its order to the most recently used position', () => {
    const ProductCache = require('../../utils/product-cache');
    ProductCache.set("myKey1", "myValue");
    ProductCache.set("myKey2", "myValue");
    ProductCache.set("myKey3", "myValue");
    // At this point, "myKey3" is the most recently used.
    let iterator = ProductCache.cache.keys();
    expect(iterator.next().value).toBe("myKey1");
    expect(iterator.next().value).toBe("myKey2");
    expect(iterator.next().value).toBe("myKey3");

    // Setting myKey1 should make it most recently used.
    ProductCache.set("myKey1", "myValue");
    iterator = ProductCache.cache.keys();
    expect(iterator.next().value).toBe("myKey2");
    expect(iterator.next().value).toBe("myKey3");
    expect(iterator.next().value).toBe("myKey1");

    // Getting myKey2 should make it most recently used.
    ProductCache.set("myKey2");
    iterator = ProductCache.cache.keys();
    expect(iterator.next().value).toBe("myKey3");
    expect(iterator.next().value).toBe("myKey1");
    expect(iterator.next().value).toBe("myKey2");
  });

  it('sets a new key and value when capacity is full evicts the least recently used key and value', () => {
    const ProductCache = require('../../utils/product-cache');
    ProductCache.set("myKey1", "myValue");
    ProductCache.set("myKey2", "myValue");
    ProductCache.set("myKey3", "myValue");

    // Setting a 4th key should evict myKey1 and place the new key as most recently used.
    ProductCache.set("myKey4", "myValue");
    let iterator = ProductCache.cache.keys();
    expect(iterator.next().value).toBe("myKey2");
    expect(iterator.next().value).toBe("myKey3");
    expect(iterator.next().value).toBe("myKey4");
  });
});
