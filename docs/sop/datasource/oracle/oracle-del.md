---
title: Oracle删除数据相关
description: Oracle删除数据相关记录
tag:
  - Oracle
sidebar: true
outline: [ 2,3,4 ]
lastUpdated: true
---

# 删除数据相关

## 大表数据清理
### 分批删除（Batch Delete） —— 最常用、最安全

原理：
每次只删一小部分（如 1000~10000 行），提交事务，释放资源。

示例代码（PL/SQL）：

```oracle
DECLARE
    v_batch_size   NUMBER := 5000; -- 每批删除行数
    v_deleted_rows NUMBER := 1;
BEGIN
    WHILE v_deleted_rows > 0
        LOOP
            DELETE
            FROM your_big_table
            WHERE create_time < DATE '2020-01-01'
              AND ROWNUM <= v_batch_size;

            v_deleted_rows := SQL%ROWCOUNT;
            COMMIT; -- 每批提交，释放 UNDO

            DBMS_LOCK.SLEEP(1); -- 可选：休眠1秒，减少系统压力
        END LOOP;
END;
/
```

优点：

- 不会撑爆 UNDO
- 可随时中断（Ctrl+C）
- 对业务影响小（短事务）

注意事项：

- WHERE 条件必须能高效走索引（否则全表扫描每批都慢）
- 建议在业务低峰期执行
- 监控 UNDO 表空间使用率：SELECT * FROM v$undostat;

## oracle数据delete误删怎么恢复

### 方法1：已 COMMIT？用 Flashback Query（闪回查询） 恢复（最常用）

> 已提交，但仍在 UNDO 保留期内（可通过闪回查询恢复）

> Oracle 的 UNDO 表空间会保留历史数据一段时间（由 UNDO_RETENTION 参数控制，默认 15 分钟~数小时，DBA 可调大至数天）。

:::tip
步骤
:::
#### 1.验证能否查到删除前的数据

```sql
-- 假设你在 10 分钟前误删了数据
SELECT COUNT(*)
FROM your_table AS OF TIMESTAMP (SYSTIMESTAMP - INTERVAL '10' MINUTE)
WHERE...; -- 可加上原 DELETE 的 WHERE 条件
```

如果返回 > 0，说明数据还在 UNDO 中，可以恢复！

#### 2.将历史数据重新插入（推荐方式）

```oracle
INSERT INTO your_table
SELECT *
FROM your_table
    AS OF TIMESTAMP (SYSTIMESTAMP - INTERVAL '10' MINUTE)
WHERE rowid IN (SELECT rowid
                FROM your_table
                    AS OF TIMESTAMP (SYSTIMESTAMP - INTERVAL '10' MINUTE)
                MINUS
                SELECT rowid
                FROM your_table -- 当前表中已不存在的行
);
COMMIT;
```

**注意：**

如果表有主键/唯一约束，确保不会重复插入；
更安全做法：先导出到临时表，人工核对后再插入。

#### ✅ 简化版（整表误删）：

```oracle
-- 1. 创建恢复用临时表
CREATE TABLE your_table_recover AS
SELECT *
FROM your_table AS OF TIMESTAMP (SYSTIMESTAMP - INTERVAL '10' MINUTE);

-- 2. 清空当前错误表（可选）
DELETE
FROM your_table;

-- 3. 恢复数据
INSERT INTO your_table
SELECT *
FROM your_table_recover;
COMMIT;

-- 4. 删除临时表
DROP TABLE your_table_recover;
```

### 方法2：使用 FLASHBACK TABLE（需提前开启行移动）

如果表开启了 行移动（Row Movement），可一键闪回整张表：

```oracle
-- 先启用行移动（如果未开启）
ALTER TABLE your_table
    ENABLE ROW MOVEMENT;

-- 闪回到 10 分钟前
FLASHBACK TABLE your_table TO TIMESTAMP (SYSTIMESTAMP - INTERVAL '10' MINUTE);
```

✅ 优点：操作简单，无需写 INSERT。

❌ 缺点：会覆盖这段时间内的所有变更（不只是 DELETE，还包括其他 UPDATE/INSERT）。
