---
title: Oracle常用笔记
description: Oracle常用笔记整理
tag:
  - Oracle
sidebar: true
outline: [ 2,3,4 ]
lastUpdated: true
---

# Oracle数据库基础常用笔记

## Oracle 生成数字唯一ID

```sql
   SELECT TO_NUMBER(TO_CHAR(SYSTIMESTAMP, 'YYYYMMDDHH24MISSFF3')) ||
          FLOOR(DBMS_RANDOM.VALUE(100, 999))
   FROM DUAL;

```

### 使用示例

```sql
INSERT INTO users
    (id, name)
VALUES (TO_NUMBER(TO_CHAR(SYSTIMESTAMP, 'YYYYMMDDHH24MISSFF3')) -- 时间戳转数字（毫秒级） 
            || FLOOR(DBMS_RANDOM.VALUE(100, 999)), -- 追加3位随机数 
        'Bob');

```

## 查询oracle数据库锁表信息

### 查询锁表信息

```sql
-- 1. 查询锁表信息
SELECT l.session_id sid,
       s.serial#,
       l.locked_mode,
       l.oracle_username,
       l.os_user_name,
       s.machine,
       s.terminal,
       o.object_name,
       s.logon_time
FROM v$locked_object l,
     dba_objects o,
     v$session s
WHERE l.object_id = o.object_id
  AND l.session_id = s.sid
ORDER BY sid, s.serial#;
```

```sql
-- 2. 查询涉及锁表的SQL语句
SELECT s.sid, s.serial#, s.sql_id, sq.sql_text
FROM v$session s
         JOIN v$sql sq
              ON s.sql_id = sq.sql_id
WHERE s.sid = 769;

```

```sql
--3. 查询锁表会话的详细信息
SELECT s.sid,
       s.serial#,
       s.username,
       s.status,
       s.sql_id,
       sq.sql_text,
       s.event,
       s.wait_time,
       s.seconds_in_wait
FROM v$session s
         LEFT JOIN
     v$sql sq ON s.sql_id = sq.sql_id
WHERE s.sid IN (SELECT sid FROM v$lock WHERE block = 1);

```

```sql
-- 4. 终止锁表会话
ALTER
SYSTEM KILL SESSION 'sid,serial#';  

-- 示例
ALTER
SYSTEM KILL SESSION '769,28943';

```

## 表更新写法

### 方法一：update

```sql
update t1
set t1.money = (select t2.money
                from t2
                where t2.name = t1.name)
where exists (select 1 from t2 where t2.name = t1.name);

```

### 方法二：内联视图更新

```sql
update (
select t1.money money1, t2.money money2
from t1,
     t2
where t1.name = t2.name ) t
set t.money1 = t.money2;
```

注意：
括号里通过关联两表建立一个视图，set中设置好更新的字段。这个解决方法比写法较直观且执行速度快。但表t2的主键一定要在where条件中，并且是以“=”来关联被更新表，否则报错误：ORA-01779:
无法修改与非键值保存表对应的列。

### 方法三：merge into更新

```sql
merge into t1
    using (select t2.name, t2.money
           from t2) t
    on (t.name = t1.name)
    when matched then
        update set t1.money = t.money;
```

### 方法四：快速游标更新法

（参考：https://www.cnblogs.com/jingbf-BI/p/4909612.html）
begin for cr in (查询语句) loop –-循环 --更新语句（根据查询出来的结果集合） endloop; --结束循环 end;
oracle支持快速游标，不需要定义直接把游标写到for循环中，这样就方便了我们批量更新数据。再加上oracle的rowid物理字段（oracle默认给每个表都有rowid这个字段，并且是唯一索引），可以快速定位到要更新的记录上。
例：

```sql

begin
for cr in (select a.rowid,b.join_state
from t_join_situation a,t_people_info b
where a.people_number=b.people_number and
a.year='2011'and
a.city_number='M00000'and
a.town_number='M51000'
)
loop
update t_join_situation
set join_state=cr.join_state
where rowid = cr.rowid;
end loop;
end;
```

| 结论             | 方案                    | 建议      |
|----------------|-----------------------|---------|
| 标准update语法     | 单表更新或较简单的语句           | 采用此方案更优 |
| inline view更新法 | 两表关联且被更新表通过关联表主键关联的   | 采用此方案更优 |
| merge更新法       | 两表关联且被更新表不是通过关联表主键关联的 | 采用此方案更优 |
| 快速游标更新法        | 多表关联且逻辑复杂的            | 采用此方案更优 |

