import React from "react";
import "./Loader.css";

const Loader = ({ className = "" }) => {
  return <span className={`loader ${className}`.trim()} />;
};

export default Loader;
