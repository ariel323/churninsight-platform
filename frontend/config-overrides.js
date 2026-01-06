// Configuración de optimización para React
const { override, addBabelPlugin, addWebpackPlugin } = require("customize-cra");
const CompressionPlugin = require("compression-webpack-plugin");

module.exports = override(
  // Eliminar console.logs en producción
  process.env.NODE_ENV === "production" &&
    addBabelPlugin("transform-remove-console"),

  // Habilitar compresión Gzip
  process.env.NODE_ENV === "production" &&
    addWebpackPlugin(
      new CompressionPlugin({
        filename: "[path][base].gz",
        algorithm: "gzip",
        test: /\.(js|css|html|svg)$/,
        threshold: 8192,
        minRatio: 0.8,
      })
    )
);
