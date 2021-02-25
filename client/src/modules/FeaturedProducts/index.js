import "./FeaturedProducts.css";

import { useEffect, useState } from "react";

import { getProductImage } from "../../utils/product";

function FeaturedProducts({ selectedProduct, fetchProduct }) {
  const [ featuredProducts, setFeaturedProducts ] = useState([]);

  const selectedProductTcin = selectedProduct?.item?.tcin;

  useEffect(() => {
    fetch("/products")
      .then(res => res.json())
      .then(featuredProducts => setFeaturedProducts(featuredProducts));
  }, []);

  return (
    <div className="flex overflow-auto space-around">
      {featuredProducts?.map(product => {
        const tcin = product?.item?.tcin;
        const isSelected = tcin === selectedProductTcin;
        return (
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
  );
}

export default FeaturedProducts;
