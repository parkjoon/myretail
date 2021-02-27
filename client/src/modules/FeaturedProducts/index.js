import "./FeaturedProducts.css";

import { useEffect, useState } from "react";

import { getProductImage } from "../../utils/product";

function FeaturedProducts({ selectedProduct, fetchProduct }) {
  const [ featuredProducts, setFeaturedProducts ] = useState([]);

  const selectedProductTcin = selectedProduct?.item?.tcin;

  useEffect(() => {
    // Fetch featured products once on component mount.
    fetch("/products")
      .then(res => res.json())
      .then(featuredProducts => setFeaturedProducts(featuredProducts));
  }, []);

  return (
    <>
      <h2>Featured Products</h2>
      <div className="flex overflow-auto space-between">
        {featuredProducts?.map(product => {
          const tcin = product?.item?.tcin;
          const isSelected = tcin === selectedProductTcin;
          return (
              // Clicking on a featured product should trigger a call to fetch the data and display it.
              <button className="cursor-pointer" onClick={() => fetchProduct(tcin)}>
                <img
                  key={tcin}
                  className={isSelected ? "selectedProduct" : null}
                  alt=""
                  src={getProductImage(product)} height="150px"
                />
              </button>
          );
        })}
      </div>
    </>
  );
}

export default FeaturedProducts;
