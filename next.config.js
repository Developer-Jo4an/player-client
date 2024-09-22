const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});
const env = process.env.NODE_ENV;
const path = require('path');
const {types} = require("sass");
const basePath = "";
const assetPrefix = `${basePath}/`;
// const dev = env !== "production";

module.exports = withBundleAnalyzer({
  env: {
    assetPrefix
  },
  basePath,
  assetPrefix,
  eslint: {
    // Warning: Dangerously allow production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  webpack(config) {
    config.module.rules.push(
      {
        test: /\.svg$/,
        use: [{
          loader: "@svgr/webpack",
          options: {
            svgo: false,
            ref: true
          }
        }]
      },
      {
        test: /preloader.txt$/,
        use: ["raw-loader"],
      },
      {
        test: /\.html$/,
        use: ["raw-loader"],
      },
      {test: /\.(frag|vert)$/, use: 'raw-loader'}
    );
    return config;
  },
  sassOptions: {
    includePaths: [path.join(__dirname, '../')],
    functions: {
      "addBasePath($path)": function(path) {
        return new types.String(basePath + path.getValue())
      }
    }
  },
});

