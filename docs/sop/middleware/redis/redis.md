---
title: Redis实用操作笔记
description: Redis基础核心知识及常用操作整理
tag:
  - Redis
  - 缓存
  - 数据库
sidebar: true
outline: [2,3,4]
lastUpdated: true
---

## 📖 目录

- [Redis 基础概念](#redis-基础概念)
- [数据类型](#数据类型)
- [字符串（String）](#字符串string)
- [列表（List）](#列表list)
- [集合（Set）](#集合set)
- [有序集合（Sorted Set）](#有序集合sorted-set)
- [哈希（Hash）](#哈希hash)
- [常用命令](#常用命令)
- [持久化](#持久化)
- [复制和集群](#复制和集群)
- [配置管理](#配置管理)
- [最佳实践](#最佳实践)

---

## Redis 基础概念

### 什么是 Redis？

Redis（Remote Dictionary Server）是一个开源的、基于内存的数据结构存储系统，可以用作数据库、缓存和消息中间件。

### 核心特性

- **高性能**：基于内存操作，读写速度极快
- **丰富的数据类型**：支持字符串、列表、集合、有序集合、哈希等
- **持久化**：支持 RDB 和 AOF 两种持久化方式
- **高可用**：支持主从复制、哨兵、集群模式
- **原子操作**：所有操作都是原子性的
- **发布订阅**：支持消息发布订阅模式

### 应用场景

- **缓存**：热点数据缓存，提升访问速度
- **会话存储**：存储用户会话信息
- **计数器**：实时计数、点赞、浏览量等
- **排行榜**：使用有序集合实现排行榜
- **消息队列**：使用列表实现简单的消息队列
- **分布式锁**：实现分布式环境下的锁机制

### 安装和启动

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install redis-server

# CentOS/RHEL
sudo yum install redis

# 启动 Redis
redis-server

# 启动 Redis（指定配置文件）
redis-server /etc/redis/redis.conf

# 连接 Redis CLI
redis-cli

# 连接远程 Redis
redis-cli -h hostname -p port -a password
```

---

## 数据类型

### 支持的数据类型

1. **String（字符串）**：最基本的数据类型
2. **List（列表）**：有序的字符串列表
3. **Set（集合）**：无序的字符串集合
4. **Sorted Set（有序集合）**：带分数的有序集合
5. **Hash（哈希）**：键值对集合
6. **Stream（流）**：日志数据结构
7. **Bitmaps（位图）**：位操作
8. **HyperLogLog**：基数统计

### 查看数据类型

```redis
TYPE key
```

---

## 字符串（String）

### 基本操作

```redis
# 设置值
SET key value

# 获取值
GET key

# 设置多个值
MSET key1 value1 key2 value2

# 获取多个值
MGET key1 key2

# 设置值（仅当键不存在时）
SETNX key value

# 设置值并指定过期时间
SETEX key seconds value

# 获取并设置值
GETSET key value

# 获取字符串长度
STRLEN key

# 追加字符串
APPEND key value

# 获取子字符串
GETRANGE key start end

# 设置子字符串
SETRANGE key offset value
```

### 数值操作

```redis
# 递增
INCR key

# 递增指定值
INCRBY key increment

# 递增浮点数
INCRBYFLOAT key increment

# 递减
DECR key

# 递减指定值
DECRBY key decrement
```

### 示例

```redis
> SET counter 100
OK
> INCR counter
(integer) 101
> INCRBY counter 10
(integer) 111
> GET counter
"111"
```

---

## 列表（List）

### 基本操作

```redis
# 从左侧推入
LPUSH key value [value ...]

# 从右侧推入
RPUSH key value [value ...]

# 从左侧弹出
LPOP key

# 从右侧弹出
RPOP key

# 获取列表长度
LLEN key

# 获取指定范围的元素
LRANGE key start stop

# 获取指定索引的元素
LINDEX key index

# 设置指定索引的值
LSET key index value

# 在指定元素前/后插入
LINSERT key BEFORE|AFTER pivot value

# 删除指定值的元素
LREM key count value

# 修剪列表
LTRIM key start stop
```

### 阻塞操作

```redis
# 阻塞式左侧弹出
BLPOP key [key ...] timeout

# 阻塞式右侧弹出
BRPOP key [key ...] timeout

# 阻塞式弹出并推入
BRPOPLPUSH source destination timeout
```

### 示例

```redis
> LPUSH mylist "one"
(integer) 1
> LPUSH mylist "two"
(integer) 2
> RPUSH mylist "three"
(integer) 3
> LRANGE mylist 0 -1
1) "two"
2) "one"
3) "three"
```

---

## 集合（Set）

### 基本操作

```redis
# 添加成员
SADD key member [member ...]

# 删除成员
SREM key member [member ...]

# 获取所有成员
SMEMBERS key

# 获取成员数量
SCARD key

# 判断是否为成员
SISMEMBER key member

# 判断多个成员
SMISMEMBER key member [member ...]

# 随机获取成员
SRANDMEMBER key [count]

# 随机弹出成员
SPOP key [count]

# 移动成员
SMOVE source destination member
```

### 集合运算

```redis
# 交集
SINTER key [key ...]

# 交集并存储
SINTERSTORE destination key [key ...]

# 并集
SUNION key [key ...]

# 并集并存储
SUNIONSTORE destination key [key ...]

# 差集
SDIFF key [key ...]

# 差集并存储
SDIFFSTORE destination key [key ...]
```

### 迭代

```redis
# 扫描集合
SSCAN key cursor [MATCH pattern] [COUNT count]
```

### 示例

```redis
> SADD set1 "a" "b" "c"
(integer) 3
> SADD set2 "b" "c" "d"
(integer) 3
> SINTER set1 set2
1) "b"
2) "c"
> SUNION set1 set2
1) "a"
2) "b"
3) "c"
4) "d"
```

---

## 有序集合（Sorted Set）

### 基本操作

```redis
# 添加成员
ZADD key score member [score member ...]

# 获取成员分数
ZSCORE key member

# 获取成员排名（从低到高）
ZRANK key member

# 获取成员排名（从高到低）
ZREVRANK key member

# 获取指定范围的成员
ZRANGE key start stop [WITHSCORES]

# 获取指定范围的成员（按分数）
ZRANGEBYSCORE key min max [WITHSCORES] [LIMIT offset count]

# 获取指定范围的成员（反向）
ZREVRANGE key start stop [WITHSCORES]

# 获取成员数量
ZCARD key

# 统计分数范围内的成员数
ZCOUNT key min max

# 删除成员
ZREM key member [member ...]

# 增加成员分数
ZINCRBY key increment member
```

### 集合运算

```redis
# 交集
ZINTERSTORE destination numkeys key [key ...] [WEIGHTS weight [weight ...]] [AGGREGATE SUM|MIN|MAX]

# 并集
ZUNIONSTORE destination numkeys key [key ...] [WEIGHTS weight [weight ...]] [AGGREGATE SUM|MIN|MAX]
```

### 示例

```redis
> ZADD leaderboard 100 "player1"
(integer) 1
> ZADD leaderboard 200 "player2"
(integer) 1
> ZADD leaderboard 150 "player3"
(integer) 1
> ZRANGE leaderboard 0 -1 WITHSCORES
1) "player1"
2) "100"
3) "player3"
4) "150"
5) "player2"
6) "200"
```

---

## 哈希（Hash）

### 基本操作

```redis
# 设置字段值
HSET key field value

