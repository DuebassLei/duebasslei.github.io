---
title: Windows实用笔记
description: Windows基础常用记录
tag:
  - Windows
sidebar: true
outline: [2,3,4]
lastUpdated: true
---
# Windows实用笔记

## 端口相关

### 查看端口占用，释放端口
```bash
netstat -ano | findstr :9091
taskkill /PID 1234 /F
```


## 磁盘分析
### WizTree

[WizTree](https://www.diskanalyzer.com/)
