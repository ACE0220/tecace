#! /usr/bin/env node
const importLocal = require('import-local');
if(importLocal(__filename)) {
  console.log("正在使用项目中的cli，请移除项目中的包，cli工具仅支持全局安装")
} else {
  require('./index.js')()
}