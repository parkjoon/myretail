export const placeholderProductImage = "/placeholder-product-image.png";

export const getProductImage = (product) => {
  const { base_url, primary } = product?.item?.enrichment?.images?.[0] || {};
  return base_url && primary ? `${base_url}${primary}` : placeholderProductImage;
};
