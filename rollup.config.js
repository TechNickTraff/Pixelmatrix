import { babel } from '@rollup/plugin-babel';

const config = {
  input: 'web/main.mjs',
  output: {
    file: 'sd/main.mjs',
    format: 'iife'
  },
  plugins: [babel({ babelHelpers: 'bundled' })]
};

export default config;
