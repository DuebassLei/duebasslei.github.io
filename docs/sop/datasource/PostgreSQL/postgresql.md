---
title: PostgreSQL实用操作笔记🐘
description: PostgreSQL基础核心知识及常用操作整理
tag:
  - PostgreSQL
  - 数据库
  - 关系型数据库
sidebar: true
outline: [2,3,4]
lastUpdated: true
---

# PostgreSQL基础核心知识笔记

## 📖 目录

- [PostgreSQL 基础概念](#postgresql-基础概念)
- [安装与启动](#安装与启动)
- [数据类型](#数据类型)
- [DDL 操作](#ddl-操作)
- [DML 操作](#dml-操作)
- [查询操作](#查询操作)
- [索引](#索引)
- [约束](#约束)
- [视图](#视图)
- [函数和存储过程](#函数和存储过程)
- [触发器](#触发器)
- [事务管理](#事务管理)
- [备份与恢复](#备份与恢复)
- [性能优化](#性能优化)
- [常用实用方法](#常用实用方法)
- [最佳实践](#最佳实践)
- [故障排查](#故障排查)
- [学习资源](#学习资源)

---

## PostgreSQL 基础概念

### 什么是 PostgreSQL？

PostgreSQL 是一个功能强大的开源对象关系数据库系统，具有超过 30 年的活跃开发历史，以其可靠性、功能健壮性和性能而闻名。

### 核心特性

- **ACID 兼容**：完全支持事务的 ACID 特性
- **标准 SQL 支持**：支持 SQL 标准的大部分特性
- **丰富的数据类型**：支持 JSON、数组、UUID、几何类型等
- **扩展性**：支持自定义函数、数据类型、操作符等
- **并发控制**：多版本并发控制（MVCC）
- **高可用性**：支持主从复制、流复制、逻辑复制
- **全文搜索**：内置全文搜索功能
- **PostGIS**：支持地理空间数据

### 应用场景

- **Web 应用**：作为 Web 应用的后端数据库
- **数据仓库**：用于数据分析和报表
- **地理信息系统**：结合 PostGIS 处理地理空间数据
- **内容管理**：支持复杂的内容管理系统
- **科学计算**：支持复杂的数据类型和计算

---

## 安装与启动

### 安装

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# CentOS/RHEL
sudo yum install postgresql-server postgresql-contrib

# macOS (Homebrew)
brew install postgresql

# Docker
docker pull postgres:16
docker run --name postgres -e POSTGRES_PASSWORD=password -d -p 5432:5432 postgres:16
```

### 启动服务

```bash
# Linux (systemd)
sudo systemctl start postgresql
sudo systemctl enable postgresql
sudo systemctl status postgresql

# macOS
brew services start postgresql

# 直接启动
postgres -D /usr/local/var/postgres
```

### 连接数据库

```bash
# 使用 psql 连接
psql -U postgres -d postgres

# 连接远程数据库
psql -h hostname -p 5432 -U username -d database

# 使用连接字符串
psql "postgresql://username:password@hostname:5432/database"
```

### 基本命令

```sql
-- 查看版本
SELECT version();

-- 查看当前数据库
SELECT current_database();

-- 查看当前用户
SELECT current_user;

-- 列出所有数据库
\l

-- 切换数据库
\c database_name

-- 列出所有表
\dt

-- 列出所有模式
\dn

-- 查看表结构
\d table_name

-- 查看表详细信息
\d+ table_name

-- 退出
\q
```

---

## 数据类型

### 数值类型

```sql
-- 整数类型
SMALLINT      -- 2 字节，-32768 到 32767
INTEGER       -- 4 字节，-2147483648 到 2147483647
BIGINT        -- 8 字节，-9223372036854775808 到 9223372036854775807

-- 浮点数类型
REAL          -- 4 字节，6 位十进制数字精度
DOUBLE PRECISION  -- 8 字节，15 位十进制数字精度

-- 精确数值类型
NUMERIC(precision, scale)  -- 可变精度，精确数值
DECIMAL(precision, scale)  -- NUMERIC 的别名

-- 示例
CREATE TABLE numbers (
    id INTEGER,
    price NUMERIC(10, 2),
    ratio REAL
);
```

### 字符串类型

```sql
-- 固定长度
CHAR(n)       -- 固定长度，不足补空格
CHARACTER(n)  -- CHAR 的别名

-- 可变长度
VARCHAR(n)     -- 可变长度，最大 n 字符
CHARACTER VARYING(n)  -- VARCHAR 的别名
TEXT           -- 无限长度

-- 示例
CREATE TABLE users (
    id INTEGER,
    username VARCHAR(50),
    email VARCHAR(255),
    bio TEXT
);
```

### 日期时间类型

```sql
-- 日期时间类型
DATE          -- 日期（年月日）
TIME          -- 时间（时分秒）
TIMESTAMP     -- 日期和时间（无时区）
TIMESTAMPTZ   -- 日期和时间（带时区）
INTERVAL      -- 时间间隔

-- 示例
CREATE TABLE events (
    id INTEGER,
    event_date DATE,
    event_time TIME,
    created_at TIMESTAMP,
    updated_at TIMESTAMPTZ
);

-- 插入日期时间
INSERT INTO events (event_date, event_time, created_at)
VALUES ('2024-01-15', '14:30:00', '2024-01-15 14:30:00');
```

### 布尔类型

```sql
-- 布尔类型
BOOLEAN       -- true, false, NULL

-- 示例
CREATE TABLE tasks (
    id INTEGER,
    title VARCHAR(255),
    completed BOOLEAN DEFAULT FALSE
);
```

### JSON 类型

```sql
-- JSON 类型
JSON          -- 存储 JSON 数据（文本格式）
JSONB         -- 存储 JSON 数据（二进制格式，支持索引）

-- 示例
CREATE TABLE products (
    id INTEGER,
    name VARCHAR(255),
    attributes JSONB
);

-- 插入 JSON 数据
INSERT INTO products (name, attributes)
VALUES ('Laptop', '{"brand": "Dell", "price": 999, "specs": {"cpu": "Intel i7", "ram": "16GB"}}'::jsonb);

-- 查询 JSON 数据
SELECT name, attributes->>'brand' AS brand, attributes->'specs'->>'cpu' AS cpu
FROM products;

-- JSON 操作符
SELECT attributes->'price' AS price,           -- 获取 JSON 对象字段（返回 JSON）
       attributes->>'brand' AS brand,          -- 获取 JSON 对象字段（返回文本）
       attributes#>'{specs,cpu}' AS cpu,      -- 路径查询（返回 JSON）
       attributes#>>'{specs,ram}' AS ram       -- 路径查询（返回文本）
FROM products;
```

### 数组类型

```sql
-- 数组类型
INTEGER[]     -- 整数数组
TEXT[]        -- 文本数组
VARCHAR(50)[] -- 可变长度字符串数组

-- 示例
CREATE TABLE posts (
    id INTEGER,
    title VARCHAR(255),
    tags TEXT[],
    ratings INTEGER[]
);

-- 插入数组数据
INSERT INTO posts (title, tags, ratings)
VALUES ('PostgreSQL Guide', ARRAY['database', 'sql', 'postgresql'], ARRAY[5, 4, 5]);

-- 查询数组
SELECT title, tags[1] AS first_tag, array_length(tags, 1) AS tag_count
FROM posts;

-- 数组操作
SELECT title, unnest(tags) AS tag FROM posts;  -- 展开数组
SELECT * FROM posts WHERE 'sql' = ANY(tags);   -- 检查数组是否包含元素
```

### UUID 类型

```sql
-- UUID 类型（需要启用扩展）
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 示例
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50),
    email VARCHAR(255)
);

-- 生成 UUID
SELECT uuid_generate_v4();

-- 从字符串创建 UUID
SELECT 'a43f5f1e-6e0f-4e0d-8b1a-0c1d2e3f4a5b'::uuid;
```

### 其他类型

```sql
-- 二进制数据
BYTEA         -- 二进制数据（字节数组）

-- 网络地址类型
INET          -- IPv4 或 IPv6 地址
CIDR          -- 网络地址
MACADDR       -- MAC 地址

-- 几何类型（需要 PostGIS 扩展）
POINT         -- 点
LINE          -- 线
POLYGON       -- 多边形
```

---

## DDL 操作

### 创建数据库

```sql
-- 创建数据库
CREATE DATABASE mydb;

-- 创建数据库（指定参数）
CREATE DATABASE mydb
    WITH OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TEMPLATE = template0;

-- 删除数据库
DROP DATABASE mydb;
```

### 创建表

```sql
-- 基本创建表
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 从查询结果创建表
CREATE TABLE users_backup AS
SELECT * FROM users WHERE created_at < '2024-01-01';

-- 创建表（如果不存在）
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price NUMERIC(10, 2)
);
```

### 修改表

```sql
-- 添加列
ALTER TABLE users ADD COLUMN phone VARCHAR(20);

-- 删除列
ALTER TABLE users DROP COLUMN phone;

-- 修改列类型
ALTER TABLE users ALTER COLUMN email TYPE VARCHAR(100);

-- 重命名列
ALTER TABLE users RENAME COLUMN email TO email_address;

-- 添加约束
ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);

-- 删除约束
ALTER TABLE users DROP CONSTRAINT users_email_unique;

-- 重命名表
ALTER TABLE users RENAME TO customers;
```

### 删除表

```sql
-- 删除表
DROP TABLE users;

-- 删除表（如果存在）
DROP TABLE IF EXISTS users;

-- 清空表数据
TRUNCATE TABLE users;

-- 清空表数据（级联）
TRUNCATE TABLE users CASCADE;
```

### 模式（Schema）

```sql
-- 创建模式
CREATE SCHEMA myschema;

-- 在模式中创建表
CREATE TABLE myschema.products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255)
);

-- 设置搜索路径
SET search_path TO myschema, public;

-- 删除模式
DROP SCHEMA myschema;

-- 删除模式（级联）
DROP SCHEMA myschema CASCADE;
```

---

## DML 操作

### INSERT

```sql
-- 插入单行
INSERT INTO users (username, email) VALUES ('john', 'john@example.com');

-- 插入多行
INSERT INTO users (username, email) VALUES
    ('alice', 'alice@example.com'),
    ('bob', 'bob@example.com'),
    ('charlie', 'charlie@example.com');

-- 从查询插入
INSERT INTO users_backup (username, email)
SELECT username, email FROM users WHERE created_at < '2024-01-01';

-- 插入并返回
INSERT INTO users (username, email)
VALUES ('david', 'david@example.com')
RETURNING id, username, email;

-- 使用 ON CONFLICT 处理冲突
INSERT INTO users (username, email)
VALUES ('john', 'john@example.com')
ON CONFLICT (username) DO UPDATE
SET email = EXCLUDED.email;
```

### UPDATE

```sql
-- 更新单行
UPDATE users SET email = 'newemail@example.com' WHERE id = 1;

-- 更新多列
UPDATE users
SET email = 'newemail@example.com', updated_at = CURRENT_TIMESTAMP
WHERE id = 1;

-- 使用子查询更新
UPDATE users
SET email = (SELECT email FROM users_backup WHERE users_backup.id = users.id)
WHERE EXISTS (SELECT 1 FROM users_backup WHERE users_backup.id = users.id);

-- 更新并返回
UPDATE users
SET email = 'newemail@example.com'
WHERE id = 1
RETURNING id, username, email;
```

### DELETE

```sql
-- 删除行
DELETE FROM users WHERE id = 1;

-- 删除所有行
DELETE FROM users;

-- 使用子查询删除
DELETE FROM users
WHERE id IN (SELECT id FROM users_backup WHERE created_at < '2020-01-01');

-- 删除并返回
DELETE FROM users
WHERE id = 1
RETURNING id, username, email;
```

---

## 查询操作

### SELECT 基础

```sql
-- 基本查询
SELECT * FROM users;

-- 选择特定列
SELECT id, username, email FROM users;

-- 使用别名
SELECT id, username AS name, email FROM users;

-- 去重
SELECT DISTINCT email FROM users;

-- 限制结果数量
SELECT * FROM users LIMIT 10;

-- 跳过行
SELECT * FROM users OFFSET 10;

-- 限制和跳过
SELECT * FROM users LIMIT 10 OFFSET 20;
```

### WHERE 条件

```sql
-- 基本条件
SELECT * FROM users WHERE id = 1;
SELECT * FROM users WHERE username = 'john';
SELECT * FROM users WHERE created_at > '2024-01-01';

-- 多个条件
SELECT * FROM users WHERE id > 10 AND email LIKE '%@example.com';
SELECT * FROM users WHERE id < 5 OR username = 'admin';

-- IN 操作符
SELECT * FROM users WHERE id IN (1, 2, 3, 4, 5);

-- NOT IN
SELECT * FROM users WHERE id NOT IN (1, 2, 3);

-- BETWEEN
SELECT * FROM users WHERE id BETWEEN 1 AND 100;

-- LIKE 和 ILIKE
SELECT * FROM users WHERE username LIKE 'j%';      -- 区分大小写
SELECT * FROM users WHERE username ILIKE 'j%';     -- 不区分大小写

-- IS NULL 和 IS NOT NULL
SELECT * FROM users WHERE email IS NULL;
SELECT * FROM users WHERE email IS NOT NULL;
```

### 排序

```sql
-- 升序排序
SELECT * FROM users ORDER BY created_at ASC;

-- 降序排序
SELECT * FROM users ORDER BY created_at DESC;

-- 多列排序
SELECT * FROM users ORDER BY created_at DESC, username ASC;

-- NULL 值处理
SELECT * FROM users ORDER BY email NULLS LAST;
SELECT * FROM users ORDER BY email NULLS FIRST;
```

### 聚合函数

```sql
-- 计数
SELECT COUNT(*) FROM users;
SELECT COUNT(DISTINCT email) FROM users;

-- 求和、平均值、最大值、最小值
SELECT SUM(price) FROM products;
SELECT AVG(price) FROM products;
SELECT MAX(price) FROM products;
SELECT MIN(price) FROM products;

-- GROUP BY
SELECT category, COUNT(*) AS count, AVG(price) AS avg_price
FROM products
GROUP BY category;

-- HAVING
SELECT category, COUNT(*) AS count
FROM products
GROUP BY category
HAVING COUNT(*) > 10;
```

### JOIN

```sql
-- INNER JOIN
SELECT u.username, o.order_id, o.total
FROM users u
INNER JOIN orders o ON u.id = o.user_id;

-- LEFT JOIN
SELECT u.username, o.order_id, o.total
FROM users u
LEFT JOIN orders o ON u.id = o.user_id;

-- RIGHT JOIN
SELECT u.username, o.order_id, o.total
FROM users u
RIGHT JOIN orders o ON u.id = o.user_id;

-- FULL OUTER JOIN
SELECT u.username, o.order_id, o.total
FROM users u
FULL OUTER JOIN orders o ON u.id = o.user_id;

-- 多表 JOIN
SELECT u.username, o.order_id, p.product_name, oi.quantity
FROM users u
INNER JOIN orders o ON u.id = o.user_id
INNER JOIN order_items oi ON o.id = oi.order_id
INNER JOIN products p ON oi.product_id = p.id;
```

### 子查询

```sql
-- 标量子查询
SELECT username, (SELECT COUNT(*) FROM orders WHERE orders.user_id = users.id) AS order_count
FROM users;

-- EXISTS
SELECT * FROM users
WHERE EXISTS (SELECT 1 FROM orders WHERE orders.user_id = users.id);

-- NOT EXISTS
SELECT * FROM users
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE orders.user_id = users.id);

-- IN 子查询
SELECT * FROM users
WHERE id IN (SELECT user_id FROM orders WHERE total > 1000);

-- 相关子查询
SELECT u.username, (
    SELECT MAX(total) FROM orders WHERE user_id = u.id
) AS max_order_total
FROM users u;
```

### 窗口函数

```sql
-- ROW_NUMBER
SELECT username, email,
    ROW_NUMBER() OVER (ORDER BY created_at) AS row_num
FROM users;

-- RANK 和 DENSE_RANK
SELECT username, total,
    RANK() OVER (ORDER BY total DESC) AS rank,
    DENSE_RANK() OVER (ORDER BY total DESC) AS dense_rank
FROM (
    SELECT u.username, SUM(o.total) AS total
    FROM users u
    JOIN orders o ON u.id = o.user_id
    GROUP BY u.id, u.username
) AS user_totals;

-- 分区窗口函数
SELECT username, category, price,
    ROW_NUMBER() OVER (PARTITION BY category ORDER BY price DESC) AS rank_in_category
FROM products;

-- 累计聚合
SELECT date, revenue,
    SUM(revenue) OVER (ORDER BY date) AS cumulative_revenue
FROM daily_sales;
```

---

## 索引

### 创建索引

```sql
-- B-Tree 索引（默认）
CREATE INDEX idx_users_email ON users(email);

-- 唯一索引
CREATE UNIQUE INDEX idx_users_username ON users(username);

-- 复合索引
CREATE INDEX idx_orders_user_date ON orders(user_id, order_date);

-- 部分索引
CREATE INDEX idx_active_users ON users(email) WHERE active = true;

-- 表达式索引
CREATE INDEX idx_users_lower_email ON users(LOWER(email));

-- 降序索引
CREATE INDEX idx_orders_date_desc ON orders(order_date DESC);
```

### 索引类型

```sql
-- B-Tree（默认，适用于大多数情况）
CREATE INDEX idx_btree ON table_name(column_name);

-- Hash（仅支持等值查询）
CREATE INDEX idx_hash ON table_name USING HASH(column_name);

-- GiST（通用搜索树，适用于几何、全文搜索等）
CREATE INDEX idx_gist ON table_name USING GIST(column_name);

-- GIN（通用倒排索引，适用于数组、JSONB、全文搜索）
CREATE INDEX idx_gin ON table_name USING GIN(column_name);

-- BRIN（块范围索引，适用于有序数据）
CREATE INDEX idx_brin ON table_name USING BRIN(column_name);
```

### 管理索引

```sql
-- 查看索引
SELECT * FROM pg_indexes WHERE tablename = 'users';

-- 重建索引
REINDEX INDEX idx_users_email;

-- 重建表的所有索引
REINDEX TABLE users;

-- 删除索引
DROP INDEX idx_users_email;

-- 分析索引使用情况
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan;
```

---

## 约束

### 主键约束

```sql
-- 创建表时定义主键
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50)
);

-- 添加主键约束
ALTER TABLE users ADD PRIMARY KEY (id);

-- 复合主键
CREATE TABLE order_items (
    order_id INTEGER,
    product_id INTEGER,
    quantity INTEGER,
    PRIMARY KEY (order_id, product_id)
);
```

### 外键约束

```sql
-- 创建表时定义外键
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    total NUMERIC(10, 2)
);

-- 添加外键约束
ALTER TABLE orders
ADD CONSTRAINT fk_orders_user
FOREIGN KEY (user_id) REFERENCES users(id);

-- 级联删除
ALTER TABLE orders
ADD CONSTRAINT fk_orders_user
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- 级联更新
ALTER TABLE orders
ADD CONSTRAINT fk_orders_user
FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE;
```

### 唯一约束

```sql
-- 创建表时定义唯一约束
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE
);

-- 添加唯一约束
ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);

-- 复合唯一约束
CREATE TABLE user_roles (
    user_id INTEGER,
    role_id INTEGER,
    UNIQUE (user_id, role_id)
);
```

### 检查约束

```sql
-- 创建表时定义检查约束
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    price NUMERIC(10, 2) CHECK (price > 0),
    stock INTEGER CHECK (stock >= 0)
);

-- 添加检查约束
ALTER TABLE products
ADD CONSTRAINT products_price_positive CHECK (price > 0);
```

### 非空约束

```sql
-- 创建表时定义非空约束
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL
);

-- 添加非空约束
ALTER TABLE users ALTER COLUMN email SET NOT NULL;

-- 移除非空约束
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;
```

### 默认值

```sql
-- 创建表时定义默认值
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    active BOOLEAN DEFAULT TRUE
);

-- 添加默认值
ALTER TABLE users ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;

-- 移除默认值
ALTER TABLE users ALTER COLUMN created_at DROP DEFAULT;
```

---

## 视图

### 创建视图

```sql
-- 基本视图
CREATE VIEW active_users AS
SELECT id, username, email
FROM users
WHERE active = TRUE;

-- 可更新视图
CREATE VIEW user_orders AS
SELECT u.id AS user_id, u.username, o.id AS order_id, o.total
FROM users u
JOIN orders o ON u.id = o.user_id;

-- 物化视图
CREATE MATERIALIZED VIEW monthly_sales AS
SELECT DATE_TRUNC('month', order_date) AS month,
       SUM(total) AS total_sales,
       COUNT(*) AS order_count
FROM orders
GROUP BY DATE_TRUNC('month', order_date);

-- 刷新物化视图
REFRESH MATERIALIZED VIEW monthly_sales;

-- 并发刷新（不阻塞查询）
REFRESH MATERIALIZED VIEW CONCURRENTLY monthly_sales;
```

### 管理视图

```sql
-- 查看视图定义
SELECT definition FROM pg_views WHERE viewname = 'active_users';

-- 删除视图
DROP VIEW active_users;

-- 删除物化视图
DROP MATERIALIZED VIEW monthly_sales;
```

---

## 函数和存储过程

### 创建函数

```sql
-- 基本函数
CREATE OR REPLACE FUNCTION get_user_count()
RETURNS INTEGER AS $$
BEGIN
    RETURN (SELECT COUNT(*) FROM users);
END;
$$ LANGUAGE plpgsql;

-- 调用函数
SELECT get_user_count();

-- 带参数的函数
CREATE OR REPLACE FUNCTION get_user_by_id(user_id INTEGER)
RETURNS TABLE(id INTEGER, username VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY
    SELECT users.id, users.username, users.email
    FROM users
    WHERE users.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- 调用带参数的函数
SELECT * FROM get_user_by_id(1);
```

### 函数示例

```sql
-- 计算订单总金额
CREATE OR REPLACE FUNCTION calculate_order_total(order_id INTEGER)
RETURNS NUMERIC(10, 2) AS $$
DECLARE
    total_amount NUMERIC(10, 2);
BEGIN
    SELECT SUM(quantity * price) INTO total_amount
    FROM order_items
    WHERE order_id = calculate_order_total.order_id;
    
    RETURN COALESCE(total_amount, 0);
END;
$$ LANGUAGE plpgsql;

-- 更新用户最后登录时间
CREATE OR REPLACE FUNCTION update_last_login(user_id INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE users
    SET last_login = CURRENT_TIMESTAMP
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;
```

### 存储过程（PostgreSQL 11+）

```sql
-- 创建存储过程
CREATE OR REPLACE PROCEDURE transfer_funds(
    from_account INTEGER,
    to_account INTEGER,
    amount NUMERIC(10, 2)
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- 扣除源账户
    UPDATE accounts
    SET balance = balance - amount
    WHERE id = from_account;
    
    -- 增加目标账户
    UPDATE accounts
    SET balance = balance + amount
    WHERE id = to_account;
    
    -- 记录交易
    INSERT INTO transactions (from_account, to_account, amount, created_at)
    VALUES (from_account, to_account, amount, CURRENT_TIMESTAMP);
    
    COMMIT;
END;
$$;

-- 调用存储过程
CALL transfer_funds(1, 2, 100.00);
```

---

## 触发器

### 创建触发器函数

```sql
-- 自动更新时间戳的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### 触发器示例

```sql
-- 审计日志触发器
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (table_name, operation, new_data, changed_at)
        VALUES (TG_TABLE_NAME, 'INSERT', row_to_json(NEW), CURRENT_TIMESTAMP);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (table_name, operation, old_data, new_data, changed_at)
        VALUES (TG_TABLE_NAME, 'UPDATE', row_to_json(OLD), row_to_json(NEW), CURRENT_TIMESTAMP);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (table_name, operation, old_data, changed_at)
        VALUES (TG_TABLE_NAME, 'DELETE', row_to_json(OLD), CURRENT_TIMESTAMP);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 创建审计日志表
CREATE TABLE audit_log (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(255),
    operation VARCHAR(10),
    old_data JSONB,
    new_data JSONB,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 在表上创建触发器
CREATE TRIGGER users_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW
    EXECUTE FUNCTION audit_trigger();
```

### 管理触发器

```sql
-- 查看触发器
SELECT * FROM pg_trigger WHERE tgname = 'update_users_updated_at';

-- 禁用触发器
ALTER TABLE users DISABLE TRIGGER update_users_updated_at;

-- 启用触发器
ALTER TABLE users ENABLE TRIGGER update_users_updated_at;

-- 删除触发器
DROP TRIGGER update_users_updated_at ON users;
```

---

## 事务管理

### 基本事务

```sql
-- 开始事务
BEGIN;

-- 执行操作
INSERT INTO users (username, email) VALUES ('john', 'john@example.com');
UPDATE users SET email = 'newemail@example.com' WHERE id = 1;

-- 提交事务
COMMIT;

-- 回滚事务
ROLLBACK;
```

### 保存点

```sql
BEGIN;

INSERT INTO users (username, email) VALUES ('alice', 'alice@example.com');

-- 创建保存点
SAVEPOINT sp1;

INSERT INTO users (username, email) VALUES ('bob', 'bob@example.com');

-- 回滚到保存点
ROLLBACK TO SAVEPOINT sp1;

-- 提交事务
COMMIT;
```

### 事务隔离级别

```sql
-- 设置事务隔离级别
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

-- 在事务中设置
BEGIN;
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
-- ... 执行操作 ...
COMMIT;
```

---

## 备份与恢复

### pg_dump

```bash
# 备份单个数据库
pg_dump -U postgres -d mydb > mydb_backup.sql

# 备份为自定义格式（可压缩）
pg_dump -U postgres -d mydb -F c -f mydb_backup.dump

# 备份为目录格式（并行备份）
pg_dump -U postgres -d mydb -F d -f mydb_backup_dir -j 4

# 只备份结构
pg_dump -U postgres -d mydb --schema-only > schema.sql

# 只备份数据
pg_dump -U postgres -d mydb --data-only > data.sql

# 备份特定表
pg_dump -U postgres -d mydb -t users -t orders > tables_backup.sql
```

### pg_dumpall

```bash
# 备份所有数据库
pg_dumpall -U postgres > all_databases_backup.sql

# 只备份全局对象（用户、角色等）
pg_dumpall -U postgres --globals-only > globals_backup.sql
```

### pg_restore

```bash
# 从自定义格式恢复
pg_restore -U postgres -d mydb mydb_backup.dump

# 从目录格式恢复
pg_restore -U postgres -d mydb -j 4 mydb_backup_dir

# 只恢复结构
pg_restore -U postgres -d mydb --schema-only mydb_backup.dump

# 只恢复数据
pg_restore -U postgres -d mydb --data-only mydb_backup.dump
```

### psql 恢复

```bash
# 从 SQL 文件恢复
psql -U postgres -d mydb < mydb_backup.sql

# 从压缩文件恢复
gunzip -c mydb_backup.sql.gz | psql -U postgres -d mydb
```

### 在线备份

```sql
-- 开始备份
SELECT pg_start_backup('backup_label');

-- 执行文件系统备份
-- ... 复制数据目录 ...

-- 结束备份
SELECT pg_stop_backup();
```

---

## 性能优化

### EXPLAIN 分析

```sql
-- 基本 EXPLAIN
EXPLAIN SELECT * FROM users WHERE email = 'john@example.com';

-- EXPLAIN ANALYZE（实际执行）
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'john@example.com';

-- 详细输出
EXPLAIN (ANALYZE, BUFFERS, VERBOSE) SELECT * FROM users WHERE email = 'john@example.com';
```

### 统计信息

```sql
-- 更新表统计信息
ANALYZE users;

-- 更新所有表统计信息
ANALYZE;

-- 查看表统计信息
SELECT schemaname, tablename, n_live_tup, n_dead_tup, last_vacuum, last_autovacuum
FROM pg_stat_user_tables
WHERE tablename = 'users';
```

### VACUUM

```sql
-- 基本 VACUUM
VACUUM users;

-- VACUUM ANALYZE
VACUUM ANALYZE users;

-- 完整 VACUUM（锁定表）
VACUUM FULL users;

-- 自动 VACUUM 配置
ALTER TABLE users SET (autovacuum_vacuum_scale_factor = 0.1);
ALTER TABLE users SET (autovacuum_analyze_scale_factor = 0.05);
```

### 查询优化技巧

```sql
-- 使用索引
CREATE INDEX idx_users_email ON users(email);

-- 避免 SELECT *
SELECT id, username, email FROM users;  -- 而不是 SELECT *

-- 使用 LIMIT
SELECT * FROM users ORDER BY created_at DESC LIMIT 10;

-- 使用 EXISTS 而不是 COUNT
SELECT * FROM users u
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);

-- 避免在 WHERE 子句中使用函数
-- 不好：WHERE LOWER(email) = 'john@example.com'
-- 好：WHERE email = 'JOHN@EXAMPLE.COM' 或使用表达式索引
```

---

## 常用实用方法

### 字符串函数

```sql
-- 连接字符串
SELECT CONCAT('Hello', ' ', 'World');  -- 'Hello World'
SELECT 'Hello' || ' ' || 'World';      -- 'Hello World'

-- 字符串长度
SELECT LENGTH('Hello');                 -- 5
SELECT CHAR_LENGTH('Hello');           -- 5

-- 大小写转换
SELECT UPPER('hello');                  -- 'HELLO'
SELECT LOWER('HELLO');                  -- 'hello'
SELECT INITCAP('hello world');          -- 'Hello World'

-- 子字符串
SELECT SUBSTRING('Hello World', 1, 5);  -- 'Hello'
SELECT SUBSTRING('Hello World' FROM 7); -- 'World'

-- 替换
SELECT REPLACE('Hello World', 'World', 'PostgreSQL');  -- 'Hello PostgreSQL'

-- 去除空格
SELECT TRIM('  Hello  ');               -- 'Hello'
SELECT LTRIM('  Hello');               -- 'Hello'
SELECT RTRIM('Hello  ');               -- 'Hello'

-- 分割字符串
SELECT UNNEST(STRING_TO_ARRAY('a,b,c', ','));  -- 返回多行：a, b, c
```

### 日期时间函数

```sql
-- 当前日期时间
SELECT CURRENT_DATE;                    -- 当前日期
SELECT CURRENT_TIME;                   -- 当前时间
SELECT CURRENT_TIMESTAMP;               -- 当前时间戳
SELECT NOW();                           -- 当前时间戳

-- 提取日期部分
SELECT EXTRACT(YEAR FROM CURRENT_TIMESTAMP);
SELECT EXTRACT(MONTH FROM CURRENT_TIMESTAMP);
SELECT EXTRACT(DAY FROM CURRENT_TIMESTAMP);
SELECT EXTRACT(HOUR FROM CURRENT_TIMESTAMP);

-- 日期运算
SELECT CURRENT_DATE + INTERVAL '1 day';   -- 明天
SELECT CURRENT_DATE - INTERVAL '1 week'; -- 一周前
SELECT CURRENT_TIMESTAMP + INTERVAL '1 hour'; -- 一小时后

-- 日期格式化
SELECT TO_CHAR(CURRENT_TIMESTAMP, 'YYYY-MM-DD HH24:MI:SS');
SELECT TO_DATE('2024-01-15', 'YYYY-MM-DD');

-- 日期截断
SELECT DATE_TRUNC('month', CURRENT_TIMESTAMP);  -- 月初
SELECT DATE_TRUNC('year', CURRENT_TIMESTAMP);   -- 年初
```

### 数值函数

```sql
-- 四舍五入
SELECT ROUND(123.456, 2);              -- 123.46
SELECT ROUND(123.456);                  -- 123

-- 向上取整
SELECT CEIL(123.456);                   -- 124

-- 向下取整
SELECT FLOOR(123.456);                  -- 123

-- 绝对值
SELECT ABS(-123);                       -- 123

-- 随机数
SELECT RANDOM();                        -- 0 到 1 之间的随机数
SELECT FLOOR(RANDOM() * 100)::INTEGER;  -- 0 到 99 的随机整数

-- 最大值和最小值
SELECT GREATEST(1, 2, 3, 4, 5);        -- 5
SELECT LEAST(1, 2, 3, 4, 5);           -- 1
```

### JSON 函数

```sql
-- 构建 JSON
SELECT JSON_BUILD_OBJECT('name', 'John', 'age', 30);
SELECT JSON_BUILD_ARRAY(1, 2, 3, 'four');

-- JSON 类型检查
SELECT JSON_TYPEOF('{"name": "John"}'::json);  -- 'object'
SELECT JSON_TYPEOF('[1, 2, 3]'::json);         -- 'array'

-- JSON 路径查询
SELECT JSONB_PATH_QUERY('{"user": {"name": "John", "age": 30}}', '$.user.name');

-- JSON 数组展开
SELECT JSONB_ARRAY_ELEMENTS('[1, 2, 3]'::jsonb);

-- JSON 对象键
SELECT JSONB_OBJECT_KEYS('{"a": 1, "b": 2}'::jsonb);
```

### 数组函数

```sql
-- 数组长度
SELECT ARRAY_LENGTH(ARRAY[1, 2, 3, 4, 5], 1);  -- 5

-- 数组连接
SELECT ARRAY[1, 2] || ARRAY[3, 4];              -- {1,2,3,4}

-- 数组包含
SELECT ARRAY[1, 2, 3] @> ARRAY[1, 2];           -- true
SELECT ARRAY[1, 2] <@ ARRAY[1, 2, 3];           -- true

-- 数组重叠
SELECT ARRAY[1, 2, 3] && ARRAY[3, 4, 5];        -- true

-- 数组展开
SELECT UNNEST(ARRAY[1, 2, 3, 4, 5]);

-- 数组聚合
SELECT ARRAY_AGG(id ORDER BY id) FROM users;
```

### 系统函数

```sql
-- 数据库信息
SELECT CURRENT_DATABASE();
SELECT CURRENT_USER;
SELECT CURRENT_SCHEMA;
SELECT VERSION();

-- 表信息
SELECT * FROM PG_TABLES WHERE schemaname = 'public';
SELECT * FROM PG_INDEXES WHERE tablename = 'users';

-- 数据库大小
SELECT PG_SIZE_PRETTY(PG_DATABASE_SIZE('mydb'));

-- 表大小
SELECT PG_SIZE_PRETTY(PG_TOTAL_RELATION_SIZE('users'));

-- 连接信息
SELECT * FROM PG_STAT_ACTIVITY;

-- 锁信息
SELECT * FROM PG_LOCKS;
```

### 常用查询模式

```sql
-- 分页查询
SELECT * FROM users
ORDER BY id
LIMIT 10 OFFSET 20;

-- 查找重复记录
SELECT email, COUNT(*) AS count
FROM users
GROUP BY email
HAVING COUNT(*) > 1;

-- 查找缺失的 ID
SELECT generate_series(1, 100) AS missing_id
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE users.id = generate_series(1, 100)
);

-- 随机抽样
SELECT * FROM users
ORDER BY RANDOM()
LIMIT 10;

-- 查找最近 N 天的记录
SELECT * FROM orders
WHERE order_date >= CURRENT_DATE - INTERVAL '7 days';

-- 查找每个分类的最新记录
SELECT DISTINCT ON (category) *
FROM products
ORDER BY category, created_at DESC;
```

---

## 最佳实践

### 数据库设计

1. **合理使用数据类型**：选择合适的数据类型，避免过度使用 TEXT
2. **规范化设计**：遵循数据库规范化原则，避免数据冗余
3. **使用外键约束**：确保数据完整性
4. **合理使用索引**：为经常查询的列创建索引，但不要过度索引
5. **使用序列**：使用 SERIAL 或 BIGSERIAL 作为主键

### 查询优化

1. **使用 EXPLAIN ANALYZE**：分析查询执行计划
2. **避免 SELECT ***：只选择需要的列
3. **使用 LIMIT**：限制结果集大小
4. **合理使用 JOIN**：避免笛卡尔积
5. **使用 EXISTS 而不是 COUNT**：检查存在性时使用 EXISTS

### 索引优化

1. **为 WHERE 子句中的列创建索引**
2. **为 JOIN 条件创建索引**
3. **为 ORDER BY 和 GROUP BY 创建索引**
4. **使用复合索引**：为多列查询创建复合索引
5. **定期分析索引使用情况**：删除未使用的索引

### 维护

1. **定期 VACUUM**：清理死元组
2. **定期 ANALYZE**：更新统计信息
3. **监控数据库大小**：定期检查数据库和表的大小
4. **备份策略**：制定并执行定期备份策略
5. **监控性能**：使用 pg_stat 视图监控数据库性能

---

## 故障排查

### 查看日志

```bash
# 查看 PostgreSQL 日志位置
SHOW log_directory;
SHOW log_filename;

# 查看日志（Linux）
sudo tail -f /var/log/postgresql/postgresql-*.log

# 查看错误日志
sudo grep ERROR /var/log/postgresql/postgresql-*.log
```

### 连接问题

```sql
-- 查看当前连接
SELECT * FROM PG_STAT_ACTIVITY;

-- 查看连接数
SELECT COUNT(*) FROM PG_STAT_ACTIVITY;

-- 终止连接
SELECT PG_TERMINATE_BACKEND(pid) FROM PG_STAT_ACTIVITY WHERE pid <> PG_BACKEND_PID();

-- 查看锁
SELECT * FROM PG_LOCKS;
SELECT * FROM PG_BLOCKING_PIDS(pid);
```

### 性能问题

```sql
-- 查看慢查询
SELECT pid, now() - query_start AS duration, query
FROM PG_STAT_ACTIVITY
WHERE state = 'active' AND now() - query_start > interval '5 seconds';

-- 查看表统计信息
SELECT schemaname, tablename, n_live_tup, n_dead_tup,
       last_vacuum, last_autovacuum, last_analyze, last_autoanalyze
FROM PG_STAT_USER_TABLES
ORDER BY n_dead_tup DESC;

-- 查看索引使用情况
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM PG_STAT_USER_INDEXES
ORDER BY idx_scan;
```

### 空间问题

```sql
-- 查看数据库大小
SELECT datname, PG_SIZE_PRETTY(PG_DATABASE_SIZE(datname)) AS size
FROM PG_DATABASE
ORDER BY PG_DATABASE_SIZE(datname) DESC;

-- 查看表大小
SELECT schemaname, tablename,
       PG_SIZE_PRETTY(PG_TOTAL_RELATION_SIZE(schemaname||'.'||tablename)) AS size
FROM PG_TABLES
WHERE schemaname = 'public'
ORDER BY PG_TOTAL_RELATION_SIZE(schemaname||'.'||tablename) DESC;

-- 查看索引大小
SELECT schemaname, tablename, indexname,
       PG_SIZE_PRETTY(PG_RELATION_SIZE(indexrelid)) AS size
FROM PG_INDEXES
WHERE schemaname = 'public'
ORDER BY PG_RELATION_SIZE(indexrelid) DESC;
```

---

## 学习资源

- [PostgreSQL 官方文档](https://www.postgresql.org/docs/)
- [PostgreSQL 教程](https://www.postgresql.org/docs/current/tutorial.html)
- [PostgreSQL 性能优化指南](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [PostgreSQL Wiki](https://wiki.postgresql.org/)

---

## 💡 常用命令速查

```sql
-- 数据库操作
\l                    -- 列出所有数据库
\c database_name      -- 连接到数据库
CREATE DATABASE db;   -- 创建数据库
DROP DATABASE db;      -- 删除数据库

-- 表操作
\dt                   -- 列出所有表
\d table_name         -- 查看表结构
\d+ table_name        -- 查看表详细信息

-- 查询
SELECT * FROM table;  -- 基本查询
\q                    -- 退出 psql

-- 帮助
\?                   -- 帮助信息
\h COMMAND           -- SQL 命令帮助
```

---

## 🔧 实用脚本

### 备份脚本

```bash
#!/bin/bash
# 备份脚本
BACKUP_DIR="/backup/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="mydb"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库
pg_dump -U postgres -d $DB_NAME -F c -f $BACKUP_DIR/${DB_NAME}_${DATE}.dump

# 删除 7 天前的备份
find $BACKUP_DIR -name "*.dump" -mtime +7 -delete
```

### 监控脚本

```sql
-- 查看数据库统计信息
SELECT 
    datname,
    numbackends AS connections,
    xact_commit AS commits,
    xact_rollback AS rollbacks,
    blks_read AS disk_reads,
    blks_hit AS cache_hits,
    tup_returned AS rows_returned,
    tup_fetched AS rows_fetched,
    tup_inserted AS rows_inserted,
    tup_updated AS rows_updated,
    tup_deleted AS rows_deleted
FROM pg_stat_database
WHERE datname = current_database();
```