# 设置多个字段值
HMSET key field value [field value ...]

# 获取字段值
HGET key field

# 获取多个字段值
HMGET key field [field ...]

# 获取所有字段和值
HGETALL key

# 获取所有字段
HKEYS key

# 获取所有值
HVALS key

# 获取字段数量
HLEN key

# 判断字段是否存在
HEXISTS key field

# 删除字段
HDEL key field [field ...]

# 递增字段值
HINCRBY key field increment

# 递增浮点数字段值
HINCRBYFLOAT key field increment
```

### 示例

```redis
> HSET user:1001 name "Alice" age 30
(integer) 2
> HGET user:1001 name
"Alice"
> HGETALL user:1001
1) "name"
2) "Alice"
3) "age"
4) "30"
> HINCRBY user:1001 age 1
(integer) 31
```

---

## 常用命令

### 键操作

```redis
# 删除键
DEL key [key ...]

# 判断键是否存在
EXISTS key [key ...]

# 设置过期时间（秒）
EXPIRE key seconds

# 设置过期时间（时间戳）
EXPIREAT key timestamp

# 设置过期时间（毫秒）
PEXPIRE key milliseconds

# 查看剩余过期时间（秒）
TTL key

# 查看剩余过期时间（毫秒）
PTTL key

# 移除过期时间
PERSIST key

