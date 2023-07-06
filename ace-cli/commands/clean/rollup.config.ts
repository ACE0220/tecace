import { defineConfig } from 'rollup';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import ts2 from 'rollup-plugin-typescript2';

export default defineConfig({
  input: './src/index.ts',
  external: /^(?!\/|\.).*$/,
  output: [
    {
      format: 'cjs',
      file: 'dist/cjs/index.js'
    },
    {
      format: 'es',
      file: 'dist/es/index.js'
    },
  ],
  plugins: [
    commonjs(), 
    resolve(), 
    ts2(), 
  ],
});
