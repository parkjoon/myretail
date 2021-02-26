import "./ProductSearch.css";

import { useState } from "react";

function ProductSearch({ fetchProduct }) {
  const [ searchValue, setSearchValue ] = useState("");

  const handleProductSearch = e => {
    e.preventDefault();
    fetchProduct(searchValue);
  };

  return (
    <form onSubmit={handleProductSearch}>
      <input
        type="text"
        maxLength={8}
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
      />
      <input className="mb20" type="submit" value="Search Product" />
    </form>
  );
}

export default ProductSearch;
