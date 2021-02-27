import "./App.css";

import { useEffect, useState } from "react";

import FeaturedProducts from "./modules/FeaturedProducts";
import ProductDetailedView from "./modules/ProductDetailedView";
import ProductSearch from "./modules/ProductSearch";

const initialProductId = "13860428";

function App() {
  const [ product, setProduct ] = useState();
  const [ errorText, setErrorText ] = useState();

  const fetchProduct = (tcin) => {
    setErrorText();
    fetch(`/products/${tcin}`)
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          return res.text().then(msg => {
            throw new Error(msg);
          });
        }
      })
      .then(p => setProduct(p))
      .catch(e => {
        setErrorText(e.message || "An unknown error occurred");
      });
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
        <div className="red">{errorText}</div>
        <ProductDetailedView product={product} fetchProduct={fetchProduct} />
        <FeaturedProducts selectedProduct={product} fetchProduct={fetchProduct} />
      </div>

      <footer className="globalFooter flex flex-column text-center">
        <p>
          Joon Park
          <a className="ml20" href="mailto:joonmopark94@gmail.com">joonmopark94@gmail.com</a>
        </p>
        <p className="mt0">
          <a href="https://www.linkedin.com/in/joon-park" target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <a className="ml20" href="https://github.com/parkjoon/myretail" target="_blank" rel="noreferrer">
            GitHub Repo
          </a>
        </p>
      </footer>
    </>
  );
}

export default App;
