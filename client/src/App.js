import "./App.css";

import { useEffect, useState } from "react";

import FeaturedProducts from "./modules/FeaturedProducts";
import ProductDetailedView from "./modules/ProductDetailedView";
import ProductSearch from "./modules/ProductSearch";
import { getProductImage } from "./utils/product";

const initialProductId = "13860428";

function App() {
  const [ product, setProduct ] = useState();

  const fetchProduct = (tcin) => {
    fetch(`/products/${tcin}`)
      .then(res => res.json())
      .then(p => setProduct(p));
  };

  useEffect(() => {
    fetchProduct(initialProductId);
  }, []);

  return (
    <>
      <header className="globalHeader p20">
        <h1 className="m0">myRetail Product Data Interface</h1>
      </header>

      <div className="content p20">
        <ProductSearch fetchProduct={fetchProduct} />
        <ProductDetailedView product={product} fetchProduct={fetchProduct} />
        <FeaturedProducts selectedProduct={product} fetchProduct={fetchProduct} />
      </div>

      <footer className="globalFooter text-center">
        <p>Joon Park</p>
        <p><a href="mailto:joonmopark94@gmail.com">joonmopark94@gmail.com</a></p>
      </footer>
    </>
  );
}

export default App;
