import "./ProductDetailedView.css";

import { useEffect, useState } from "react";

import { getProductImage } from "../../utils/product"

function ProductDetailedView({ product = {}, fetchProduct }) {
  const {
    priceInfo,
    item: {
      product_description,
      tcin
    } = {}
  } = product;

  const [ priceValue, setPriceValue ] = useState(priceInfo?.price);
  const [ errorText, setErrorText ] = useState("");

  const handleUpdatePrice = () => {
    setErrorText("");

    const options = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json; charset=UTF-8"
      },
      body: JSON.stringify({ price: priceValue })
    };
    fetch(`/products/${tcin}`, options)
      .then(() => {
        fetchProduct(tcin);
      })
      .catch(e => {
        console.error(e);
        setErrorText(JSON.stringify(e));
      });
  };

  useEffect(() => {
    setPriceValue(priceInfo?.price);
  }, [ product ]);

  return (
    <div className="product-detailed-view flex flex-column">
      <div className="p20 mc">
        <img alt="" src={getProductImage(product)} height="250px" />
        <h2 className="f1" dangerouslySetInnerHTML={{ __html: product_description?.title }}/>
        <p>{priceInfo?.currency}{priceInfo?.price || "See price in cart"}</p>
      </div>
      <div className="p20">
        <p className="m0" dangerouslySetInnerHTML={{ __html: product_description?.downstream_description }} />
        <div className="mt20">
          {product_description?.bullet_description?.map(
            (b, i) => <div key={i} dangerouslySetInnerHTML={{ __html: b }} />)
          }
        </div>
        <input
          className="mt20"
          type="number"
          value={priceValue}
          onChange={(e) => setPriceValue(Number(e.target.value))}
        />
        <button className="mb20" onClick={handleUpdatePrice}>Update Price</button>
        <span className="ml20 red">{errorText}</span>
      </div>
    </div>
  );
}

export default ProductDetailedView;
