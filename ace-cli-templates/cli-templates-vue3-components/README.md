# 初始化

根目录新建.npmrc文件

```sh
touch .npmrc
```

.npmrc文件填入以下内容
```sh
shamefully-hoist=true
link-workspace-packages=deep
```

# git初始化

```sh
git init
```

# 安装依赖

```sh
pnpm install
```

# 打包

按照packages/utils -> packages/theme-chalk -> packages/components -> packages/core 顺序逐一打包

# play启动

```sh
cd play

pnpm dev
```

# docs启动

```sh
cd docs

pnpm docs:dev
```