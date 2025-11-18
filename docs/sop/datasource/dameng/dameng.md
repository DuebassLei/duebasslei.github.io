---
title: 达梦数据库实用操作笔记🦄
description: 达梦数据库基础核心知识及常用操作整理
tag:
  - 达梦数据库
  - DM Database
  - 国产数据库
  - 关系型数据库
sidebar: true
outline: [2,3,4]
lastUpdated: true
---

## 📖 目录

- [达梦数据库 基础概念](#达梦数据库-基础概念)
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
- [用户和权限管理](#用户和权限管理)
- [表空间管理](#表空间管理)
- [备份与恢复](#备份与恢复)
- [性能优化](#性能优化)
- [常用实用方法](#常用实用方法)
- [最佳实践](#最佳实践)
- [故障排查](#故障排查)
- [学习资源](#学习资源)

---

## 达梦数据库 基础概念

### 什么是达梦数据库？

达梦数据库（DM Database）是由武汉达梦数据库有限公司自主研发的关系型数据库管理系统，具有自主知识产权，广泛应用于政务、金融、能源、电信等关键领域。

### 核心特性

- **自主可控**：完全自主知识产权，符合国产化要求
- **高性能**：优化的查询引擎和存储引擎，支持高并发
- **高可用性**：支持主备、读写分离、集群等架构
- **兼容性强**：兼容 Oracle、MySQL、SQL Server 等数据库语法
- **安全可靠**：提供完善的安全机制和审计功能
- **ACID 兼容**：支持完整的事务特性
- **跨平台**：支持 Windows、Linux、Unix 等操作系统

### 应用场景

- **政务系统**：电子政务、数字政府等
- **金融行业**：银行、证券、保险等核心业务系统
- **能源行业**：电力、石油、煤炭等企业信息化
- **电信行业**：运营商核心业务系统
- **企业信息化**：ERP、CRM 等企业应用系统

### 数据库架构

- **实例（Instance）**：运行中的数据库服务进程，一个实例对应一个数据库
- **数据库（Database）**：按照一定方式组织、存储和管理数据的集合
- **表空间（Tablespace）**：数据库的逻辑存储单元
- **表（Table）**：数据存储的基本单元
- **用户（User）**：数据库访问的主体
- **角色（Role）**：权限的集合

---

## 安装与启动

### 安装环境要求

- **操作系统**：Linux（RedHat、CentOS、Ubuntu 等）、Windows Server
- **内存**：建议 ≥4GB（生产环境建议 ≥8GB）
- **磁盘空间**：建议 ≥50GB（根据数据量调整）
- **CPU**：建议 2 核以上

### 安装步骤

```bash
# 1. 创建达梦用户和用户组
groupadd dinstall
useradd -g dinstall -m -d /home/dmdba -s /bin/bash dmdba
passwd dmdba

# 2. 设置环境变量（在 dmdba 用户下）
export DM_HOME=/opt/dmdbms
export PATH=$DM_HOME/bin:$PATH
export LD_LIBRARY_PATH=$DM_HOME/bin:$LD_LIBRARY_PATH

# 3. 运行安装程序
./DMInstall.bin -i

# 4. 初始化数据库实例
./dminit PATH=/opt/dmdbms/data DB_NAME=DAMENG INSTANCE_NAME=DMSERVER PORT_NUM=5236

# 5. 注册服务（Linux）
./dm_service_installer.sh -t dmserver -p DMSERVER -dm_ini /opt/dmdbms/data/DAMENG/dm.ini
```

### 启动和停止服务

```bash
# 启动数据库服务
systemctl start DmServiceDMSERVER
# 或
service DmServiceDMSERVER start

# 停止数据库服务
systemctl stop DmServiceDMSERVER
# 或
service DmServiceDMSERVER stop

# 重启数据库服务
systemctl restart DmServiceDMSERVER

# 查看服务状态
systemctl status DmServiceDMSERVER
```

### 连接数据库

```bash
# 使用 disql 命令行工具连接
disql SYSDBA/SYSDBA@localhost:5236

# 连接远程数据库
disql SYSDBA/SYSDBA@192.168.1.100:5236

# 使用 DM 管理工具（图形化界面）
# 启动 DM 管理工具，输入服务器地址、端口、用户名、密码
```

### 基本命令

```sql
-- 查看版本
SELECT * FROM V$VERSION;

-- 查看当前数据库
SELECT SYS_CONTEXT('USERENV', 'DB_NAME') FROM DUAL;

-- 查看当前用户
SELECT USER FROM DUAL;
SELECT SYS_CONTEXT('USERENV', 'SESSION_USER') FROM DUAL;

-- 查看当前时间
SELECT SYSDATE FROM DUAL;

-- 查看数据库信息
SELECT * FROM V$DATABASE;

-- 退出
EXIT;
-- 或
QUIT;
```

---

## 数据类型

### 数值类型

```sql
-- 整数类型
TINYINT       -- 1 字节，-128 到 127
SMALLINT      -- 2 字节，-32768 到 32767
INT/INTEGER   -- 4 字节，-2147483648 到 2147483647
BIGINT        -- 8 字节，-9223372036854775808 到 9223372036854775807

-- 浮点数类型
REAL          -- 4 字节，单精度浮点数
FLOAT         -- 8 字节，双精度浮点数
DOUBLE        -- 8 字节，双精度浮点数

-- 精确数值类型
DECIMAL(p, s) -- 精确数值，p 是精度，s 是小数位数
NUMERIC(p, s) -- DECIMAL 的别名

-- 示例
CREATE TABLE numbers (
    id INTEGER PRIMARY KEY,
    price DECIMAL(10, 2),
    ratio REAL
);
```

### 字符串类型

```sql
-- 固定长度
CHAR(n)       -- 固定长度，最多 32767 字节

-- 可变长度
VARCHAR(n)    -- 可变长度，最多 32767 字节
VARCHAR2(n)   -- VARCHAR 的别名（兼容 Oracle）

-- 大文本类型
TEXT          -- 文本类型，最大 2GB
CLOB          -- 字符大对象，最大 2GB

-- 示例
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
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
TIMESTAMP     -- 日期和时间（年月日时分秒）
DATETIME      -- 日期和时间（兼容 MySQL）

-- 示例
CREATE TABLE events (
    id INTEGER PRIMARY KEY,
    event_date DATE,
    event_time TIME,
    created_at TIMESTAMP DEFAULT SYSDATE
);

-- 插入日期时间
INSERT INTO events (event_date, event_time, created_at)
VALUES (DATE '2024-01-15', TIME '14:30:00', SYSDATE);
```

### 二进制类型

```sql
-- 二进制类型
BINARY(n)     -- 固定长度二进制
VARBINARY(n)  -- 可变长度二进制
BLOB          -- 二进制大对象，最大 2GB
IMAGE         -- 图像类型（兼容 SQL Server）

-- 示例
CREATE TABLE files (
    id INTEGER PRIMARY KEY,
    filename VARCHAR(255),
    content BLOB
);
```

### 其他类型

```sql
-- 布尔类型
BOOLEAN       -- TRUE 或 FALSE

-- 位类型
BIT           -- 位类型

-- 示例
CREATE TABLE tasks (
    id INTEGER PRIMARY KEY,
    title VARCHAR(255),
    completed BOOLEAN DEFAULT FALSE
);
```

---

## DDL 操作

### 创建数据库

```sql
-- 创建数据库（通常在初始化时创建）
-- 使用 dminit 工具初始化数据库实例
```

### 创建表

```sql
-- 基本创建表
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT SYSDATE
) STORAGE (
    INITIAL 50,
    NEXT 50,
    MINEXTENTS 1,
    MAXEXTENTS UNLIMITED
);

-- 创建表（指定表空间）
CREATE TABLE products (
    id INTEGER PRIMARY KEY,
    name VARCHAR(255),
    price DECIMAL(10, 2)
) TABLESPACE MAIN;

-- 从查询结果创建表
CREATE TABLE users_backup AS
SELECT * FROM users WHERE created_at < DATE '2024-01-01';

-- 创建表（如果不存在）
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY,
    name VARCHAR(255)
);
```

### 修改表

```sql
-- 添加列
ALTER TABLE users ADD COLUMN phone VARCHAR(20);

-- 添加列（指定位置）
ALTER TABLE users ADD COLUMN phone VARCHAR(20) AFTER email;

-- 删除列
ALTER TABLE users DROP COLUMN phone;

-- 修改列类型
ALTER TABLE users MODIFY COLUMN email VARCHAR(100);

-- 修改列名
ALTER TABLE users RENAME COLUMN email TO email_address;

-- 重命名表
ALTER TABLE users RENAME TO customers;
-- 或
RENAME TABLE users TO customers;
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

### 表空间

```sql
-- 创建表空间
CREATE TABLESPACE tbs_data
DATAFILE '/opt/dmdbms/data/tbs_data01.dbf' SIZE 100;

-- 扩展表空间
ALTER TABLESPACE tbs_data
ADD DATAFILE '/opt/dmdbms/data/tbs_data02.dbf' SIZE 100;

-- 查看表空间
SELECT * FROM DBA_TABLESPACES;

-- 删除表空间
DROP TABLESPACE tbs_data;
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
SELECT username, email FROM users WHERE created_at < DATE '2024-01-01';

-- 插入并返回（使用 RETURNING）
INSERT INTO users (username, email) VALUES ('david', 'david@example.com')
RETURNING id, username, email;

-- 使用 MERGE 语句（合并插入或更新）
MERGE INTO users u
USING (SELECT 'john' AS username, 'john@example.com' AS email FROM DUAL) s
ON (u.username = s.username)
WHEN MATCHED THEN
    UPDATE SET email = s.email
WHEN NOT MATCHED THEN
    INSERT (username, email) VALUES (s.username, s.email);
```

### UPDATE

```sql
-- 更新单行
UPDATE users SET email = 'newemail@example.com' WHERE id = 1;

-- 更新多列
UPDATE users
SET email = 'newemail@example.com', updated_at = SYSDATE
WHERE id = 1;

-- 使用子查询更新
UPDATE users
SET email = (SELECT email FROM users_backup WHERE users_backup.id = users.id)
WHERE EXISTS (SELECT 1 FROM users_backup WHERE users_backup.id = users.id);

-- 使用 JOIN 更新
UPDATE users u
SET u.last_order_date = (
    SELECT MAX(order_date) FROM orders o WHERE o.user_id = u.id
)
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);
```

### DELETE

```sql
-- 删除行
DELETE FROM users WHERE id = 1;

-- 删除所有行
DELETE FROM users;

-- 使用子查询删除
DELETE FROM users
WHERE id IN (SELECT id FROM users_backup WHERE created_at < DATE '2020-01-01');

-- 使用 EXISTS 删除
DELETE FROM users
WHERE EXISTS (
    SELECT 1 FROM orders o 
    WHERE o.user_id = users.id AND o.order_date < DATE '2020-01-01'
);
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
SELECT * FROM users WHERE ROWNUM <= 10;

-- 分页查询（使用 ROWNUM）
SELECT * FROM (
    SELECT ROW_NUMBER() OVER (ORDER BY id) AS rn, *
    FROM users
) WHERE rn BETWEEN 21 AND 30;
```

### WHERE 条件

```sql
-- 基本条件
SELECT * FROM users WHERE id = 1;
SELECT * FROM users WHERE username = 'john';
SELECT * FROM users WHERE created_at > DATE '2024-01-01';

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
SELECT * FROM users WHERE username LIKE '%john%';   -- 包含 john
SELECT * FROM users WHERE username LIKE 'j__n';     -- j 开头，n 结尾，中间两个字符

-- IS NULL 和 IS NOT NULL
SELECT * FROM users WHERE email IS NULL;
SELECT * FROM users WHERE email IS NOT NULL;

-- 正则表达式（REGEXP_LIKE）
SELECT * FROM users WHERE REGEXP_LIKE(email, '^[a-z]+@example\.com$');
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

-- ROLLUP 和 CUBE
SELECT category, COUNT(*) AS count
FROM products
GROUP BY ROLLUP(category);

SELECT category, brand, COUNT(*) AS count
FROM products
GROUP BY CUBE(category, brand);
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

-- 自连接
SELECT e1.name AS employee, e2.name AS manager
FROM employees e1
LEFT JOIN employees e2 ON e1.manager_id = e2.id;
```

### 子查询

```sql
-- 标量子查询
SELECT username, (
    SELECT COUNT(*) FROM orders WHERE orders.user_id = users.id
) AS order_count
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

### 集合操作

```sql
-- UNION（去重）
SELECT username FROM users
UNION
SELECT username FROM admins;

-- UNION ALL（不去重）
SELECT username FROM users
UNION ALL
SELECT username FROM admins;

-- INTERSECT（交集）
SELECT username FROM users
INTERSECT
SELECT username FROM admins;

-- MINUS（差集）
SELECT username FROM users
MINUS
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

-- 创建函数索引
CREATE INDEX idx_users_lower_email ON users(LOWER(email));

-- 创建位图索引
CREATE BITMAP INDEX idx_products_status ON products(status);

-- 在创建表时定义索引
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username VARCHAR(50),
    email VARCHAR(255),
    CONSTRAINT idx_email UNIQUE (email)
);
```

### 索引类型

```sql
-- B-Tree 索引（默认）
CREATE INDEX idx_btree ON table_name(column_name);

-- 位图索引（适用于低基数列）
CREATE BITMAP INDEX idx_bitmap ON table_name(column_name);

-- 唯一索引
CREATE UNIQUE INDEX idx_unique ON table_name(column_name);

-- 函数索引
CREATE INDEX idx_function ON table_name(FUNCTION(column_name));
```

### 管理索引

```sql
-- 查看索引
SELECT * FROM USER_INDEXES WHERE table_name = 'USERS';

-- 查看索引列
SELECT * FROM USER_IND_COLUMNS WHERE table_name = 'USERS';

-- 重建索引
ALTER INDEX idx_users_email REBUILD;

-- 删除索引
DROP INDEX idx_users_email;

-- 分析索引
ANALYZE INDEX idx_users_email;
```

---

## 约束

### 主键约束

```sql
-- 创建表时定义主键
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username VARCHAR(50)
);

-- 添加主键约束
ALTER TABLE users ADD CONSTRAINT pk_users PRIMARY KEY (id);

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
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    total DECIMAL(10, 2),
    CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id)
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
    id INTEGER PRIMARY KEY,
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
    id INTEGER PRIMARY KEY,
    name VARCHAR(255),
    price DECIMAL(10, 2) CHECK (price > 0),
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
    id INTEGER PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL
);

-- 添加非空约束
ALTER TABLE users MODIFY email VARCHAR(255) NOT NULL;

-- 移除非空约束
ALTER TABLE users MODIFY email VARCHAR(255) NULL;
```

### 默认值

```sql
-- 创建表时定义默认值
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username VARCHAR(50),
    created_at TIMESTAMP DEFAULT SYSDATE,
    active BOOLEAN DEFAULT TRUE
);

-- 添加默认值
ALTER TABLE users MODIFY created_at TIMESTAMP DEFAULT SYSDATE;

-- 移除默认值
ALTER TABLE users MODIFY created_at TIMESTAMP;
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

-- 物化视图
CREATE MATERIALIZED VIEW monthly_sales AS
SELECT 
    TO_CHAR(order_date, 'YYYY-MM') AS month,
    SUM(total) AS total_sales,
    COUNT(*) AS order_count
FROM orders
GROUP BY TO_CHAR(order_date, 'YYYY-MM');

-- 刷新物化视图
REFRESH MATERIALIZED VIEW monthly_sales;
```

### 管理视图

```sql
-- 查看视图定义
SELECT * FROM USER_VIEWS WHERE view_name = 'ACTIVE_USERS';

-- 查看视图数据
SELECT * FROM active_users;

-- 删除视图
DROP VIEW active_users;

-- 删除物化视图
DROP MATERIALIZED VIEW monthly_sales;
```

---

## 存储过程和函数

### 创建存储过程

```sql
-- 基本存储过程
CREATE OR REPLACE PROCEDURE get_user_count
AS
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM users;
    DBMS_OUTPUT.PUT_LINE('User count: ' || v_count);
END;
/

-- 调用存储过程
EXEC get_user_count;
-- 或
CALL get_user_count();

-- 带参数的存储过程
CREATE OR REPLACE PROCEDURE get_user_by_id(
    p_user_id IN INTEGER,
    p_username OUT VARCHAR,
    p_email OUT VARCHAR
)
AS
BEGIN
    SELECT username, email INTO p_username, p_email
    FROM users
    WHERE id = p_user_id;
END;
/

-- 调用带参数的存储过程
DECLARE
    v_username VARCHAR(50);
    v_email VARCHAR(255);
BEGIN
    get_user_by_id(1, v_username, v_email);
    DBMS_OUTPUT.PUT_LINE('Username: ' || v_username || ', Email: ' || v_email);
END;
/
```

### 创建函数

```sql
-- 创建函数
CREATE OR REPLACE FUNCTION calculate_order_total(p_order_id INTEGER)
RETURNS DECIMAL(10, 2)
AS
    v_total DECIMAL(10, 2);
BEGIN
    SELECT SUM(quantity * price) INTO v_total
    FROM order_items
    WHERE order_id = p_order_id;
    
    RETURN NVL(v_total, 0);
END;
/

-- 调用函数
SELECT calculate_order_total(1) FROM DUAL;
```

### 管理存储过程和函数

```sql
-- 查看存储过程
SELECT * FROM USER_PROCEDURES WHERE object_type = 'PROCEDURE';

-- 查看函数
SELECT * FROM USER_PROCEDURES WHERE object_type = 'FUNCTION';

-- 查看存储过程定义
SELECT * FROM USER_SOURCE WHERE name = 'GET_USER_COUNT' AND type = 'PROCEDURE';

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
CREATE OR REPLACE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
BEGIN
    :NEW.updated_at := SYSDATE;
END;
/
```

### 触发器示例

```sql
-- 审计日志触发器
CREATE OR REPLACE TRIGGER audit_users_trigger
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW
DECLARE
    v_operation VARCHAR(10);
BEGIN
    IF INSERTING THEN
        v_operation := 'INSERT';
        INSERT INTO audit_log (table_name, operation, new_data, changed_at)
        VALUES ('users', v_operation, 
                '{"id":' || :NEW.id || ',"username":"' || :NEW.username || '"}',
                SYSDATE);
    ELSIF UPDATING THEN
        v_operation := 'UPDATE';
        INSERT INTO audit_log (table_name, operation, old_data, new_data, changed_at)
        VALUES ('users', v_operation,
                '{"id":' || :OLD.id || ',"username":"' || :OLD.username || '"}',
                '{"id":' || :NEW.id || ',"username":"' || :NEW.username || '"}',
                SYSDATE);
    ELSIF DELETING THEN
        v_operation := 'DELETE';
        INSERT INTO audit_log (table_name, operation, old_data, changed_at)
        VALUES ('users', v_operation,
                '{"id":' || :OLD.id || ',"username":"' || :OLD.username || '"}',
                SYSDATE);
    END IF;
END;
/

-- 创建审计日志表
CREATE TABLE audit_log (
    id INTEGER PRIMARY KEY,
    table_name VARCHAR(255),
    operation VARCHAR(10),
    old_data TEXT,
    new_data TEXT,
    changed_at TIMESTAMP DEFAULT SYSDATE
);
```

### 管理触发器

```sql
-- 查看触发器
SELECT * FROM USER_TRIGGERS WHERE table_name = 'USERS';

-- 启用触发器
ALTER TRIGGER update_users_updated_at ENABLE;

-- 禁用触发器
ALTER TRIGGER update_users_updated_at DISABLE;

-- 删除触发器
DROP TRIGGER update_users_updated_at;
```

---

## 事务管理

### 基本事务

```sql
-- 开始事务（隐式）
-- 达梦数据库默认自动提交，需要关闭自动提交
SET AUTOCOMMIT OFF;

-- 执行操作
INSERT INTO users (username, email) VALUES ('john', 'john@example.com');
UPDATE users SET email = 'newemail@example.com' WHERE id = 1;

-- 提交事务
COMMIT;

-- 回滚事务
ROLLBACK;

-- 开启自动提交
SET AUTOCOMMIT ON;
```

### 保存点

```sql
SET AUTOCOMMIT OFF;

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
SELECT @@ISOLATION_LEVEL;

-- 设置会话隔离级别
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

-- 在事务中设置
SET AUTOCOMMIT OFF;
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
-- ... 执行操作 ...
COMMIT;
```

---

## 用户和权限管理

### 用户管理

```sql
-- 创建用户
CREATE USER test_user IDENTIFIED BY "password123";

-- 修改用户密码
ALTER USER test_user IDENTIFIED BY "newpassword123";

-- 锁定用户
ALTER USER test_user ACCOUNT LOCK;

-- 解锁用户
ALTER USER test_user ACCOUNT UNLOCK;

-- 删除用户
DROP USER test_user;

-- 查看用户
SELECT * FROM DBA_USERS WHERE username = 'TEST_USER';
```

### 角色管理

```sql
-- 创建角色
CREATE ROLE app_user_role;

-- 授予角色权限
GRANT SELECT, INSERT, UPDATE ON users TO app_user_role;
GRANT SELECT ON products TO app_user_role;

-- 将角色授予用户
GRANT app_user_role TO test_user;

-- 撤销角色
REVOKE app_user_role FROM test_user;

-- 删除角色
DROP ROLE app_user_role;

-- 查看角色
SELECT * FROM DBA_ROLES;
```

### 权限管理

```sql
-- 授予对象权限
GRANT SELECT, INSERT, UPDATE, DELETE ON users TO test_user;
GRANT SELECT ON products TO test_user;

-- 授予系统权限
GRANT CREATE TABLE TO test_user;
GRANT CREATE VIEW TO test_user;

-- 撤销权限
REVOKE SELECT ON users FROM test_user;
REVOKE CREATE TABLE FROM test_user;

-- 查看用户权限
SELECT * FROM DBA_TAB_PRIVS WHERE grantee = 'TEST_USER';
SELECT * FROM DBA_SYS_PRIVS WHERE grantee = 'TEST_USER';
```

---

## 表空间管理

### 创建表空间

```sql
-- 创建表空间
CREATE TABLESPACE tbs_data
DATAFILE '/opt/dmdbms/data/tbs_data01.dbf' SIZE 100;

-- 创建表空间（自动扩展）
CREATE TABLESPACE tbs_data
DATAFILE '/opt/dmdbms/data/tbs_data01.dbf' SIZE 100
AUTOEXTEND ON NEXT 50 MAXSIZE 1000;

-- 扩展表空间
ALTER TABLESPACE tbs_data
ADD DATAFILE '/opt/dmdbms/data/tbs_data02.dbf' SIZE 100;

-- 查看表空间
SELECT * FROM DBA_TABLESPACES;
SELECT * FROM DBA_DATA_FILES WHERE tablespace_name = 'TBS_DATA';

-- 删除表空间
DROP TABLESPACE tbs_data;
DROP TABLESPACE tbs_data INCLUDING CONTENTS AND DATAFILES;
```

### 表空间维护

```sql
-- 设置表空间为只读
ALTER TABLESPACE tbs_data READ ONLY;

-- 设置表空间为读写
ALTER TABLESPACE tbs_data READ WRITE;

-- 重命名表空间
ALTER TABLESPACE tbs_data RENAME TO tbs_data_new;
```

---

## 备份与恢复

### 逻辑备份

```sql
-- 使用 DM 管理工具进行逻辑备份
-- 或使用命令行工具 dexp

-- 导出整个数据库
dexp SYSDBA/SYSDBA@localhost:5236 FILE=backup.dmp FULL=Y

-- 导出指定用户
dexp SYSDBA/SYSDBA@localhost:5236 FILE=backup.dmp OWNER=test_user

-- 导出指定表
dexp SYSDBA/SYSDBA@localhost:5236 FILE=backup.dmp TABLES=users,orders

-- 导入数据
dimp SYSDBA/SYSDBA@localhost:5236 FILE=backup.dmp FULL=Y
```

### 物理备份

```bash
# 使用 DM 管理工具进行物理备份
# 或使用命令行工具

# 联机备份
BACKUP DATABASE BACKUPSET '/backup/full_backup';

# 增量备份
BACKUP DATABASE INCREMENT WITH BACKUP_DIR '/backup/full_backup' BACKUPSET '/backup/inc_backup';

# 表空间备份
BACKUP TABLESPACE MAIN BACKUPSET '/backup/tbs_backup';
```

### 恢复

```sql
-- 恢复数据库
RESTORE DATABASE '/opt/dmdbms/data/DAMENG' FROM BACKUPSET '/backup/full_backup';

-- 恢复表空间
RESTORE TABLESPACE MAIN FROM BACKUPSET '/backup/tbs_backup';

-- 恢复归档日志
RECOVER DATABASE '/opt/dmdbms/data/DAMENG' FROM BACKUPSET '/backup/full_backup' WITH ARCHIVEDIR '/archive';
```

---

## 性能优化

### EXPLAIN 分析

```sql
-- 基本 EXPLAIN
EXPLAIN SELECT * FROM users WHERE email = 'john@example.com';

-- 查看执行计划
SELECT * FROM V$SQL_PLAN WHERE sql_text LIKE '%SELECT * FROM users%';
```

### 统计信息

```sql
-- 收集表统计信息
ANALYZE TABLE users;

-- 收集所有表统计信息
DBMS_STATS.GATHER_TABLE_STATS('SYSDBA', 'USERS');

-- 查看表统计信息
SELECT * FROM USER_TAB_STATISTICS WHERE table_name = 'USERS';
```

### 查询优化技巧

```sql
-- 使用索引
CREATE INDEX idx_users_email ON users(email);

-- 避免 SELECT *
SELECT id, username, email FROM users;

-- 使用 ROWNUM 限制结果
SELECT * FROM users WHERE ROWNUM <= 10;

-- 使用 EXISTS 而不是 COUNT
SELECT * FROM users u
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);

-- 避免在 WHERE 子句中使用函数
-- 不好：WHERE TO_CHAR(created_at, 'YYYY') = '2024'
-- 好：WHERE created_at >= DATE '2024-01-01' AND created_at < DATE '2025-01-01'
```

### 配置优化

```sql
-- 查看配置参数
SELECT * FROM V$PARAMETER WHERE name LIKE '%BUFFER%';
SELECT * FROM V$PARAMETER WHERE name LIKE '%CACHE%';

-- 常用配置项（在 dm.ini 中设置）
-- BUFFER = 1000
-- MAX_BUFFER = 2000
-- SORT_BUF_SIZE = 2
-- HASH_JOIN_SIZE = 50
```

---

## 常用实用方法

### 字符串函数

```sql
-- 连接字符串
SELECT CONCAT('Hello', ' ', 'World') FROM DUAL;  -- 'Hello World'
SELECT 'Hello' || ' ' || 'World' FROM DUAL;      -- 'Hello World'

-- 字符串长度
SELECT LENGTH('Hello') FROM DUAL;                -- 5
SELECT LEN('Hello') FROM DUAL;                   -- 5

-- 大小写转换
SELECT UPPER('hello') FROM DUAL;                 -- 'HELLO'
SELECT LOWER('HELLO') FROM DUAL;                 -- 'hello'
SELECT INITCAP('hello world') FROM DUAL;         -- 'Hello World'

-- 子字符串
SELECT SUBSTR('Hello World', 1, 5) FROM DUAL;    -- 'Hello'
SELECT SUBSTRING('Hello World', 7) FROM DUAL;     -- 'World'

-- 替换
SELECT REPLACE('Hello World', 'World', 'DM') FROM DUAL;  -- 'Hello DM'

-- 去除空格
SELECT TRIM('  Hello  ') FROM DUAL;              -- 'Hello'
SELECT LTRIM('  Hello') FROM DUAL;               -- 'Hello'
SELECT RTRIM('Hello  ') FROM DUAL;               -- 'Hello'

-- 填充
SELECT LPAD('123', 5, '0') FROM DUAL;            -- '00123'
SELECT RPAD('123', 5, '0') FROM DUAL;            -- '12300'

-- 查找位置
SELECT INSTR('Hello World', 'World') FROM DUAL;  -- 7
SELECT POSITION('World' IN 'Hello World') FROM DUAL; -- 7
```

### 日期时间函数

```sql
-- 当前日期时间
SELECT SYSDATE FROM DUAL;                        -- 当前日期时间
SELECT CURRENT_DATE FROM DUAL;                   -- 当前日期
SELECT CURRENT_TIME FROM DUAL;                   -- 当前时间
SELECT CURRENT_TIMESTAMP FROM DUAL;              -- 当前时间戳

-- 提取日期部分
SELECT EXTRACT(YEAR FROM SYSDATE) FROM DUAL;
SELECT EXTRACT(MONTH FROM SYSDATE) FROM DUAL;
SELECT EXTRACT(DAY FROM SYSDATE) FROM DUAL;
SELECT TO_CHAR(SYSDATE, 'YYYY') FROM DUAL;
SELECT TO_CHAR(SYSDATE, 'MM') FROM DUAL;
SELECT TO_CHAR(SYSDATE, 'DD') FROM DUAL;

-- 日期运算
SELECT SYSDATE + 1 FROM DUAL;                    -- 加一天
SELECT SYSDATE - 7 FROM DUAL;                    -- 减七天
SELECT ADD_MONTHS(SYSDATE, 1) FROM DUAL;         -- 加一月
SELECT ADD_MONTHS(SYSDATE, -1) FROM DUAL;        -- 减一月
SELECT SYSDATE + INTERVAL '1' YEAR FROM DUAL;     -- 加一年

-- 日期格式化
SELECT TO_CHAR(SYSDATE, 'YYYY-MM-DD HH24:MI:SS') FROM DUAL;
SELECT TO_CHAR(SYSDATE, 'YYYY年MM月DD日') FROM DUAL;
SELECT TO_DATE('2024-01-15', 'YYYY-MM-DD') FROM DUAL;

-- 日期差
SELECT SYSDATE - TO_DATE('2024-01-01', 'YYYY-MM-DD') FROM DUAL;  -- 天数差
SELECT MONTHS_BETWEEN(SYSDATE, TO_DATE('2024-01-01', 'YYYY-MM-DD')) FROM DUAL;  -- 月数差

-- 日期截取
SELECT TRUNC(SYSDATE) FROM DUAL;                 -- 截取到日期
SELECT TRUNC(SYSDATE, 'MM') FROM DUAL;            -- 截取到月初
SELECT TRUNC(SYSDATE, 'YYYY') FROM DUAL;         -- 截取到年初
```

### 数值函数

```sql
-- 四舍五入
SELECT ROUND(123.456, 2) FROM DUAL;              -- 123.46
SELECT ROUND(123.456) FROM DUAL;                  -- 123

-- 向上取整
SELECT CEIL(123.456) FROM DUAL;                   -- 124

-- 向下取整
SELECT FLOOR(123.456) FROM DUAL;                  -- 123
SELECT TRUNC(123.456) FROM DUAL;                  -- 123

-- 绝对值
SELECT ABS(-123) FROM DUAL;                       -- 123

-- 随机数
SELECT DBMS_RANDOM.VALUE FROM DUAL;               -- 0 到 1 之间的随机数
SELECT TRUNC(DBMS_RANDOM.VALUE(0, 100)) FROM DUAL; -- 0 到 99 的随机整数

-- 最大值和最小值
SELECT GREATEST(1, 2, 3, 4, 5) FROM DUAL;        -- 5
SELECT LEAST(1, 2, 3, 4, 5) FROM DUAL;           -- 1

-- 取模
SELECT MOD(10, 3) FROM DUAL;                      -- 1
SELECT 10 % 3 FROM DUAL;                          -- 1

-- 幂运算
SELECT POWER(2, 3) FROM DUAL;                     -- 8

-- 平方根
SELECT SQRT(16) FROM DUAL;                        -- 4
```

### 条件函数

```sql
-- DECODE 函数
SELECT DECODE(status, 'A', 'Active', 'I', 'Inactive', 'Unknown') FROM users;

-- CASE 语句
SELECT CASE
    WHEN score >= 90 THEN 'A'
    WHEN score >= 80 THEN 'B'
    WHEN score >= 70 THEN 'C'
    ELSE 'F'
END AS grade
FROM students;

-- NVL 和 NVL2
SELECT NVL(email, 'No Email') FROM users;         -- 如果为 NULL 则返回默认值
SELECT NVL2(email, 'Has Email', 'No Email') FROM users;  -- 如果为 NULL 返回第二个值，否则返回第三个值

-- COALESCE
SELECT COALESCE(email, phone, 'No Contact') FROM users;  -- 返回第一个非 NULL 值
```

### 系统函数

```sql
-- 数据库信息
SELECT SYS_CONTEXT('USERENV', 'DB_NAME') FROM DUAL;
SELECT USER FROM DUAL;
SELECT SYS_CONTEXT('USERENV', 'SESSION_USER') FROM DUAL;
SELECT * FROM V$VERSION;

-- 序列
CREATE SEQUENCE seq_users START WITH 1 INCREMENT BY 1;
SELECT seq_users.NEXTVAL FROM DUAL;
SELECT seq_users.CURRVAL FROM DUAL;

-- 系统时间
SELECT SYSDATE FROM DUAL;
SELECT SYSTIMESTAMP FROM DUAL;
```

### 常用查询模式

```sql
-- 分页查询
SELECT * FROM (
    SELECT ROW_NUMBER() OVER (ORDER BY id) AS rn, *
    FROM users
) WHERE rn BETWEEN 21 AND 30;

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
AND ROWNUM <= 1;

-- 随机抽样
SELECT * FROM (
    SELECT * FROM users ORDER BY DBMS_RANDOM.VALUE
) WHERE ROWNUM <= 10;

-- 查找最近 N 天的记录
SELECT * FROM orders
WHERE order_date >= SYSDATE - 7;

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
3. **使用外键约束**：确保数据完整性
4. **合理使用索引**：为经常查询的列创建索引，但不要过度索引
5. **使用序列**：使用序列生成主键值

### 查询优化

1. **使用 EXPLAIN**：分析查询执行计划
2. **避免 SELECT ***：只选择需要的列
3. **使用 ROWNUM**：限制结果集大小
4. **合理使用 JOIN**：避免笛卡尔积
5. **使用 EXISTS 而不是 COUNT**：检查存在性时使用 EXISTS

### 索引优化

1. **为 WHERE 子句中的列创建索引**
2. **为 JOIN 条件创建索引**
3. **为 ORDER BY 和 GROUP BY 创建索引**
4. **使用复合索引**：为多列查询创建复合索引
5. **定期分析索引使用情况**：删除未使用的索引

### 维护

1. **定期收集统计信息**：使用 ANALYZE TABLE 或 DBMS_STATS
2. **定期备份**：制定并执行定期备份策略
3. **监控数据库大小**：定期检查数据库和表的大小
4. **监控性能**：使用 V$ 视图监控数据库性能
5. **定期清理**：清理无用的数据和对象

---

## 故障排查

### 查看日志

```sql
-- 查看错误日志位置
SELECT * FROM V$PARAMETER WHERE name = 'LOG_FILE_PATH';

-- 查看告警日志
-- 日志文件通常在 $DM_HOME/log 目录下
```

### 连接问题

```sql
-- 查看当前连接
SELECT * FROM V$SESSIONS;

-- 查看连接数
SELECT COUNT(*) FROM V$SESSIONS;

-- 终止连接
ALTER SYSTEM KILL SESSION 'sid,serial#';

-- 查看锁
SELECT * FROM V$LOCK;
SELECT * FROM V$LOCKED_OBJECT;
```

### 性能问题

```sql
-- 查看慢查询
SELECT * FROM V$SQL WHERE elapsed_time > 1000000;

-- 查看表统计信息
SELECT * FROM USER_TAB_STATISTICS WHERE table_name = 'USERS';

-- 查看索引使用情况
SELECT * FROM USER_INDEXES WHERE table_name = 'USERS';
```

### 空间问题

```sql
-- 查看数据库大小
SELECT 
    tablespace_name,
    ROUND(SUM(bytes) / 1024 / 1024, 2) AS size_mb
FROM DBA_DATA_FILES
GROUP BY tablespace_name;

-- 查看表大小
SELECT 
    segment_name,
    ROUND(SUM(bytes) / 1024 / 1024, 2) AS size_mb
FROM USER_SEGMENTS
WHERE segment_type = 'TABLE'
GROUP BY segment_name
ORDER BY size_mb DESC;
```

---

## 学习资源

- [达梦数据库官方网站](https://www.dameng.com/)
- [达梦数据库文档中心](https://eco.dameng.com/document/)
- [达梦数据库社区](https://eco.dameng.com/)
- [达梦数据库技术博客](https://blog.dameng.com/)

---

## 💡 常用命令速查

```sql
-- 数据库操作
SELECT * FROM V$DATABASE;
SELECT SYS_CONTEXT('USERENV', 'DB_NAME') FROM DUAL;

-- 表操作
SELECT * FROM USER_TABLES;
DESC table_name;
SELECT * FROM USER_TAB_COLUMNS WHERE table_name = 'USERS';

-- 查询
SELECT * FROM table;
EXPLAIN SELECT * FROM table;

-- 索引
SELECT * FROM USER_INDEXES WHERE table_name = 'USERS';
CREATE INDEX idx ON table(column);
DROP INDEX idx;

-- 用户和权限
SELECT * FROM DBA_USERS;
CREATE USER user IDENTIFIED BY password;
GRANT privilege TO user;
REVOKE privilege FROM user;
```

---

## 🔧 实用脚本

### 备份脚本

```bash
#!/bin/bash
# 备份脚本
BACKUP_DIR="/backup/dameng"
DATE=$(date +%Y%m%d_%H%M%S)
DB_USER="SYSDBA"
DB_PASS="SYSDBA"
DB_HOST="localhost"
DB_PORT="5236"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 逻辑备份
dexp $DB_USER/$DB_PASS@$DB_HOST:$DB_PORT FILE=$BACKUP_DIR/backup_${DATE}.dmp FULL=Y

# 删除 7 天前的备份
find $BACKUP_DIR -name "*.dmp" -mtime +7 -delete
```

### 监控脚本

```sql
-- 查看数据库统计信息
SELECT 
    'Connections' AS Metric,
    COUNT(*) AS Value
FROM V$SESSIONS
UNION ALL
SELECT 
    'Active Sessions',
    COUNT(*)
FROM V$SESSIONS
WHERE status = 'ACTIVE'
UNION ALL
SELECT 
    'Database Size (MB)',
    ROUND(SUM(bytes) / 1024 / 1024, 2)
FROM DBA_DATA_FILES;
```