## 查询某个表被哪些存储过程引用

> 表在存储过程里处理过数据，但是不知道具体存储过程名，这样的话我们查找起来特别不方便，其实是有sql可以查询的，这样就能得到表在那个存储过程出现过。

### 查询语句

```sql
 SELECT *
 from user_source a
 where upper(text) like '%table_name%';


-- 示例
SELECT *
FROM USER_SOURCE A
WHERE UPPER(TEXT) LIKE '%MOBILE_NOTICE%';
```

table_name是我们的表名；
查询结果中TYPE为类型，可通过该字段区别结果。

## 统计重复数据

### 使用方法一：

查询出重复记录

```sql
select *
from 数据表
WHERE 重复记录字段 in (select 重复记录字段 from 数据表 group by 重复记录字段 having count(重复记录字段) > 1)

```

```sql
--查重
SELECT serv_id, count(1)
FROM t_test
group by serv_id
having count(1) > 1;

--去重
delete
from t_test a
where rowid < (select max(rowid) from t_test b where a.serv_id = b.serv_id);
```

### 使用方法二：

```sql
select *
from 表 a,
     (select 字段
      from 表
      group by 字段
      having count(1) > 1) b
where a.字段 = b.字段
```

```sql
   select *
   from t_test
   WHERE order_code in (select order_code
                        from t_test
                        group by order_code
                        having count(order_code) > 1)
```

## Oracle序列

### 创建序列

```sql
create sequence seq_a minvalue 1000 maxvalue 99999999 start with 1000 increment by 1 nocache;

```

### 查询序列

```sql
select seq_a.nextval
from dual;

```

### 为每张表生成对应的序列

```sql
-- 创建存储过程
create
or replace procedure p_createseq(tablename in varchar2)   
is   
strsql varchar2(500);
begin   
strsql
:='create sequence seq_'||tablename||' minvalue 1000 maxvalue 99999999 start with 1000 increment by 1 nocache';
execute immediate strsql;
end p_createseq;   
```

## 查询数据库表空间和大表

### 需要查看的表空间

```sql
--1.需要查看的表空间
SELECT a.tablespace_name,
       a.bytes                   AS total,
       b.bytes                   AS used,
       c.bytes                   AS free,
       (b.bytes * 100) / a.bytes AS "% USED",
       (c.bytes * 100) / a.bytes AS "% FREE"
FROM sys.sm$ts_avail a,
     sys.sm$ts_used b,
     sys.sm$ts_free c
WHERE a.tablespace_name = b.tablespace_name
  AND a.tablespace_name = c.tablespace_name;
```

### 查询需要查看的表空间大表

```sql
-- 查询需要查看的表空间大表 
select t.owner, t.segment_name, t.tablespace_name, bytes / 1024 / 1024 / 1024 as sizes, q.num_rows, t.segment_type
from dba_segments t
         left join dba_tables q
                   on t.segment_name = q.table_name
                       and t.owner = q.owner
where t.segment_type = 'TABLE'
  and t.tablespace_name = 'TEST_SPACE' --需要查看的表空间
order by 4 desc;
```

## 创建包体-PACKAGE

```sql
-- 测试创建包体
CREATE
OR REPLACE PACKAGE BODY  PKG_TEST IS
  -- 测试存储过程
  PROCEDURE PROC_TEST(DAY_ID IN VARCHAR2) IS
    --定义变量
    V_BEGIN_TIME DATE;
    V_ERROR
VARCHAR2(3000);
    V_SQL
VARCHAR2(30000);
    V_MONTH_ID
VARCHAR2(20);
    V_DAY_ID
VARCHAR2(20);
BEGIN
    -- 初始化变量
    V_BEGIN_TIME
:= SYSDATE;
    V_SQL
:= ' ';
BEGIN
    --初始化传入账期月份
      IF
DAY_ID IS NULL THEN
SELECT to_char(sysdate - 1, 'yyyymm')
INTO V_MONTH_ID
FROM DUAL;
ELSE
        V_MONTH_ID := TO_CHAR(TO_DATE(DAY_ID, 'YYYYMMDDHH24MISS'), 'YYYYMM');
END IF;

EXCEPTION
      WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE(DBMS_UTILITY.FORMAT_ERROR_BACKTRACE); -- 报错的行号
        DBMS_OUTPUT.PUT_LINE
(SQLCODE || ' : ' || SQLERRM); -- 报错的编号及内容
        V_ERROR
:= SUBSTR(SQLERRM, 1, 500);
END;

END  PROC_TEST;

END  PKG_TEST;
```

