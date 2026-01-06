import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Solo reportar métricas en producción
if (process.env.NODE_ENV === "production") {
  import("./reportWebVitals").then(({ default: reportWebVitals }) => {
    reportWebVitals();
  });
}
