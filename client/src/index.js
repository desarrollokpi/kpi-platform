import axios from "axios";
import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";

axios.defaults.baseURL = process.env.REACT_APP_API_BASE_URL;
axios.defaults.withCredentials = true;
axios.defaults.headers.common = {
  "Content-Type": "application/json",
};

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
