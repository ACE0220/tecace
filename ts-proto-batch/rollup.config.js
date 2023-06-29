import { defineConfig } from "rollup";
import terser from "@rollup/plugin-terser";

const config =  defineConfig({
  input: "./lib/index.js",
  output: [
    {
      format: "cjs",
      file: "dist/index.cjs.js"
    },
  ],
  plugins: []
})

// if(process.env.NODE_ENV === 'development') {
//   config.output.forEach(item => {
//     item.sourcemap = true;
//   })
// }

if(process.env.NODE_ENV === 'production') {
  config.plugins.push(
    terser({
      compress: {
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        warnings: false,
      },
    })
  );
}

export default config;