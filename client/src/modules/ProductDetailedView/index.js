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

  // Locally track price input value
  const [ priceValue, setPriceValue ] = useState(priceInfo?.price);
  const [ errorText, setErrorText ] = useState();

  const handleUpdatePrice = (e) => {
    e.preventDefault();
    setErrorText();

    const options = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json; charset=UTF-8"
      },
      body: JSON.stringify({ price: priceValue })
    };
    fetch(`/products/${tcin}`, options)
      .then(res => {
        if (res.ok) {
          // If price update was successful, fetch the new product data.
          // This is not required as, we can locally modify the existing data with
          // the new data. However, this is an optimization that is not yet implemented.
          fetchProduct(tcin);
        } else {
          return res.text().then(msg => {
            throw new Error(msg);
          });
        }
      })
      .catch(e => {
        setErrorText(e.message || "An unknown error occurred");
      });
  };

  useEffect(() => {
    setPriceValue(priceInfo?.price);
  }, [ product, priceInfo?.price ]);

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
        <form onSubmit={handleUpdatePrice}>
          <input
            className="mt20"
            type="number"
            step="any"
            value={priceValue}
            onChange={(e) => setPriceValue(Number(e.target.value))}
          />
          <input className="mb20" type="submit" value="Update Price" />
        </form>
        <span className="ml20 red">{errorText}</span>
      </div>
    </div>
  );
}

export default ProductDetailedView;
