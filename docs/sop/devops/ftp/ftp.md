---
title: FTP基础常用笔记
description: FTP基础常用笔记
tag:
  - FTP
sidebar: true
outline: [2,3,4]
lastUpdated: true
---
# FTP基础常用笔记

## 测试FTP连接
### 1. 测试控制端口（21）是否通
telnet your-ftp-server 21
```bash
telnet 127.0.0.1 21
```

### 2. 用 curl 模拟 PASV 上传（自动用被动模式）
curl -v -T test.txt -u user:pass ftp://your-ftp-server/
```bash
curl -v -T test.txt -u user:pass ftp://127.0.0.1:21/
```



### 3. 查看 FTP 服务器日志（vsftpd 通常在 /var/log/vsftpd.log）
tail -f /var/log/vsftpd.log
```bash
tail -f /var/log/vsftpd.log
```