# 重命名键
RENAME key newkey

# 重命名键（仅当新键不存在时）
RENAMENX key newkey

# 查看键类型
TYPE key

# 随机获取一个键
RANDOMKEY

# 扫描键
SCAN cursor [MATCH pattern] [COUNT count]
```

### 数据库操作

```redis
# 选择数据库（0-15）
SELECT index

# 清空当前数据库
FLUSHDB

# 清空所有数据库
FLUSHALL

# 查看数据库大小
DBSIZE

# 查看服务器信息
INFO [section]

# 查看配置
CONFIG GET parameter

# 设置配置
CONFIG SET parameter value

# 保存数据到磁盘
SAVE

# 异步保存数据到磁盘
BGSAVE
```

---

## 持久化

### RDB（Redis Database）

RDB 是 Redis 的默认持久化方式，通过快照保存数据。

#### 配置

```conf
# redis.conf

# 自动保存条件
save 900 1      # 900秒内至少1个键被修改
save 300 10     # 300秒内至少10个键被修改
save 60 10000   # 60秒内至少10000个键被修改

# RDB 文件名
dbfilename dump.rdb

# RDB 文件保存目录
dir /var/lib/redis
```

#### 手动触发

```redis
# 同步保存
SAVE

# 异步保存
BGSAVE
```

### AOF（Append Only File）

AOF 通过记录所有写操作来持久化数据。

#### 配置

```conf
# redis.conf

# 启用 AOF
appendonly yes

# AOF 文件名
appendfilename "appendonly.aof"

# 同步策略
appendfsync always      # 每次写入都同步
appendfsync everysec    # 每秒同步一次（推荐）
appendfsync no          # 由操作系统决定
```

#### AOF 重写

```redis
# 手动触发 AOF 重写
BGREWRITEAOF
```

---

## 复制和集群

### 主从复制

#### 配置主服务器

```conf
# redis.conf (Master)
bind 0.0.0.0
port 6379
```

#### 配置从服务器

```conf
# redis.conf (Slave)
bind 0.0.0.0
port 6380
replicaof 127.0.0.1 6379
```

#### 命令方式

```redis
# 在从服务器上执行
REPLICAOF host port

# 停止复制
REPLICAOF NO ONE
```

### 哨兵（Sentinel）

哨兵用于监控 Redis 主从服务器，实现自动故障转移。

#### 配置

```conf
# sentinel.conf
port 26379

sentinel monitor mymaster 127.0.0.1 6379 2
sentinel down-after-milliseconds mymaster 5000
sentinel failover-timeout mymaster 10000
```

#### 启动哨兵

```bash
redis-sentinel sentinel.conf
```

### 集群（Cluster）

Redis 集群提供数据分片和自动故障转移。

#### 配置

```conf
# redis.conf
cluster-enabled yes
cluster-config-file nodes.conf
cluster-node-timeout 15000
```

#### 创建集群

```bash
redis-cli --cluster create \
  127.0.0.1:7000 127.0.0.1:7001 127.0.0.1:7002 \
  127.0.0.1:7003 127.0.0.1:7004 127.0.0.1:7005 \
  --cluster-replicas 1
```

---

## 配置管理

### 查看配置

```redis
# 查看所有配置
CONFIG GET *

# 查看指定配置
CONFIG GET maxmemory
```

### 设置配置

```redis
# 设置配置
CONFIG SET maxmemory 256mb

# 重写配置文件
CONFIG REWRITE
```

### 常用配置项

```conf
# 网络
bind 0.0.0.0
port 6379
timeout 0
tcp-keepalive 300

