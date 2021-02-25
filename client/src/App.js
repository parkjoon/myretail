import "./App.css";

import { useEffect, useState } from "react";

import FeaturedProducts from "./modules/FeaturedProducts";
import ProductDetailedView from "./modules/ProductDetailedView";
import ProductSearch from "./modules/ProductSearch";

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

      <div className="content p20 mc">
        <ProductSearch fetchProduct={fetchProduct} />
        <ProductDetailedView product={product} fetchProduct={fetchProduct} />
        <FeaturedProducts selectedProduct={product} fetchProduct={fetchProduct} />
      </div>

      <footer className="globalFooter flex flex-column text-center">
        <p>
          Joon Park
          <a className="ml20" href="mailto:joonmopark94@gmail.com">joonmopark94@gmail.com</a>
        </p>
        <p className="mt0">
          <a href="https://www.linkedin.com/in/joon-park" target="_blank">
            LinkedIn
          </a>
          <a className="ml20" href="https://github.com/parkjoon/myretail" target="_blank">
            GitHub Repo
          </a>
        </p>
      </footer>
    </>
  );
}

export default App;
