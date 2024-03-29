#!/bin/bash

# 移除dist
rm -rf dist

# js打包
webpack -p --progress --color --mode production

# 复制静态资源目录
cp -rf src/public dist/public

# 复制favicon.ico
cp src/favicon.ico dist/favicon.ico