# 内存
maxmemory 256mb
maxmemory-policy allkeys-lru

# 持久化
save 900 1
appendonly yes
appendfsync everysec

# 日志
loglevel notice
logfile ""

# 数据库
databases 16
```

---

## 最佳实践

### 键命名规范

- 使用冒号分隔层级：`user:1001:profile`
- 使用有意义的名称：`session:user:1001`
- 避免过长的键名
- 统一命名风格

### 过期时间设置

```redis
# 设置过期时间
EXPIRE key 3600

# 在设置值时同时设置过期时间
SETEX key 3600 value
```

### 管道（Pipeline）

批量执行命令，减少网络往返。

```python
# Python 示例
import redis

r = redis.Redis(host='localhost', port=6379)

pipe = r.pipeline()
pipe.set('key1', 'value1')
pipe.set('key2', 'value2')
pipe.get('key1')
results = pipe.execute()
```

### 事务（Transaction）

```redis
# 开始事务
MULTI

# 执行命令
SET key1 value1
SET key2 value2
INCR counter

# 提交事务
EXEC

# 取消事务
DISCARD
```

### 发布订阅

```redis
# 发布消息
PUBLISH channel message

# 订阅频道
SUBSCRIBE channel [channel ...]

# 取消订阅
UNSUBSCRIBE [channel [channel ...]]

# 模式订阅
PSUBSCRIBE pattern [pattern ...]
```

### 分布式锁

```redis
# 获取锁（SET NX EX）
SET lock_key lock_value NX EX 10

# 释放锁（Lua 脚本）
EVAL "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end" 1 lock_key lock_value
```

### 性能优化

- **合理使用数据结构**：根据场景选择合适的数据类型
- **避免大键**：单个键的值不要过大
- **使用批量操作**：MSET、MGET、Pipeline
- **设置合理的过期时间**：避免内存泄漏
- **使用连接池**：减少连接开销
- **监控内存使用**：设置 maxmemory 和淘汰策略

### 内存管理

```conf
# 设置最大内存
maxmemory 256mb

# 内存淘汰策略
maxmemory-policy allkeys-lru  # 所有键使用 LRU
maxmemory-policy volatile-lru  # 仅过期键使用 LRU
maxmemory-policy allkeys-lfu   # 所有键使用 LFU
maxmemory-policy volatile-lfu  # 仅过期键使用 LFU
maxmemory-policy noeviction    # 不淘汰，返回错误
```

---

##  学习资源

- [Redis 官方文档](https://redis.io/docs/)
- [Redis 命令参考](https://redis.io/commands/)
- [Redis 数据类型](https://redis.io/docs/data-types/)

---

## 💡 常用命令速查

```redis
# 字符串
SET key value
GET key
INCR key
APPEND key value

# 列表
LPUSH key value
RPUSH key value
LPOP key
RPOP key
LRANGE key 0 -1

# 集合
SADD key member
SMEMBERS key
SINTER key1 key2
SUNION key1 key2

# 有序集合
ZADD key score member
ZRANGE key 0 -1 WITHSCORES
ZRANK key member

# 哈希
HSET key field value
HGET key field
HGETALL key

# 键操作
DEL key
EXISTS key
EXPIRE key seconds
TTL key
TYPE key

# 数据库
SELECT 0
FLUSHDB
DBSIZE
INFO
```

---

## 🔧 故障排查

### 查看连接信息

```redis
CLIENT LIST
CLIENT INFO
```

### 查看慢查询

```redis
# 设置慢查询阈值（微秒）
CONFIG SET slowlog-log-slower-than 10000

# 查看慢查询日志
SLOWLOG GET [count]

# 查看慢查询数量
SLOWLOG LEN

# 清空慢查询日志
SLOWLOG RESET
```

### 监控命令

```redis
# 实时监控命令
MONITOR

# 查看统计信息
INFO stats

# 查看内存信息
INFO memory

# 查看复制信息
INFO replication
```

### 性能测试

```bash
# 基准测试
redis-benchmark -h localhost -p 6379 -c 100 -n 100000
```
