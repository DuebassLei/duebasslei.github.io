---
title: MySQL实用操作笔记🐬
description: MySQL基础核心知识及常用操作整理
tag:
  - MySQL
  - 数据库
  - 关系型数据库
sidebar: true
outline: [2,3,4]
lastUpdated: true
---

# MySQL基础核心知识笔记

## 📖 目录

- [MySQL 基础概念](#mysql-基础概念)
- [安装与启动](#安装与启动)
- [数据类型](#数据类型)
- [DDL 操作](#ddl-操作)
- [DML 操作](#dml-操作)
- [查询操作](#查询操作)
- [索引](#索引)
- [约束](#约束)
- [视图](#视图)
- [存储过程和函数](#存储过程和函数)
- [触发器](#触发器)
- [事务管理](#事务管理)
- [备份与恢复](#备份与恢复)
- [性能优化](#性能优化)
- [常用实用方法](#常用实用方法)
- [最佳实践](#最佳实践)
- [故障排查](#故障排查)
- [学习资源](#学习资源)

---

## MySQL 基础概念

### 什么是 MySQL？

MySQL 是一个开源的关系型数据库管理系统（RDBMS），由 Oracle 公司开发和维护。它是世界上最流行的数据库之一，广泛应用于 Web 应用程序。

### 核心特性

- **开源免费**：遵循 GPL 许可证
- **高性能**：优化的查询引擎和存储引擎
- **可扩展性**：支持大规模数据存储和处理
- **跨平台**：支持 Windows、Linux、macOS 等操作系统
- **多种存储引擎**：InnoDB、MyISAM、Memory 等
- **ACID 兼容**：InnoDB 存储引擎支持完整的事务特性
- **复制和高可用**：支持主从复制、组复制等

### 应用场景

- **Web 应用**：作为 Web 应用的后端数据库
- **内容管理系统**：WordPress、Drupal 等
- **电商平台**：在线商店、订单管理等
- **日志系统**：存储和分析日志数据
- **数据仓库**：用于数据分析和报表

---

## 安装与启动

### 安装

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mysql-server

# CentOS/RHEL
sudo yum install mysql-server
# 或
sudo dnf install mysql-server

# macOS (Homebrew)
brew install mysql

# Windows
# 下载 MySQL Installer 从官网安装

# Docker
docker pull mysql:8.0
docker run --name mysql -e MYSQL_ROOT_PASSWORD=password -d -p 3306:3306 mysql:8.0
```

### 启动服务

```bash
# Linux (systemd)
sudo systemctl start mysql
sudo systemctl enable mysql
sudo systemctl status mysql

# macOS
brew services start mysql

# Windows
# 使用服务管理器启动 MySQL 服务
```

### 连接数据库

```bash
# 使用 mysql 客户端连接
mysql -u root -p

# 连接远程数据库
mysql -h hostname -P 3306 -u username -p

# 使用连接字符串
mysql -u username -p -h hostname database_name

# 指定字符集连接
mysql -u root -p --default-character-set=utf8mb4
```

### 基本命令

```sql
-- 查看版本
SELECT VERSION();

-- 查看当前数据库
SELECT DATABASE();

-- 查看当前用户
SELECT USER();

-- 列出所有数据库
SHOW DATABASES;

-- 切换数据库
USE database_name;

-- 列出所有表
SHOW TABLES;

-- 查看表结构
DESCRIBE table_name;
-- 或
DESC table_name;
-- 或
SHOW COLUMNS FROM table_name;

-- 查看表创建语句
SHOW CREATE TABLE table_name;

-- 退出
EXIT;
-- 或
QUIT;
```

---

## 数据类型

### 数值类型

#### 整数类型

```sql
-- 整数类型
TINYINT       -- 1 字节，-128 到 127（有符号）或 0 到 255（无符号）
SMALLINT      -- 2 字节，-32768 到 32767 或 0 到 65535
MEDIUMINT     -- 3 字节，-8388608 到 8388607 或 0 到 16777215
INT/INTEGER   -- 4 字节，-2147483648 到 2147483647 或 0 到 4294967295
BIGINT        -- 8 字节，-9223372036854775808 到 9223372036854775807

-- 示例
CREATE TABLE numbers (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    age TINYINT UNSIGNED,
    count BIGINT
);
```

#### 浮点数类型

```sql
-- 浮点数类型
FLOAT(M, D)   -- 单精度浮点数，4 字节
DOUBLE(M, D)  -- 双精度浮点数，8 字节
DECIMAL(M, D) -- 精确数值，M 是总位数，D 是小数位数
NUMERIC(M, D) -- DECIMAL 的别名

-- 示例
CREATE TABLE products (
    id INT PRIMARY KEY,
    price DECIMAL(10, 2),
    ratio FLOAT(5, 2)
);
```

### 字符串类型

```sql
-- 固定长度
CHAR(n)       -- 固定长度，最多 255 字符

-- 可变长度
VARCHAR(n)    -- 可变长度，最多 65535 字符（MySQL 5.0.3+）
TEXT          -- 文本类型，最多 65535 字符
TINYTEXT      -- 最多 255 字符
MEDIUMTEXT    -- 最多 16777215 字符
LONGTEXT      -- 最多 4294967295 字符

-- 二进制类型
BINARY(n)     -- 固定长度二进制
VARBINARY(n)  -- 可变长度二进制
BLOB          -- 二进制大对象
TINYBLOB      -- 小二进制对象
MEDIUMBLOB    -- 中等二进制对象
LONGBLOB      -- 大二进制对象

-- 示例
CREATE TABLE users (
    id INT PRIMARY KEY,
    username VARCHAR(50),
    email VARCHAR(255),
    bio TEXT,
    avatar BLOB
);
```

### 日期时间类型

```sql
-- 日期时间类型
DATE          -- 日期（YYYY-MM-DD）
TIME          -- 时间（HH:MM:SS）
DATETIME      -- 日期和时间（YYYY-MM-DD HH:MM:SS）
TIMESTAMP     -- 时间戳（自动更新）
YEAR          -- 年份（YYYY）

-- 示例
CREATE TABLE events (
    id INT PRIMARY KEY,
    event_date DATE,
    event_time TIME,
    created_at DATETIME,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 插入日期时间
INSERT INTO events (event_date, event_time, created_at)
VALUES ('2024-01-15', '14:30:00', '2024-01-15 14:30:00');
```

### JSON 类型

```sql
-- JSON 类型（MySQL 5.7.8+）
JSON          -- 存储 JSON 数据

-- 示例
CREATE TABLE products (
    id INT PRIMARY KEY,
    name VARCHAR(255),
    attributes JSON
);

-- 插入 JSON 数据
INSERT INTO products (name, attributes)
VALUES ('Laptop', '{"brand": "Dell", "price": 999, "specs": {"cpu": "Intel i7", "ram": "16GB"}}');

-- 查询 JSON 数据
SELECT name, JSON_EXTRACT(attributes, '$.brand') AS brand,
       JSON_EXTRACT(attributes, '$.specs.cpu') AS cpu
FROM products;

-- JSON 操作符（MySQL 5.7.13+）
SELECT name, attributes->'$.brand' AS brand,
       attributes->>'$.specs.cpu' AS cpu
FROM products;
```

### 枚举和集合类型

```sql
-- 枚举类型
ENUM('value1', 'value2', ...)  -- 只能选择其中一个值

-- 集合类型
SET('value1', 'value2', ...)   -- 可以选择多个值

-- 示例
CREATE TABLE users (
    id INT PRIMARY KEY,
    status ENUM('active', 'inactive', 'pending'),
    hobbies SET('reading', 'music', 'sports', 'travel')
);

-- 插入数据
INSERT INTO users (status, hobbies)
VALUES ('active', 'reading,music');
```

---

## DDL 操作

### 创建数据库

```sql
-- 创建数据库
CREATE DATABASE mydb;

-- 创建数据库（指定字符集和排序规则）
CREATE DATABASE mydb
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS mydb;

-- 删除数据库
DROP DATABASE mydb;

-- 删除数据库（如果存在）
DROP DATABASE IF EXISTS mydb;
```

### 创建表

```sql
-- 基本创建表
CREATE TABLE users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 从查询结果创建表
CREATE TABLE users_backup AS
SELECT * FROM users WHERE created_at < '2024-01-01';

-- 创建表（如果不存在）
CREATE TABLE IF NOT EXISTS products (
    id INT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2)
);

-- 创建表（带生成列）
CREATE TABLE triangle (
    sidea DOUBLE,
    sideb DOUBLE,
    sidec DOUBLE AS (SQRT(sidea * sidea + sideb * sideb))
);
```

### 修改表

```sql
-- 添加列
ALTER TABLE users ADD COLUMN phone VARCHAR(20);

-- 添加列（指定位置）
ALTER TABLE users ADD COLUMN phone VARCHAR(20) AFTER email;
ALTER TABLE users ADD COLUMN phone VARCHAR(20) FIRST;

-- 删除列
ALTER TABLE users DROP COLUMN phone;

-- 修改列类型
ALTER TABLE users MODIFY COLUMN email VARCHAR(100);

-- 修改列名和类型
ALTER TABLE users CHANGE COLUMN email email_address VARCHAR(100);

-- 重命名表
ALTER TABLE users RENAME TO customers;
-- 或
RENAME TABLE users TO customers;

-- 修改表引擎
ALTER TABLE users ENGINE=InnoDB;

-- 修改字符集
ALTER TABLE users CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 删除表

```sql
-- 删除表
DROP TABLE users;

-- 删除表（如果存在）
DROP TABLE IF EXISTS users;

-- 清空表数据
TRUNCATE TABLE users;

-- 删除多个表
DROP TABLE users, orders, products;
```

### 存储引擎

```sql
-- 查看支持的存储引擎
SHOW ENGINES;

-- 指定存储引擎创建表
CREATE TABLE mytable (
    id INT PRIMARY KEY
) ENGINE=InnoDB;

-- 常用存储引擎
-- InnoDB: 支持事务、外键、行级锁（推荐）
-- MyISAM: 不支持事务，表级锁，查询速度快
-- Memory: 数据存储在内存中
-- CSV: 以 CSV 格式存储数据
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

-- 插入并忽略错误（使用 IGNORE）
INSERT IGNORE INTO users (username, email) VALUES ('john', 'john@example.com');

-- 插入或更新（ON DUPLICATE KEY UPDATE）
INSERT INTO users (username, email) VALUES ('john', 'john@example.com')
ON DUPLICATE KEY UPDATE email = 'newemail@example.com';

-- 插入并返回自增 ID（使用 LAST_INSERT_ID()）
INSERT INTO users (username, email) VALUES ('david', 'david@example.com');
SELECT LAST_INSERT_ID();
```

### UPDATE

```sql
-- 更新单行
UPDATE users SET email = 'newemail@example.com' WHERE id = 1;

-- 更新多列
UPDATE users
SET email = 'newemail@example.com', updated_at = NOW()
WHERE id = 1;

-- 使用子查询更新
UPDATE users
SET email = (SELECT email FROM users_backup WHERE users_backup.id = users.id)
WHERE EXISTS (SELECT 1 FROM users_backup WHERE users_backup.id = users.id);

-- 限制更新行数
UPDATE users SET status = 'inactive' WHERE status = 'pending' LIMIT 10;

-- 使用 JOIN 更新
UPDATE users u
JOIN orders o ON u.id = o.user_id
SET u.last_order_date = o.order_date
WHERE o.order_date > u.last_order_date;
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

-- 限制删除行数
DELETE FROM users WHERE status = 'inactive' LIMIT 100;

-- 使用 JOIN 删除
DELETE u FROM users u
JOIN orders o ON u.id = o.user_id
WHERE o.order_date < '2020-01-01';
```

### REPLACE

```sql
-- REPLACE（如果记录存在则删除后插入，不存在则直接插入）
REPLACE INTO users (id, username, email) VALUES (1, 'john', 'john@example.com');
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
SELECT * FROM users LIMIT 10 OFFSET 20;
-- 或
SELECT * FROM users LIMIT 20, 10;
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

-- LIKE 和 NOT LIKE
SELECT * FROM users WHERE username LIKE 'j%';      -- 以 j 开头
SELECT * FROM users WHERE username LIKE '%john%';  -- 包含 john
SELECT * FROM users WHERE username LIKE 'j__n';    -- j 开头，n 结尾，中间两个字符

-- IS NULL 和 IS NOT NULL
SELECT * FROM users WHERE email IS NULL;
SELECT * FROM users WHERE email IS NOT NULL;

-- 正则表达式（REGEXP）
SELECT * FROM users WHERE email REGEXP '^[a-z]+@example\\.com$';
```

### 排序

```sql
-- 升序排序
SELECT * FROM users ORDER BY created_at ASC;

-- 降序排序
SELECT * FROM users ORDER BY created_at DESC;

-- 多列排序
SELECT * FROM users ORDER BY created_at DESC, username ASC;

-- 使用表达式排序
SELECT * FROM users ORDER BY LENGTH(username) DESC;
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

-- WITH ROLLUP（汇总）
SELECT category, COUNT(*) AS count
FROM products
GROUP BY category WITH ROLLUP;
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

-- 多表 JOIN
SELECT u.username, o.order_id, p.product_name, oi.quantity
FROM users u
INNER JOIN orders o ON u.id = o.user_id
INNER JOIN order_items oi ON o.id = oi.order_id
INNER JOIN products p ON oi.product_id = p.id;

-- 自连接
SELECT e1.name AS employee, e2.name AS manager
FROM employees e1
LEFT JOIN employees e2 ON e1.manager_id = e2.id;
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

### UNION

```sql
-- UNION（去重）
SELECT username FROM users
UNION
SELECT username FROM admins;

-- UNION ALL（不去重）
SELECT username FROM users
UNION ALL
SELECT username FROM admins;
```

---

## 索引

### 创建索引

```sql
-- 创建普通索引
CREATE INDEX idx_users_email ON users(email);

-- 创建唯一索引
CREATE UNIQUE INDEX idx_users_username ON users(username);

-- 创建复合索引
CREATE INDEX idx_orders_user_date ON orders(user_id, order_date);

-- 创建前缀索引
CREATE INDEX idx_users_email_prefix ON users(email(10));

-- 创建全文索引
CREATE FULLTEXT INDEX idx_products_description ON products(description);

-- 在创建表时定义索引
CREATE TABLE users (
    id INT PRIMARY KEY,
    username VARCHAR(50),
    email VARCHAR(255),
    INDEX idx_email (email),
    UNIQUE INDEX idx_username (username)
);
```

### 索引类型

```sql
-- B-Tree 索引（默认，适用于大多数情况）
CREATE INDEX idx_btree ON table_name(column_name);

-- 全文索引（FULLTEXT，仅 MyISAM 和 InnoDB）
CREATE FULLTEXT INDEX idx_fulltext ON table_name(column_name);

-- 空间索引（SPATIAL，仅 MyISAM）
CREATE SPATIAL INDEX idx_spatial ON table_name(column_name);
```

### 管理索引

```sql
-- 查看索引
SHOW INDEX FROM users;

-- 查看索引信息
SELECT * FROM information_schema.STATISTICS
WHERE table_schema = 'mydb' AND table_name = 'users';

-- 删除索引
DROP INDEX idx_users_email ON users;
-- 或
ALTER TABLE users DROP INDEX idx_users_email;

-- 分析索引使用情况
ANALYZE TABLE users;
```

---

## 约束

### 主键约束

```sql
-- 创建表时定义主键
CREATE TABLE users (
    id INT PRIMARY KEY,
    username VARCHAR(50)
);

-- 添加主键约束
ALTER TABLE users ADD PRIMARY KEY (id);

-- 复合主键
CREATE TABLE order_items (
    order_id INT,
    product_id INT,
    quantity INT,
    PRIMARY KEY (order_id, product_id)
);

-- 自增主键
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50)
);
```

### 外键约束

```sql
-- 创建表时定义外键
CREATE TABLE orders (
    id INT PRIMARY KEY,
    user_id INT,
    total DECIMAL(10, 2),
    FOREIGN KEY (user_id) REFERENCES users(id)
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

-- 设置 NULL
ALTER TABLE orders
ADD CONSTRAINT fk_orders_user
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
```

### 唯一约束

```sql
-- 创建表时定义唯一约束
CREATE TABLE users (
    id INT PRIMARY KEY,
    email VARCHAR(255) UNIQUE
);

-- 添加唯一约束
ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);

-- 复合唯一约束
CREATE TABLE user_roles (
    user_id INT,
    role_id INT,
    UNIQUE (user_id, role_id)
);
```

### 检查约束

```sql
-- 创建表时定义检查约束（MySQL 8.0.16+）
CREATE TABLE products (
    id INT PRIMARY KEY,
    name VARCHAR(255),
    price DECIMAL(10, 2) CHECK (price > 0),
    stock INT CHECK (stock >= 0)
);

-- 添加检查约束
ALTER TABLE products
ADD CONSTRAINT products_price_positive CHECK (price > 0);
```

### 非空约束

```sql
-- 创建表时定义非空约束
CREATE TABLE users (
    id INT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL
);

-- 添加非空约束
ALTER TABLE users MODIFY COLUMN email VARCHAR(255) NOT NULL;

-- 移除非空约束
ALTER TABLE users MODIFY COLUMN email VARCHAR(255) NULL;
```

### 默认值

```sql
-- 创建表时定义默认值
CREATE TABLE users (
    id INT PRIMARY KEY,
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

-- 创建或替换视图
CREATE OR REPLACE VIEW active_users AS
SELECT id, username, email
FROM users
WHERE active = TRUE AND deleted_at IS NULL;
```

### 管理视图

```sql
-- 查看视图定义
SHOW CREATE VIEW active_users;

-- 查看视图数据
SELECT * FROM active_users;

-- 删除视图
DROP VIEW active_users;

-- 删除视图（如果存在）
DROP VIEW IF EXISTS active_users;
```

---

## 存储过程和函数

### 创建存储过程

```sql
-- 基本存储过程
DELIMITER //
CREATE PROCEDURE get_user_count()
BEGIN
    SELECT COUNT(*) AS user_count FROM users;
END //
DELIMITER ;

-- 调用存储过程
CALL get_user_count();

-- 带参数的存储过程
DELIMITER //
CREATE PROCEDURE get_user_by_id(IN user_id INT)
BEGIN
    SELECT * FROM users WHERE id = user_id;
END //
DELIMITER ;

-- 带输出参数的存储过程
DELIMITER //
CREATE PROCEDURE get_user_count(OUT total INT)
BEGIN
    SELECT COUNT(*) INTO total FROM users;
END //
DELIMITER ;

-- 调用带输出参数的存储过程
CALL get_user_count(@total);
SELECT @total;
```

### 创建函数

```sql
-- 创建函数
DELIMITER //
CREATE FUNCTION calculate_order_total(order_id INT)
RETURNS DECIMAL(10, 2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE total DECIMAL(10, 2);
    SELECT SUM(quantity * price) INTO total
    FROM order_items
    WHERE order_id = calculate_order_total.order_id;
    RETURN COALESCE(total, 0);
END //
DELIMITER ;

-- 调用函数
SELECT calculate_order_total(1);
```

### 管理存储过程和函数

```sql
-- 查看存储过程
SHOW PROCEDURE STATUS;

-- 查看函数
SHOW FUNCTION STATUS;

-- 查看存储过程定义
SHOW CREATE PROCEDURE get_user_count;

-- 删除存储过程
DROP PROCEDURE get_user_count;

-- 删除函数
DROP FUNCTION calculate_order_total;
```

---

## 触发器

### 创建触发器

```sql
-- 自动更新时间戳的触发器
DELIMITER //
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
BEGIN
    SET NEW.updated_at = NOW();
END //
DELIMITER ;
```

### 触发器示例

```sql
-- 审计日志触发器
DELIMITER //
CREATE TRIGGER audit_users_trigger
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (table_name, operation, new_data, changed_at)
    VALUES ('users', 'INSERT', JSON_OBJECT('id', NEW.id, 'username', NEW.username), NOW());
END //
DELIMITER ;

-- 创建审计日志表
CREATE TABLE audit_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    table_name VARCHAR(255),
    operation VARCHAR(10),
    old_data JSON,
    new_data JSON,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 管理触发器

```sql
-- 查看触发器
SHOW TRIGGERS;

-- 查看触发器定义
SHOW CREATE TRIGGER update_users_updated_at;

-- 删除触发器
DROP TRIGGER update_users_updated_at;
```

---

## 事务管理

### 基本事务

```sql
-- 开始事务
START TRANSACTION;
-- 或
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
START TRANSACTION;

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
-- 查看当前隔离级别
SELECT @@transaction_isolation;

-- 设置会话隔离级别
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;
SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ;
SET SESSION TRANSACTION ISOLATION LEVEL SERIALIZABLE;

-- 在事务中设置
START TRANSACTION;
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
-- ... 执行操作 ...
COMMIT;
```

### 自动提交

```sql
-- 查看自动提交状态
SELECT @@autocommit;

-- 关闭自动提交
SET autocommit = 0;

-- 开启自动提交
SET autocommit = 1;
```

---

## 备份与恢复

### mysqldump

```bash
# 备份单个数据库
mysqldump -u root -p mydb > mydb_backup.sql

# 备份所有数据库
mysqldump -u root -p --all-databases > all_databases_backup.sql

# 只备份结构
mysqldump -u root -p --no-data mydb > schema.sql

# 只备份数据
mysqldump -u root -p --no-create-info mydb > data.sql

# 备份特定表
mysqldump -u root -p mydb users orders > tables_backup.sql

# 压缩备份
mysqldump -u root -p mydb | gzip > mydb_backup.sql.gz

# 备份并压缩
mysqldump -u root -p mydb | gzip > mydb_backup.sql.gz
```

### 恢复

```bash
# 从 SQL 文件恢复
mysql -u root -p mydb < mydb_backup.sql

# 从压缩文件恢复
gunzip < mydb_backup.sql.gz | mysql -u root -p mydb

# 恢复所有数据库
mysql -u root -p < all_databases_backup.sql
```

### 物理备份

```bash
# 停止 MySQL 服务
sudo systemctl stop mysql

# 复制数据目录
sudo cp -r /var/lib/mysql /backup/mysql_backup

# 启动 MySQL 服务
sudo systemctl start mysql
```

---

## 性能优化

### EXPLAIN 分析

```sql
-- 基本 EXPLAIN
EXPLAIN SELECT * FROM users WHERE email = 'john@example.com';

-- EXPLAIN 详细输出
EXPLAIN FORMAT=JSON SELECT * FROM users WHERE email = 'john@example.com';

-- EXPLAIN ANALYZE（MySQL 8.0.18+）
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'john@example.com';
```

### 索引优化

```sql
-- 分析表
ANALYZE TABLE users;

-- 优化表
OPTIMIZE TABLE users;

-- 检查表
CHECK TABLE users;

-- 修复表
REPAIR TABLE users;
```

### 查询优化技巧

```sql
-- 使用索引
CREATE INDEX idx_users_email ON users(email);

-- 避免 SELECT *
SELECT id, username, email FROM users;

-- 使用 LIMIT
SELECT * FROM users ORDER BY created_at DESC LIMIT 10;

-- 使用 EXISTS 而不是 COUNT
SELECT * FROM users u
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);

-- 避免在 WHERE 子句中使用函数
-- 不好：WHERE YEAR(created_at) = 2024
-- 好：WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01'
```

### 配置优化

```sql
-- 查看配置
SHOW VARIABLES LIKE '%buffer%';
SHOW VARIABLES LIKE '%cache%';

-- 常用配置项（在 my.cnf 中设置）
-- innodb_buffer_pool_size = 1G
-- query_cache_size = 64M
-- max_connections = 200
-- tmp_table_size = 64M
-- max_heap_table_size = 64M
```

---

## 常用实用方法

### 字符串函数

```sql
-- 连接字符串
SELECT CONCAT('Hello', ' ', 'World');  -- 'Hello World'
SELECT CONCAT_WS(',', 'a', 'b', 'c');  -- 'a,b,c'

-- 字符串长度
SELECT LENGTH('Hello');                -- 5
SELECT CHAR_LENGTH('Hello');           -- 5

-- 大小写转换
SELECT UPPER('hello');                 -- 'HELLO'
SELECT LOWER('HELLO');                 -- 'hello'

-- 子字符串
SELECT SUBSTRING('Hello World', 1, 5); -- 'Hello'
SELECT SUBSTRING('Hello World', 7);    -- 'World'
SELECT SUBSTRING_INDEX('www.example.com', '.', 2); -- 'www.example'

-- 替换
SELECT REPLACE('Hello World', 'World', 'MySQL');  -- 'Hello MySQL'

-- 去除空格
SELECT TRIM('  Hello  ');              -- 'Hello'
SELECT LTRIM('  Hello');              -- 'Hello'
SELECT RTRIM('Hello  ');               -- 'Hello'

-- 填充
SELECT LPAD('123', 5, '0');            -- '00123'
SELECT RPAD('123', 5, '0');            -- '12300'

-- 查找位置
SELECT LOCATE('World', 'Hello World'); -- 7
SELECT POSITION('World' IN 'Hello World'); -- 7
```

### 日期时间函数

```sql
-- 当前日期时间
SELECT NOW();                          -- 当前日期时间
SELECT CURDATE();                      -- 当前日期
SELECT CURTIME();                      -- 当前时间
SELECT CURRENT_TIMESTAMP;              -- 当前时间戳

-- 提取日期部分
SELECT YEAR(NOW());
SELECT MONTH(NOW());
SELECT DAY(NOW());
SELECT HOUR(NOW());
SELECT MINUTE(NOW());
SELECT SECOND(NOW());

-- 日期运算
SELECT DATE_ADD(NOW(), INTERVAL 1 DAY);    -- 加一天
SELECT DATE_SUB(NOW(), INTERVAL 1 WEEK);   -- 减一周
SELECT DATE_ADD(NOW(), INTERVAL 1 MONTH);  -- 加一月
SELECT DATE_ADD(NOW(), INTERVAL 1 YEAR);   -- 加一年

-- 日期格式化
SELECT DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s');
SELECT DATE_FORMAT(NOW(), '%Y年%m月%d日');

-- 日期差
SELECT DATEDIFF('2024-01-15', '2024-01-01');  -- 14
SELECT TIMESTAMPDIFF(DAY, '2024-01-01', '2024-01-15'); -- 14

-- 日期截取
SELECT DATE(NOW());                    -- 提取日期部分
SELECT TIME(NOW());                    -- 提取时间部分
```

### 数值函数

```sql
-- 四舍五入
SELECT ROUND(123.456, 2);              -- 123.46
SELECT ROUND(123.456);                  -- 123

-- 向上取整
SELECT CEIL(123.456);                   -- 124
SELECT CEILING(123.456);                -- 124

-- 向下取整
SELECT FLOOR(123.456);                  -- 123

-- 绝对值
SELECT ABS(-123);                       -- 123

-- 随机数
SELECT RAND();                          -- 0 到 1 之间的随机数
SELECT FLOOR(RAND() * 100);             -- 0 到 99 的随机整数

-- 最大值和最小值
SELECT GREATEST(1, 2, 3, 4, 5);        -- 5
SELECT LEAST(1, 2, 3, 4, 5);           -- 1

-- 取模
SELECT MOD(10, 3);                      -- 1
SELECT 10 % 3;                          -- 1

-- 幂运算
SELECT POW(2, 3);                       -- 8
SELECT POWER(2, 3);                     -- 8

-- 平方根
SELECT SQRT(16);                        -- 4
```

### JSON 函数

```sql
-- JSON 提取
SELECT JSON_EXTRACT('{"name": "John", "age": 30}', '$.name');
SELECT JSON_EXTRACT('{"name": "John", "age": 30}', '$.age');

-- JSON 操作符
SELECT '{"name": "John"}'->'$.name';
SELECT '{"name": "John"}'->>'$.name';

-- JSON 类型检查
SELECT JSON_TYPE('{"name": "John"}');  -- 'OBJECT'
SELECT JSON_TYPE('[1, 2, 3]');         -- 'ARRAY'

-- JSON 数组长度
SELECT JSON_LENGTH('[1, 2, 3]');       -- 3

-- JSON 对象键
SELECT JSON_KEYS('{"a": 1, "b": 2}');  -- ["a", "b"]

-- JSON 搜索
SELECT JSON_SEARCH('{"name": "John"}', 'one', 'John');
```

### 条件函数

```sql
-- IF 函数
SELECT IF(1 > 0, 'Yes', 'No');         -- 'Yes'

-- CASE 语句
SELECT CASE
    WHEN score >= 90 THEN 'A'
    WHEN score >= 80 THEN 'B'
    WHEN score >= 70 THEN 'C'
    ELSE 'F'
END AS grade
FROM students;

-- IFNULL
SELECT IFNULL(NULL, 'Default');        -- 'Default'

-- COALESCE
SELECT COALESCE(NULL, NULL, 'Default'); -- 'Default'

-- NULLIF
SELECT NULLIF(1, 1);                   -- NULL
SELECT NULLIF(1, 2);                   -- 1
```

### 系统函数

```sql
-- 数据库信息
SELECT DATABASE();
SELECT USER();
SELECT VERSION();
SELECT CONNECTION_ID();

-- 最后插入 ID
SELECT LAST_INSERT_ID();

-- 影响行数
SELECT ROW_COUNT();

-- 字符集
SELECT CHARSET('Hello');
SELECT COLLATION('Hello');
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
SELECT t1.id + 1 AS missing_id
FROM users t1
LEFT JOIN users t2 ON t1.id + 1 = t2.id
WHERE t2.id IS NULL
LIMIT 1;

-- 随机抽样
SELECT * FROM users
ORDER BY RAND()
LIMIT 10;

-- 查找最近 N 天的记录
SELECT * FROM orders
WHERE order_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY);

-- 查找每个分类的最新记录
SELECT p1.*
FROM products p1
INNER JOIN (
    SELECT category, MAX(created_at) AS max_date
    FROM products
    GROUP BY category
) p2 ON p1.category = p2.category AND p1.created_at = p2.max_date;
```

---

## 最佳实践

### 数据库设计

1. **合理使用数据类型**：选择合适的数据类型，避免过度使用 VARCHAR
2. **规范化设计**：遵循数据库规范化原则，避免数据冗余
3. **使用外键约束**：确保数据完整性（InnoDB 支持）
4. **合理使用索引**：为经常查询的列创建索引，但不要过度索引
5. **使用自增主键**：使用 AUTO_INCREMENT 作为主键

### 查询优化

1. **使用 EXPLAIN**：分析查询执行计划
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

1. **定期优化表**：使用 OPTIMIZE TABLE
2. **定期分析表**：使用 ANALYZE TABLE 更新统计信息
3. **监控数据库大小**：定期检查数据库和表的大小
4. **备份策略**：制定并执行定期备份策略
5. **监控性能**：使用 SHOW PROCESSLIST 和慢查询日志监控性能

---

## 故障排查

### 查看日志

```sql
-- 查看错误日志位置
SHOW VARIABLES LIKE 'log_error';

-- 查看慢查询日志
SHOW VARIABLES LIKE 'slow_query_log';
SHOW VARIABLES LIKE 'long_query_time';

-- 查看二进制日志
SHOW BINARY LOGS;
SHOW MASTER STATUS;
```

### 连接问题

```sql
-- 查看当前连接
SHOW PROCESSLIST;

-- 查看连接数
SHOW STATUS LIKE 'Threads_connected';
SHOW VARIABLES LIKE 'max_connections';

-- 终止连接
KILL connection_id;

-- 查看锁
SHOW ENGINE INNODB STATUS;
```

### 性能问题

```sql
-- 查看慢查询
SELECT * FROM mysql.slow_log;

-- 查看表状态
SHOW TABLE STATUS LIKE 'users';

-- 查看索引使用情况
SHOW INDEX FROM users;

-- 查看表统计信息
SELECT * FROM information_schema.TABLES
WHERE table_schema = 'mydb';
```

### 空间问题

```sql
-- 查看数据库大小
SELECT 
    table_schema AS 'Database',
    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.TABLES
GROUP BY table_schema;

-- 查看表大小
SELECT 
    table_name AS 'Table',
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.TABLES
WHERE table_schema = 'mydb'
ORDER BY (data_length + index_length) DESC;
```

---

## 学习资源

- [MySQL 官方文档](https://dev.mysql.com/doc/)
- [MySQL 教程](https://dev.mysql.com/doc/refman/8.0/en/tutorial.html)
- [MySQL 性能优化指南](https://dev.mysql.com/doc/refman/8.0/en/optimization.html)
- [MySQL 社区版下载](https://dev.mysql.com/downloads/mysql/)

---

## 💡 常用命令速查

```sql
-- 数据库操作
SHOW DATABASES;
USE database_name;
CREATE DATABASE db;
DROP DATABASE db;

-- 表操作
SHOW TABLES;
DESCRIBE table_name;
SHOW CREATE TABLE table_name;

-- 查询
SELECT * FROM table;
EXPLAIN SELECT * FROM table;

-- 索引
SHOW INDEX FROM table;
CREATE INDEX idx ON table(column);
DROP INDEX idx ON table;

-- 用户和权限
SHOW GRANTS;
CREATE USER 'user'@'host' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON db.* TO 'user'@'host';
FLUSH PRIVILEGES;
```

---

## 🔧 实用脚本

### 备份脚本

```bash
#!/bin/bash
# 备份脚本
BACKUP_DIR="/backup/mysql"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="mydb"
DB_USER="root"
DB_PASS="password"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_DIR/${DB_NAME}_${DATE}.sql.gz

# 删除 7 天前的备份
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
```

### 监控脚本

```sql
-- 查看数据库统计信息
SELECT 
    'Connections' AS Metric,
    VARIABLE_VALUE AS Value
FROM information_schema.GLOBAL_STATUS
WHERE VARIABLE_NAME = 'Threads_connected'
UNION ALL
SELECT 
    'Max Connections',
    VARIABLE_VALUE
FROM information_schema.GLOBAL_VARIABLES
WHERE VARIABLE_NAME = 'max_connections'
UNION ALL
SELECT 
    'Uptime (seconds)',
    VARIABLE_VALUE
FROM information_schema.GLOBAL_STATUS
WHERE VARIABLE_NAME = 'Uptime';
```
