---
title: NVM常用操作笔记
description: NVM常用操作笔记
tag:
  - NVM
sidebar: true
outline: [2,3,4]
lastUpdated: true
---
# NVM常用操作笔记
## 常用命令

```bash
# 查看 nvm 版本
nvm --version

# 列出所有可安装的 Node.js 版本
nvm list-remote
# Windows 上使用
nvm list available

# 安装最新的 LTS 版本
nvm install --lts

# 安装特定版本
nvm install 18.17.0
nvm install 16.20.1

# 列出已安装的版本
nvm list
# 或
nvm ls

# 切换到特定版本
nvm use 18.17.0

# 设置默认版本
nvm alias default 18.17.0

# 查看当前使用的版本
nvm current

# 卸载特定版本
nvm uninstall 16.20.1


npm config set registry https://registry.npmmirror.com

#安装yarn 和设置国内镜像源
npm install --global yarn
yarn config set registry https://registry.npmmirror.com/

# 忽略包的引擎要求
yarn config set ignore-engines true
```

## 参考文章

<a href="https://blog.51cto.com/u_16213336/12390252">使用nvm切换node版本后如何安装yarn且不影响其他node版本下的yarn版本_mob64ca12d94299的技术博客_51CTO博客</a>

<a href="https://www.runoob.com/nodejs/nodejs-nvm.html">NVM 管理多版本 Node.js | 菜鸟教程</a>