## 大表删除数据处理

### 查询待删除数据

```sql
-- 删除数据
-- delete xxl_job_log
-- 查询当天数据量
select count(1)
from xxl_job_log
WHERE trigger_time between
    to_DATE('2023-06-01 00:00:00', 'yyyy-mm-dd hh24:mi:ss') and
    to_DATE('2023-06-01 23:59:59', 'yyyy-mm-dd hh24:mi:ss') -- 替换为你的日期条件
  AND ROWNUM <= 10;

```

### 删除数据-rownum每次限制条数

> 注意:每次查询rownum指定条数，避免大表查不动问题,时间字段要加上索引。

```sql
-- 删除数据 每次查询指定条数删除
delete
xxl_job_log
WHERE trigger_time between
        to_DATE('2023-06-01 00:00:00', 'yyyy-mm-dd hh24:mi:ss') and
        to_DATE('2023-06-01 23:59:59', 'yyyy-mm-dd hh24:mi:ss') -- 替换为你的日期条件
      AND ROWNUM <=10;
```



#### 循环删除脚本
> 每次删除1000条数据，直到没有数据可删除。

```sql
DECLARE
v_count NUMBER;
  v_limit
NUMBER := 1000;--每次删除条数
BEGIN
  LOOP
    -- 每次删除1000条数据
DELETE
FROM xxl_jOB_LOG
WHERE trigger_time between
    to_DATE('2023-05-16 00:00:00', 'yyyy-mm-dd hh24:mi:ss') and
    to_DATE('2023-05-16 23:59:59', 'yyyy-mm-dd hh24:mi:ss') -- 替换为你的日期条件
  AND ROWNUM <= v_limit;

-- 获取待删除的记录数
SELECT COUNT(*)
INTO v_count
FROM xxl_jOB_LOG
WHERE trigger_time between
          to_DATE('2023-05-16 00:00:00', 'yyyy-mm-dd hh24:mi:ss') and
          to_DATE('2023-05-16 23:59:59', 'yyyy-mm-dd hh24:mi:ss');
-- 替换为你的日期条件

-- 如果没有数据可删除，则退出循环
IF
v_count = 0 THEN
      EXIT;
END IF;
    
    -- 提交事务
COMMIT;

-- 暂停一段时间，以免对数据库造成过大压力
DBMS_LOCK
.
SLEEP
(1);
END LOOP;
  
  -- 所有数据删除成功
  DBMS_OUTPUT.PUT_LINE
('All data deleted.');
END;

```
#### 循环删除脚本-按天删除
> 每次删除1天数据，直到没有数据可删除。

```sql
-- 清理删除数据
DECLARE
v_count  NUMBER;
  v_limit
NUMBER := 100;
  v_day_id
varchar(255) := '2023-06-01';
BEGIN
  LOOP
    -- 每次删除1000条数据
DELETE
FROM xxl_jOB_LOG
WHERE trigger_time between
    to_DATE(v_day_id || ' 00:00:00', 'yyyy-mm-dd hh24:mi:ss') and
    to_DATE(v_day_id || ' 23:59:59', 'yyyy-mm-dd hh24:mi:ss') -- 替换为你的日期条件
  AND ROWNUM <= v_limit;

-- 获取删除的记录数
SELECT COUNT(*)
INTO v_count
FROM xxl_jOB_LOG
WHERE trigger_time between
          to_DATE(v_day_id || ' 00:00:00', 'yyyy-mm-dd hh24:mi:ss') and
          to_DATE(v_day_id || ' 23:59:59', 'yyyy-mm-dd hh24:mi:ss');
-- 替换为你的日期条件

-- 待删除记录数
DBMS_OUTPUT
.
PUT_LINE
(v_count);
    -- 如果没有数据可删除，则退出循环
    IF
v_count = 0 THEN
      EXIT;
END IF;
  
    -- 提交事务
COMMIT;

-- 暂停一段时间，以免对数据库造成过大压力
DBMS_LOCK
.
SLEEP
(1);
END LOOP;

  -- 所有数据删除成功
  DBMS_OUTPUT.PUT_LINE
('All data deleted.');
END;
```


