const path = require(`path`);

module.exports = {
  webpack: {
    alias: {
      "@": path.resolve(__dirname, "src/"),
      "@components": path.resolve(__dirname, "src/components"),
      "@hooks": path.resolve(__dirname, "src/hooks"),
      "@util": path.resolve(__dirname, "src/util"),
      "@layout": path.resolve(__dirname, "src/components/layout"),
      "@constants": path.resolve(__dirname, "src/constants"),
      "@state": path.resolve(__dirname, "src/state"),
      "@pages": path.resolve(__dirname, "src/pages"),
    },
  },
  devServer: (devServerConfig) => {
    devServerConfig.proxy = {
      "/superset": {
        target: "http://localhost:8088",
        changeOrigin: true,
        pathRewrite: {
          "^/superset": "",
        },
      },
    };

    return devServerConfig;
  },
};
