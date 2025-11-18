---
title: Nginx实用操作笔记
description: Nginx基础核心知识及常用配置整理
tag:
  - Nginx
  - Web服务器
  - 反向代理
sidebar: true
outline: [2,3,4]
lastUpdated: true
---

## 📖 目录

- [Nginx 基础概念](#nginx-基础概念)
- [配置文件结构](#配置文件结构)
- [核心指令](#核心指令)
- [Location 块](#location-块)
- [Server 块](#server-块)
- [反向代理](#反向代理)
- [负载均衡](#负载均衡)
- [SSL/HTTPS 配置](#sslhttps-配置)
- [重写和重定向](#重写和重定向)
- [缓存配置](#缓存配置)
- [日志管理](#日志管理)
- [安全配置](#安全配置)
- [常用配置示例](#常用配置示例)

---

## Nginx 基础概念

### 什么是 Nginx？

Nginx 是一个高性能的 Web 服务器、反向代理服务器和负载均衡器。它采用事件驱动的异步架构，能够处理大量并发连接。

### 核心特性

- **高性能**：事件驱动架构，低内存占用
- **反向代理**：转发请求到后端服务器
- **负载均衡**：分发请求到多个后端服务器
- **静态文件服务**：高效提供静态内容
- **SSL/TLS 终止**：处理 HTTPS 连接
- **缓存**：提供 HTTP 缓存功能

### 安装和基本命令

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# CentOS/RHEL
sudo yum install nginx

# 启动服务
sudo systemctl start nginx

# 停止服务
sudo systemctl stop nginx

# 重启服务
sudo systemctl restart nginx

# 重载配置（不中断服务）
sudo nginx -s reload

# 测试配置文件
sudo nginx -t

# 查看版本
nginx -v
```

---

## 配置文件结构

### 主配置文件位置

- **主配置文件**：`/etc/nginx/nginx.conf`
- **站点配置目录**：`/etc/nginx/sites-available/` 和 `/etc/nginx/sites-enabled/`
- **默认站点配置**：`/etc/nginx/sites-available/default`

### 配置文件结构

```nginx
# 全局配置
user www-data;
worker_processes auto;
pid /run/nginx.pid;

# 事件模块
events {
    worker_connections 1024;
    use epoll;
}

# HTTP 模块
http {
    # 基础配置
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # 日志格式
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    
    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log;
    
    # 性能优化
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    
    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml+rss;
    
    # Server 块
    server {
        listen 80;
        server_name example.com www.example.com;
        
        location / {
            root /var/www/html;
            index index.html index.htm;
        }
    }
}
```

---

## 核心指令

### 基础指令

```nginx
# 监听端口
listen 80;
listen 443 ssl;
listen [::]:80 ipv6only=on;

# 服务器名称
server_name example.com www.example.com;
server_name *.example.com;
server_name _;  # 默认服务器

# 根目录
root /var/www/html;

# 索引文件
index index.html index.htm index.php;

# 错误页面
error_page 404 /404.html;
error_page 500 502 503 504 /50x.html;
```

### 访问控制

```nginx
# 允许/拒绝访问
allow 192.168.1.0/24;
deny all;

# 基于用户认证
auth_basic "Restricted Access";
auth_basic_user_file /etc/nginx/.htpasswd;
```

### 性能优化

```nginx
# 发送文件
sendfile on;

# TCP 优化
tcp_nopush on;
tcp_nodelay on;

# Keepalive
keepalive_timeout 65;
keepalive_requests 100;

# 客户端限制
client_max_body_size 10m;
client_body_buffer_size 128k;
```

---

## Location 块

### Location 匹配规则

```nginx
# 精确匹配
location = / {
    # 只匹配 /
}

# 前缀匹配（最长匹配优先）
location /images/ {
    root /data;
}

# 正则匹配（区分大小写）
location ~ \.(gif|jpg|jpeg)$ {
    expires 30d;
    add_header Cache-Control "public, immutable";
}

# 正则匹配（不区分大小写）
location ~* \.(gif|jpg|jpeg)$ {
    # ...
}

# 优先前缀匹配（停止正则匹配）
location ^~ /images/ {
    root /data;
}
```

### Location 优先级

1. `=` 精确匹配
2. `^~` 优先前缀匹配
3. `~` 和 `~*` 正则匹配（按顺序）
4. 前缀匹配（最长匹配）

### 常用 Location 配置

```nginx
# 静态文件
location /static/ {
    alias /var/www/static/;
    expires 30d;
    access_log off;
}

# PHP 文件
location ~ \.php$ {
    fastcgi_pass 127.0.0.1:9000;
    fastcgi_index index.php;
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    include fastcgi_params;
}

# 禁止访问隐藏文件
location ~ /\. {
    deny all;
    access_log off;
    log_not_found off;
}
```

---

## Server 块

### 基本 Server 块

```nginx
server {
    listen 80;
    server_name example.com www.example.com;
    
    root /var/www/example;
    index index.html;
    
    location / {
        try_files $uri $uri/ =404;
    }
}
```

### 多个 Server 块

```nginx
# HTTP 服务器
server {
    listen 80;
    server_name example.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS 服务器
server {
    listen 443 ssl http2;
    server_name example.com;
    
    ssl_certificate /etc/ssl/certs/example.com.crt;
    ssl_certificate_key /etc/ssl/private/example.com.key;
    
    location / {
        root /var/www/example;
        index index.html;
    }
}
```

---

## 反向代理

### 基本反向代理

```nginx
server {
    listen 80;
    server_name example.com;
    
    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 代理头设置

```nginx
location / {
    proxy_pass http://backend;
    
    # 请求头
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Forwarded-Port $server_port;
    
    # 超时设置
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
    
    # 缓冲设置
    proxy_buffering on;
    proxy_buffer_size 4k;
    proxy_buffers 8 4k;
    proxy_busy_buffers_size 8k;
    
    # 重定向处理
    proxy_redirect off;
}
```

### FastCGI 代理（PHP）

```nginx
location ~ \.php$ {
    fastcgi_pass 127.0.0.1:9000;
    fastcgi_index index.php;
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    include fastcgi_params;
    
    fastcgi_read_timeout 300;
    fastcgi_buffer_size 128k;
    fastcgi_buffers 4 256k;
}
```

---

## 负载均衡

### Upstream 配置

```nginx
# 定义上游服务器组
upstream backend {
    server 192.168.1.10:8080;
    server 192.168.1.11:8080;
    server 192.168.1.12:8080;
}

server {
    listen 80;
    server_name example.com;
    
    location / {
        proxy_pass http://backend;
    }
}
```

### 负载均衡算法

```nginx
# 轮询（默认）
upstream backend {
    server 192.168.1.10:8080;
    server 192.168.1.11:8080;
}

# 加权轮询
upstream backend {
    server 192.168.1.10:8080 weight=3;
    server 192.168.1.11:8080 weight=1;
}

# IP 哈希（会话保持）
upstream backend {
    ip_hash;
    server 192.168.1.10:8080;
    server 192.168.1.11:8080;
}

# 最少连接
upstream backend {
    least_conn;
    server 192.168.1.10:8080;
    server 192.168.1.11:8080;
}
```

### 健康检查

```nginx
upstream backend {
    server 192.168.1.10:8080 max_fails=3 fail_timeout=30s;
    server 192.168.1.11:8080 max_fails=3 fail_timeout=30s;
    server 192.168.1.12:8080 backup;  # 备用服务器
}
```

---

## SSL/HTTPS 配置

### 基本 SSL 配置

```nginx
server {
    listen 443 ssl http2;
    server_name example.com;
    
    ssl_certificate /etc/ssl/certs/example.com.crt;
    ssl_certificate_key /etc/ssl/private/example.com.key;
    
    # SSL 协议和加密套件
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # SSL 会话缓存
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    location / {
        root /var/www/html;
        index index.html;
    }
}
```

### HTTP 重定向到 HTTPS

```nginx
# HTTP 服务器
server {
    listen 80;
    server_name example.com www.example.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS 服务器
server {
    listen 443 ssl http2;
    server_name example.com www.example.com;
    
    ssl_certificate /etc/ssl/certs/example.com.crt;
    ssl_certificate_key /etc/ssl/private/example.com.key;
    
    # ... 其他配置
}
```

### 优化 HTTPS 性能

```nginx
http {
    # SSL 会话缓存（共享）
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    server {
        listen 443 ssl http2;
        server_name example.com;
        
        ssl_certificate /etc/ssl/certs/example.com.crt;
        ssl_certificate_key /etc/ssl/private/example.com.key;
        
        # 现代 SSL 配置
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256;
        ssl_prefer_server_ciphers off;  # TLS 1.3 不需要
        
        # OCSP Stapling
        ssl_stapling on;
        ssl_stapling_verify on;
        ssl_trusted_certificate /etc/ssl/certs/ca-certificates.crt;
        
        # HSTS
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    }
}
```

---

## 重写和重定向

### Rewrite 指令

```nginx
# 基本重写
rewrite ^/old-url$ /new-url permanent;

# 带正则表达式
rewrite ^/users/(.*)$ /user.php?id=$1 last;

# 重写标志
# last - 停止处理，重新匹配 location
# break - 停止处理，不再匹配
# redirect - 302 临时重定向
# permanent - 301 永久重定向
```

### 常见重写规则

```nginx
# 强制 www
server {
    listen 80;
    server_name example.com;
    return 301 http://www.example.com$request_uri;
}

# 强制非 www
server {
    listen 80;
    server_name www.example.com;
    return 301 http://example.com$request_uri;
}

# 移除尾部斜杠
rewrite ^/(.*)/$ /$1 permanent;

# 添加尾部斜杠
rewrite ^([^.]*[^/])$ $1/ permanent;
```

### URL 重写示例

```nginx
location / {
    # 如果文件不存在，重写到 index.php
    try_files $uri $uri/ /index.php?$query_string;
}

location ~ \.php$ {
    fastcgi_pass 127.0.0.1:9000;
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    include fastcgi_params;
}
```

---

## 缓存配置

### 代理缓存

```nginx
http {
    # 定义缓存路径和参数
    proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m 
                     max_size=10g inactive=60m use_temp_path=off;
    
    server {
        location / {
            proxy_pass http://backend;
            
            # 启用缓存
            proxy_cache my_cache;
            proxy_cache_valid 200 302 10m;
            proxy_cache_valid 404 1m;
            
            # 缓存键
            proxy_cache_key "$scheme$request_method$host$request_uri";
            
            # 缓存控制
            proxy_cache_bypass $http_pragma $http_authorization;
            proxy_no_cache $http_pragma $http_authorization;
            
            # 添加缓存状态头
            add_header X-Cache-Status $upstream_cache_status;
        }
    }
}
```

### 浏览器缓存

```nginx
# 静态资源缓存
location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
    expires 30d;
    add_header Cache-Control "public, immutable";
    access_log off;
}

# HTML 文件不缓存
location ~* \.html$ {
    expires -1;
    add_header Cache-Control "no-cache, no-store, must-revalidate";
}
```

---

## 日志管理

### 访问日志

```nginx
# 定义日志格式
log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                '$status $body_bytes_sent "$http_referer" '
                '"$http_user_agent" "$http_x_forwarded_for"';

log_format detailed '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for" '
                    'rt=$request_time uct="$upstream_connect_time" '
                    'uht="$upstream_header_time" urt="$upstream_response_time"';

# 使用日志格式
access_log /var/log/nginx/access.log main;
access_log /var/log/nginx/access.log detailed;

# 禁用访问日志
access_log off;
```

### 错误日志

```nginx
# 错误日志级别
# debug, info, notice, warn, error, crit, alert, emerg
error_log /var/log/nginx/error.log warn;

# 不同级别
error_log /var/log/nginx/error.log;
error_log /var/log/nginx/error.log notice;
error_log /var/log/nginx/error.log debug;
```

### 日志优化

```nginx
# 打开日志文件缓存
open_log_file_cache max=1000 inactive=20s valid=1m min_uses=2;

# 压缩日志
access_log /path/to/log.gz combined gzip flush=5m;
```

---

## 安全配置

### 隐藏 Nginx 版本

```nginx
http {
    server_tokens off;
}
```

### 安全头

```nginx
server {
    # X-Frame-Options
    add_header X-Frame-Options "SAMEORIGIN" always;
    
    # X-Content-Type-Options
    add_header X-Content-Type-Options "nosniff" always;
    
    # X-XSS-Protection
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Referrer-Policy
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # Content-Security-Policy
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
```

### 限制请求

```nginx
# 限制连接数
limit_conn_zone $binary_remote_addr zone=conn_limit_per_ip:10m;

server {
    limit_conn conn_limit_per_ip 10;
}

# 限制请求速率
limit_req_zone $binary_remote_addr zone=req_limit_per_ip:10m rate=10r/s;

server {
    limit_req zone=req_limit_per_ip burst=20 nodelay;
}
```

### 禁止访问敏感文件

```nginx
# 禁止访问隐藏文件
location ~ /\. {
    deny all;
    access_log off;
    log_not_found off;
}

# 禁止访问配置文件
location ~* \.(env|git|svn|htaccess|htpasswd|ini|log|sh|sql|conf)$ {
    deny all;
}
```

---

## 常用配置示例

### 完整示例：反向代理 + 负载均衡

```nginx
upstream backend {
    least_conn;
    server 192.168.1.10:8080 weight=3 max_fails=3 fail_timeout=30s;
    server 192.168.1.11:8080 weight=2 max_fails=3 fail_timeout=30s;
    server 192.168.1.12:8080 backup;
}

server {
    listen 80;
    server_name api.example.com;
    
    # 日志
    access_log /var/log/nginx/api.access.log;
    error_log /var/log/nginx/api.error.log;
    
    # 客户端限制
    client_max_body_size 10m;
    client_body_buffer_size 128k;
    
    location / {
        proxy_pass http://backend;
        
        # 代理头
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 超时
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # 缓冲
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
    }
}
```

### 完整示例：静态网站 + PHP

```nginx
server {
    listen 80;
    server_name example.com www.example.com;
    root /var/www/example;
    index index.php index.html index.htm;
    
    # 日志
    access_log /var/log/nginx/example.access.log;
    error_log /var/log/nginx/example.error.log;
    
    # 静态文件
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # PHP 文件
    location ~ \.php$ {
        try_files $uri =404;
        fastcgi_split_path_info ^(.+\.php)(/.+)$;
        fastcgi_pass 127.0.0.1:9000;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
    
    # 默认 location
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
    
    # 禁止访问隐藏文件
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

### 完整示例：HTTPS + HTTP/2

```nginx
# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name example.com www.example.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS 服务器
server {
    listen 443 ssl http2;
    server_name example.com www.example.com;
    root /var/www/example;
    index index.html;
    
    # SSL 证书
    ssl_certificate /etc/ssl/certs/example.com.crt;
    ssl_certificate_key /etc/ssl/private/example.com.key;
    
    # SSL 配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;
    
    # SSL 会话
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    
    # 安全头
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    location / {
        try_files $uri $uri/ =404;
    }
}
```

---

##  学习资源

- [Nginx 官方文档](https://nginx.org/en/docs/)
- [Nginx 配置生成器](https://www.digitalocean.com/community/tools/nginx)
- [Nginx 性能调优](https://www.nginx.com/blog/tuning-nginx/)

---

## 💡 常用命令速查

```bash
# 测试配置
nginx -t

# 重载配置
nginx -s reload

# 停止服务
nginx -s stop

# 优雅停止
nginx -s quit

# 查看版本
nginx -v

# 查看编译信息
nginx -V

# 查看帮助
nginx -h
```

---

## 🔧 故障排查

### 检查配置语法

```bash
sudo nginx -t
```

### 查看错误日志

```bash
sudo tail -f /var/log/nginx/error.log
```

### 查看访问日志

```bash
sudo tail -f /var/log/nginx/access.log
```

### 检查端口占用

```bash
sudo netstat -tlnp | grep :80
sudo ss -tlnp | grep :80
```

### 检查进程

```bash
ps aux | grep nginx
```

### 测试配置后重载

```bash
sudo nginx -t && sudo nginx -s reload
```
