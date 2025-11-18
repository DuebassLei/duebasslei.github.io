---
title: Docker实用操作笔记🐳
description: Docker基础核心知识及常用操作整理
tag:
  - Docker
  - 容器化
  - DevOps
sidebar: true
outline: [2,3,4]
lastUpdated: true
---

## 📖 目录

- [Docker 基础概念](#docker-基础概念)
- [Dockerfile 详解](#dockerfile-详解)
- [常用 Docker 命令](#常用-docker-命令)
- [Docker Compose](#docker-compose)
- [网络管理](#网络管理)
- [存储管理](#存储管理)
- [最佳实践](#最佳实践)

---

## Docker 基础概念

### 什么是 Docker？

Docker 是一个开源的容器化平台，用于开发、交付和运行应用程序。它使用容器来打包应用程序及其依赖项，确保应用程序在任何环境中都能一致运行。

### 核心概念

#### 1. 镜像（Image）

镜像是一个只读的模板，用于创建 Docker 容器。镜像可以基于其他镜像构建，类似于面向对象编程中的类。

```bash
# 查看本地镜像
docker images
# 或
docker image ls

# 搜索镜像
docker search nginx

# 拉取镜像
docker pull nginx:latest

# 删除镜像
docker rmi <image_id>
# 或
docker image rm <image_id>
```

#### 2. 容器（Container）

容器是镜像的运行实例。容器可以被创建、启动、停止、删除。

```bash
# 运行容器
docker run <image>

# 查看运行中的容器
docker ps

# 查看所有容器（包括停止的）
docker ps -a

# 停止容器
docker stop <container_id>

# 启动已停止的容器
docker start <container_id>

# 删除容器
docker rm <container_id>

# 强制删除运行中的容器
docker rm -f <container_id>
```

#### 3. 仓库（Repository）

仓库是集中存储镜像的地方，类似于 Git 仓库。Docker Hub 是 Docker 官方的公共仓库。

---

## Dockerfile 详解

### 基本结构

Dockerfile 是一个文本文件，包含构建镜像的指令。

```dockerfile
# syntax=docker/dockerfile:1
# 基础镜像
FROM ubuntu:22.04

# 设置工作目录
WORKDIR /app

# 安装依赖
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip

# 复制应用文件
COPY . /app

# 设置环境变量
ENV FLASK_APP=app.py
ENV FLASK_ENV=production

# 暴露端口
EXPOSE 8000

# 定义启动命令
CMD ["python3", "app.py"]
```

### 常用指令

#### FROM

指定基础镜像，必须是 Dockerfile 的第一条指令。

```dockerfile
FROM ubuntu:22.04
FROM node:18-alpine
FROM python:3.11-slim
```

#### WORKDIR

设置工作目录，后续的 RUN、CMD、COPY 等指令都在此目录下执行。

```dockerfile
WORKDIR /app
WORKDIR /usr/src/app
```

#### RUN

执行命令并创建新的镜像层，常用于安装软件包。

```dockerfile
# 单行命令
RUN apt-get update
RUN apt-get install -y nginx

# 多行命令（推荐，减少层数）
RUN apt-get update && \
    apt-get install -y \
    nginx \
    curl \
    && rm -rf /var/lib/apt/lists/*
```

#### COPY / ADD

复制文件到镜像中。

```dockerfile
# COPY 推荐使用（更简单）
COPY package.json /app/
COPY . /app/

# ADD 支持 URL 和自动解压
ADD https://example.com/file.tar.gz /tmp/
ADD file.tar.gz /tmp/  # 自动解压
```

#### ENV

设置环境变量。

```dockerfile
ENV NODE_ENV=production
ENV APP_PORT=3000
ENV PATH=/usr/local/bin:$PATH
```

#### ARG

构建参数，仅在构建时有效。

```dockerfile
ARG VERSION=latest
ARG BUILD_DATE
```

#### EXPOSE

声明容器运行时监听的端口（不实际发布端口）。

```dockerfile
EXPOSE 80
EXPOSE 443
EXPOSE 8000/tcp
EXPOSE 27017/udp
```

#### CMD

指定容器启动时执行的命令（可被 `docker run` 覆盖）。

```dockerfile
# 推荐使用 exec 形式
CMD ["python3", "app.py"]

# Shell 形式
CMD python3 app.py
```

#### ENTRYPOINT

指定容器启动时执行的命令（不可被覆盖）。

```dockerfile
ENTRYPOINT ["docker-entrypoint.sh"]
ENTRYPOINT ["nginx", "-g", "daemon off;"]
```

#### VOLUME

创建挂载点，用于持久化数据。

```dockerfile
VOLUME ["/data"]
VOLUME ["/var/log", "/var/db"]
```

### 多阶段构建

多阶段构建可以减小最终镜像大小，只保留运行时需要的文件。

```dockerfile
# syntax=docker/dockerfile:1

# 构建阶段
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 运行阶段
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### 构建镜像

```bash
# 基本构建
docker build -t myapp:latest .

# 指定 Dockerfile
docker build -f Dockerfile.prod -t myapp:prod .

# 构建参数
docker build --build-arg VERSION=1.0.0 -t myapp:1.0.0 .

# 不使用缓存
docker build --no-cache -t myapp:latest .
```

---

## 常用 Docker 命令

### 容器管理

```bash
# 运行容器
docker run [OPTIONS] IMAGE [COMMAND] [ARG...]

# 常用选项
docker run -d              # 后台运行
docker run -it             # 交互式终端
docker run -p 8080:80      # 端口映射
docker run -v /data:/app   # 挂载卷
docker run --name myapp    # 指定容器名
docker run --rm            # 自动删除
docker run -e KEY=value    # 设置环境变量

# 完整示例
docker run -d \
  --name myapp \
  -p 8080:80 \
  -v /host/data:/app/data \
  -e NODE_ENV=production \
  --restart unless-stopped \
  myapp:latest
```

### 查看日志

```bash
# 查看容器日志
docker logs <container_id>

# 实时跟踪日志
docker logs -f <container_id>

# 查看最近 100 行
docker logs --tail 100 <container_id>

# 带时间戳
docker logs -t <container_id>
```

### 进入容器

```bash
# 使用 exec（推荐）
docker exec -it <container_id> /bin/bash
docker exec -it <container_id> sh

# 使用 attach（不推荐，会附加到主进程）
docker attach <container_id>
```

### 容器操作

```bash
# 启动/停止/重启
docker start <container_id>
docker stop <container_id>
docker restart <container_id>

# 暂停/恢复
docker pause <container_id>
docker unpause <container_id>

# 查看容器信息
docker inspect <container_id>

# 查看容器资源使用
docker stats <container_id>
docker stats  # 查看所有容器

# 查看容器进程
docker top <container_id>
```

### 镜像管理

```bash
# 查看镜像
docker images
docker image ls

# 构建镜像
docker build -t myapp:tag .

# 标记镜像
docker tag myapp:latest myapp:1.0.0

# 推送镜像
docker push username/myapp:1.0.0

# 拉取镜像
docker pull nginx:latest

# 删除镜像
docker rmi <image_id>
docker image rm <image_id>

# 删除未使用的镜像
docker image prune

# 删除所有未使用的镜像
docker image prune -a
```

### 清理命令

```bash
# 删除停止的容器
docker container prune

# 删除未使用的网络
docker network prune

# 删除未使用的卷
docker volume prune

# 删除所有未使用的资源
docker system prune

# 删除所有未使用的资源（包括镜像）
docker system prune -a
```

---

## Docker Compose

Docker Compose 用于定义和运行多容器 Docker 应用程序。

### 基本语法

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "8000:8000"
    volumes:
      - .:/app
    environment:
      - NODE_ENV=development
    depends_on:
      - db
      - redis

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:

networks:
  default:
    driver: bridge
```

### 常用命令

```bash
# 启动服务
docker compose up

# 后台启动
docker compose up -d

# 构建并启动
docker compose up --build

# 停止服务
docker compose stop

# 停止并删除容器
docker compose down

# 停止并删除容器、网络、卷
docker compose down -v

# 查看服务状态
docker compose ps

# 查看日志
docker compose logs
docker compose logs -f web

# 执行命令
docker compose exec web bash
docker compose exec db psql -U user -d myapp

# 重启服务
docker compose restart web

# 扩展服务
docker compose up -d --scale web=3
```

### 服务配置

#### build

```yaml
services:
  web:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        - BUILD_VERSION=1.0.0
      target: production
```

#### ports

```yaml
services:
  web:
    ports:
      - "8000:8000"           # host:container
      - "127.0.0.1:8080:80"    # 指定主机 IP
      - "9000-9010:9000-9010"  # 端口范围
```

#### volumes

```yaml
services:
  web:
    volumes:
      # 命名卷
      - db_data:/var/lib/db
      # 绑定挂载
      - ./data:/app/data
      # 匿名卷
      - /var/cache
      # 只读挂载
      - ./config:/app/config:ro
```

#### environment

```yaml
services:
  web:
    environment:
      - NODE_ENV=production
      - DEBUG=false
    # 或使用环境变量文件
    env_file:
      - .env
      - .env.production
```

#### depends_on

```yaml
services:
  web:
    depends_on:
      - db
      - redis
    # 等待服务健康
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
```

#### healthcheck

```yaml
services:
  web:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

---

## 网络管理

### 网络类型

#### 1. Bridge 网络（默认）

```bash
# 创建 bridge 网络
docker network create my-bridge-network

# 运行容器并连接到网络
docker run -d --name web --network my-bridge-network nginx

# 查看网络
docker network ls
docker network inspect my-bridge-network
```

#### 2. Host 网络

容器直接使用主机网络。

```bash
docker run -d --network host nginx
```

#### 3. None 网络

容器没有网络接口。

```bash
docker run -d --network none alpine
```

#### 4. 自定义网络

```bash
# 创建自定义网络
docker network create \
  --driver bridge \
  --subnet=172.20.0.0/16 \
  --gateway=172.20.0.1 \
  my-custom-network
```

### Docker Compose 网络

```yaml
services:
  web:
    networks:
      - frontend
      - backend

  db:
    networks:
      - backend

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    driver_opts:
      com.docker.network.bridge.host_binding_ipv4: "127.0.0.1"
```

### 容器间通信

```bash
# 通过容器名通信（同一网络）
docker run -d --name web --network my-network nginx
docker run -d --name app --network my-network myapp
# app 可以通过 http://web:80 访问 nginx

# 通过别名
docker network connect --alias db my-network postgres
```

---

## 存储管理

### Volume（命名卷）

Docker 管理的存储，独立于容器生命周期。

```bash
# 创建卷
docker volume create my-volume

# 查看卷
docker volume ls
docker volume inspect my-volume

# 使用卷
docker run -d -v my-volume:/data nginx

# 删除卷
docker volume rm my-volume

# 删除未使用的卷
docker volume prune
```

### Bind Mount（绑定挂载）

直接挂载主机目录到容器。

```bash
# 使用 -v
docker run -d -v /host/path:/container/path nginx

# 使用 --mount（推荐）
docker run -d \
  --mount type=bind,src=/host/path,dst=/container/path,ro \
  nginx
```

### tmpfs Mount

临时文件系统，仅存储在内存中。

```bash
docker run -d \
  --tmpfs /tmp:rw,noexec,nosuid,size=100m \
  nginx
```

### Docker Compose 卷

```yaml
services:
  web:
    volumes:
      # 命名卷
      - db_data:/var/lib/db
      # 绑定挂载
      - ./data:/app/data
      # 只读
      - ./config:/app/config:ro

volumes:
  db_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /host/path
```

---

## 最佳实践

### Dockerfile 最佳实践

- **使用多阶段构建减小镜像大小**

```dockerfile
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
CMD ["node", "index.js"]
```

- **合理使用 .dockerignore**

```dockerignore
node_modules
npm-debug.log
.git
.gitignore
.env
.nyc_output
coverage
.DS_Store
```

- **最小化层数**

```dockerfile
# 不好
RUN apt-get update
RUN apt-get install -y package1
RUN apt-get install -y package2

# 好
RUN apt-get update && \
    apt-get install -y package1 package2 && \
    rm -rf /var/lib/apt/lists/*
```

- **使用特定标签而非 latest**

```dockerfile
FROM node:18-alpine  # 而不是 node:latest
FROM python:3.11-slim  # 而不是 python:latest
```

- **使用非 root 用户**

```dockerfile
RUN groupadd -r appuser && useradd -r -g appuser appuser
USER appuser
```

- **合理使用缓存**

```dockerfile
# 先复制依赖文件，利用缓存
COPY package*.json ./
RUN npm install
COPY . .
```

### 安全最佳实践

- **扫描镜像漏洞**

```bash
docker scan myapp:latest
```

- **使用最小化基础镜像**

```dockerfile
FROM alpine:latest  # 而不是 ubuntu:latest
FROM node:18-alpine  # 而不是 node:18
```

- **不在镜像中存储敏感信息**

```dockerfile
# 使用 ARG 和构建时传入
ARG DB_PASSWORD
# 运行时使用环境变量或密钥管理
```

- **定期更新基础镜像**

```bash
docker pull node:18-alpine
docker build --pull -t myapp .
```

### 性能优化

- **使用 .dockerignore 减少构建上下文**

- **合理使用缓存层**

- **多阶段构建减小最终镜像**

- **使用健康检查**

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```

### 常用模式

#### 开发环境

```yaml
services:
  web:
    build: .
    volumes:
      - .:/app  # 代码热重载
    environment:
      - NODE_ENV=development
    ports:
      - "3000:3000"
```

#### 生产环境

```yaml
services:
  web:
    image: myapp:latest
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    ports:
      - "80:3000"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
```

---

##  学习资源

- [Docker 官方文档](https://docs.docker.com/)
- [Docker Hub](https://hub.docker.com/)
- [Docker Compose 文档](https://docs.docker.com/compose/)
- [Dockerfile 最佳实践](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)

---

## 💡 常用命令速查

```bash
# 容器
docker run -d -p 8080:80 --name web nginx
docker ps -a
docker logs -f web
docker exec -it web bash
docker stop web && docker rm web

# 镜像
docker build -t myapp:latest .
docker images
docker rmi myapp:latest

# 网络
docker network ls
docker network create my-network
docker network inspect my-network

# 卷
docker volume ls
docker volume create my-volume
docker volume inspect my-volume

# Compose
docker compose up -d
docker compose ps
docker compose logs -f
docker compose down

# 清理
docker system prune -a
docker volume prune
docker network prune
```

---

## 🔧 故障排查

### 查看容器日志

```bash
docker logs <container_id>
docker logs -f <container_id>  # 实时跟踪
docker logs --tail 100 <container_id>  # 最近 100 行
```

### 检查容器状态

```bash
docker ps -a
docker inspect <container_id>
docker stats <container_id>
```

### 进入容器调试

```bash
docker exec -it <container_id> /bin/bash
docker exec -it <container_id> sh
```

### 检查网络连接

```bash
docker network ls
docker network inspect <network_id>
docker exec <container_id> ping <other_container>
```

### 检查卷挂载

```bash
docker volume ls
docker volume inspect <volume_name>
docker exec <container_id> ls -la /mount/point
```
