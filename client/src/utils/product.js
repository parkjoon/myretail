export const placeholderProductImage = "/placeholder-product-image.png";

export const getProductImage = (product) => {
  const image = product?.item?.enrichment?.images?.[0];
  return `${image?.base_url}${image?.primary}` || placeholderProductImage;
};
