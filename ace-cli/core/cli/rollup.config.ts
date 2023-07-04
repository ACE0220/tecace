import { defineConfig } from 'rollup';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import ts2 from 'rollup-plugin-typescript2';
import json from '@rollup/plugin-json';
import replace from '@rollup/plugin-replace';

export default defineConfig({
  input: './src/index.ts',
  external: [/^(?!\/|\.).*$/, /package.json$/],
  output: [
    {
      format: 'cjs',
      file: 'dist/cjs/index.js',
    },
    {
      format: 'es',
      file: 'dist/es/index.js',
    },
  ],
  plugins: [
    resolve(),
    commonjs(),
    json(),
    ts2(),
    replace({
      include: ['src/**/*.ts'],
      preventAssignment: true,
      delimiters: ['', ''],
      values: {
        '../package.json': '../../package.json',
      },
    }),
  ],
});
