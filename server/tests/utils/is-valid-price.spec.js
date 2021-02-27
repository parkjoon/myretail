const isPriceValid = require('../../utils/is-price-valid');

describe('isValidPrice(price) helper', () => {
  it('returns true for any positive whole number', () => {
    expect(isPriceValid(0)).toBe(true);
    expect(isPriceValid(1)).toBe(true);
    expect(isPriceValid(9999999999999999)).toBe(true);
    // "Negative" 0 is not considered a negative number and instead just as 0.
    expect(isPriceValid(-0)).toBe(true);

    expect(isPriceValid(-1)).toBe(false);
    expect(isPriceValid(-9999999999999999)).toBe(false);

    expect(isPriceValid("abcd")).toBe(false);
    expect(isPriceValid("!@#$%^&*()_+-=")).toBe(false);
    expect(isPriceValid({})).toBe(false);
  });

  it('converts input to number', () => {
    expect(isPriceValid("123")).toBe(true);
    expect(isPriceValid("010")).toBe(true);
    expect(isPriceValid("0000000")).toBe(true);
  });

  it('returns true for up to 2 decimal places', () => {
    expect(isPriceValid(0.1)).toBe(true);
    expect(isPriceValid(0.01)).toBe(true);
    expect(isPriceValid("9999.9")).toBe(true);
    expect(isPriceValid("9999.99")).toBe(true);

    expect(isPriceValid(0.001)).toBe(false);
  });
});
