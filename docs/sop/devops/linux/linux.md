---
title: Linux实用操作笔记
description: Linunx基础常用笔记
tag:
  - Linux
sidebar: true
outline: [2,3,4]
lastUpdated: true
---
# Linux实用操作笔记

## 端口相关

### Linux查看开放端口
```bash
ss -tuln
# 或
netstat -tuln
lsof -I
```
    
### Window查看开放端口
```shell
netstat -ano
```


## 网络连通性-nc

```bash
ping ip

nc -zv ip 端口（或者 telnet ip 端口）

traceroute ip

``` 

- 示例
`nc -zv 127.0.0.1 8080`


## 文件操作

### 查看文件夹大小排序

#### 查询文件夹下所有文件大小 top 10
```bash
du -ah /home/usr/demo | sort -rh | head -n 10 
```

### 统计路径下文件个数
#### 统计当前路径下的文件数量（不包括目录）

```bash
find . -type f | wc -l

```


#### 统计包括所有子目录中的文件数量

```bash
find . -type f -exec echo {} + | wc -l


```




