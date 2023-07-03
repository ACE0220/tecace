import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import dts from "vite-plugin-dts";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import DefineOptions from "unplugin-vue-define-options/vite";

export default defineConfig({
  build: {
    //打包后文件目录
    outDir: "es",
    //压缩
    minify: false,
    rollupOptions: {
      external: ["vue", /^<%= projectName %>/],
      output: [
        {
          format: "es",
          entryFileNames: "[name].mjs",
          preserveModules: true,
          exports: "named",
          dir: "dist/es",
        },
      ],
    },
    lib: {
      entry: "./index.ts",
    },
  },
  // plugins: [
  //   VueMacros({
  //     plugins: [
  //       vue(),
  //       vueJsx(),
  //       dts({
  //         entryRoot: './',
  //         outputDir: ['./dist/es'],
  //         tsConfigFilePath: '../../tsconfig.json'
  //       })
  //     ]
  //   })
  // ],
  plugins: [
    vue(),
    vueJsx(),
    dts({
      entryRoot: "./",
      outputDir: ["./dist/es"],
      tsConfigFilePath: "../../tsconfig.json",
    }),
    DefineOptions(),
  ],
});
