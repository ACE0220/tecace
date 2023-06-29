# 批量转换proto file至typescript file


## 重要的事要说三遍

**系统需要提前安装好protoc编译器**

**系统需要提前安装好protoc编译器**

**系统需要提前安装好protoc编译器**

参考链接：https://ace0220.github.io/cicd/docker/make-image/#基于debian镜像的安装与测试

## 安装

```sh
npm install ts-proto @tecace/ts-proto-batch -g
```

## 使用

```sh
ts-pb gen -i protos -o dist
```

## 选项

- -i,--input proto文件的存放文件夹目录
- -o,--output 生成ts文件的文件夹目录

## 注意

- -i 选项仅支持文件夹读取，封装的初衷是为了批量递归生成typescript file
- -i和-o的文件夹的路径中，基础的部分都是process.cwd()
  - 假定process.cwd()返回/User/home/ace
  - -i protos 最终会拼接成/User/home/ace/protos
  - -o dist 最终会拼接成/User/home/ace/dist

## docker镜像

提供了dockerfile，通过-v参数指定挂载路径，批量生成.ts 文件

镜像构建运行请查看https://ace0220.github.io/cicd/docker/make-image/#%E5%9F%BA%E4%BA%8E%E4%BB%A5%E4%B8%8A%E6%B5%81%E7%A8%8B%E6%9E%84%E5%BB%BAdocker%E9%95%9C%E5%83%8F