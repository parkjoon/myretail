import "./ProductSearch.css";

import { useState } from "react";

function ProductSearch({ fetchProduct }) {
  const [ searchValue, setSearchValue ] = useState("");

  return (
      <>
        <input
          type="text"
          maxLength={8}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
        <button className="mb20" onClick={() => fetchProduct(searchValue)}>
          Search Product
        </button>
      </>
  );
}

export default ProductSearch;
