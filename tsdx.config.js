// const webWorkerLoader = require('rollup-plugin-web-worker-loader');

// const rollUpConfig = {
//   entry: 'dist/index.js',
//   plugins: [webWorkerLoader(/* configuration */)],
//   format: 'esm'
// };

// module.exports = {
//   // This function will run for each entry/format/env combination
//   rollup(config, options) {
//     console.log('new config', config);
//     console.log('new options', options);
//     return { ...config, ...rollUpConfig }; // always return a config.
//   }
// };
const webWorkerLoader = require('rollup-plugin-web-worker-loader');
const copy = require('rollup-plugin-copy-assets');

module.exports = {
  rollup(config, options) {
    config.plugins.unshift(webWorkerLoader({ extensions: ['.ts', '.js', '.tsx', '.jsx'], pattern: /.+?\.worker(?:\.ts)?$/g }));
    config.plugins.push(copy({ assets: ['src/utils/lottie-wasm.js', 'src/utils/lottie-wasm.wasm'] }));

    return config; // always return a config.
  }
};
