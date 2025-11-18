---
title: Spark实用操作笔记
description: Spark基础核心知识及常用操作整理
tag:
  - Spark
  - 大数据
  - 分布式计算
sidebar: true
outline: [2,3,4]
lastUpdated: true
---

## 📖 目录

- [Spark 基础概念](#spark-基础概念)
- [核心概念](#核心概念)
- [RDD（弹性分布式数据集）](#rdd弹性分布式数据集)
- [DataFrame](#dataframe)
- [Dataset](#dataset)
- [Spark SQL](#spark-sql)
- [Spark Streaming](#spark-streaming)
- [常用操作](#常用操作)
- [最佳实践](#最佳实践)

---

## Spark 基础概念

### 什么是 Spark？

Apache Spark 是一个快速、通用的集群计算系统，提供了高级 API 用于大规模数据处理。

### 核心特性

- **快速**：内存计算，比 Hadoop MapReduce 快 100 倍
- **易用**：支持 Java、Scala、Python、R
- **通用**：支持批处理、流处理、机器学习、图计算
- **容错性**：自动容错和恢复
- **可扩展性**：支持数千节点集群

### 应用场景

- **批处理**：大规模数据批处理
- **流处理**：实时数据流处理
- **机器学习**：大规模机器学习
- **图计算**：图分析和处理
- **SQL 分析**：结构化数据分析

### 安装和启动

```bash
# 下载 Spark
wget https://archive.apache.org/dist/spark/spark-3.5.0/spark-3.5.0-bin-hadoop3.tgz
tar -xzf spark-3.5.0-bin-hadoop3.tgz
cd spark-3.5.0-bin-hadoop3

# 启动 Spark Shell
./bin/spark-shell

# 启动 PySpark
./bin/pyspark

# 启动 Spark 集群
./sbin/start-master.sh
./sbin/start-worker.sh spark://localhost:7077
```

---

## 核心概念

### RDD（Resilient Distributed Dataset）

弹性分布式数据集，Spark 的基本数据抽象。

### DataFrame

以命名列组织的分布式数据集，类似关系型数据库的表。

### Dataset

类型安全的 DataFrame，结合了 RDD 和 DataFrame 的优点。

### SparkContext

Spark 应用的入口点。

### SparkSession

Spark SQL 的入口点，统一了 SparkContext、SQLContext 等。

### Driver

运行 main 函数的进程，负责创建 SparkContext。

### Executor

在集群节点上运行任务的进程。

---

## RDD（弹性分布式数据集）

### 创建 RDD

```scala
// 从集合创建
val rdd = sc.parallelize(Seq(1, 2, 3, 4, 5))

// 从文件创建
val rdd = sc.textFile("file:///path/to/file")

// 从 HDFS 创建
val rdd = sc.textFile("hdfs://namenode:9000/path/to/file")
```

```python
# Python
rdd = sc.parallelize([1, 2, 3, 4, 5])
rdd = sc.textFile("file:///path/to/file")
```

### 转换操作（Transformations）

```scala
// Map
val mapped = rdd.map(x => x * 2)

// Filter
val filtered = rdd.filter(x => x > 2)

// FlatMap
val flatMapped = rdd.flatMap(x => x.split(" "))

// Distinct
val distinct = rdd.distinct()

// Union
val union = rdd1.union(rdd2)

// Intersection
val intersection = rdd1.intersection(rdd2)

// Subtract
val subtract = rdd1.subtract(rdd2)

// Cartesian
val cartesian = rdd1.cartesian(rdd2)
```

### 行动操作（Actions）

```scala
// Collect
val result = rdd.collect()

// Count
val count = rdd.count()

// First
val first = rdd.first()

// Take
val take = rdd.take(10)

// Reduce
val sum = rdd.reduce((a, b) => a + b)

// Aggregate
val result = rdd.aggregate(0)(_ + _, _ + _)

// Foreach
rdd.foreach(println)
```

### Key-Value 操作

```scala
// Map to Pair
val pairs = rdd.map(x => (x, 1))

// GroupByKey
val grouped = pairs.groupByKey()

// ReduceByKey
val reduced = pairs.reduceByKey(_ + _)

// AggregateByKey
val aggregated = pairs.aggregateByKey(0)(_ + _, _ + _)

// SortByKey
val sorted = pairs.sortByKey()

// Join
val joined = rdd1.join(rdd2)

// LeftOuterJoin
val leftJoined = rdd1.leftOuterJoin(rdd2)

// RightOuterJoin
val rightJoined = rdd1.rightOuterJoin(rdd2)

// Cogroup
val cogrouped = rdd1.cogroup(rdd2)
```

---

## DataFrame

### 创建 DataFrame

```scala
import org.apache.spark.sql.SparkSession

val spark = SparkSession.builder()
  .appName("DataFrameExample")
  .getOrCreate()

// 从 RDD 创建
val df = spark.createDataFrame(rdd, schema)

// 从 JSON 创建
val df = spark.read.json("file:///path/to/file.json")

// 从 CSV 创建
val df = spark.read
  .option("header", "true")
  .option("inferSchema", "true")
  .csv("file:///path/to/file.csv")

// 从 Parquet 创建
val df = spark.read.parquet("file:///path/to/file.parquet")
```

```python
# Python
from pyspark.sql import SparkSession

spark = SparkSession.builder.appName("DataFrameExample").getOrCreate()

# 从 JSON 创建
df = spark.read.json("file:///path/to/file.json")

# 从 CSV 创建
df = spark.read.option("header", "true").csv("file:///path/to/file.csv")
```

### DataFrame 操作

```scala
// 选择列
df.select("name", "age")

// 过滤
df.filter(df("age") > 18)

// 分组聚合
df.groupBy("department").agg(avg("salary"), max("age"))

// 排序
df.orderBy(desc("age"))

// 连接
df1.join(df2, df1("id") === df2("id"), "inner")

// 去重
df.distinct()

// 添加列
df.withColumn("new_col", df("age") * 2)

// 删除列
df.drop("column_name")
```

```python
# Python
df.select("name", "age")
df.filter(df.age > 18)
df.groupBy("department").agg({"salary": "avg", "age": "max"})
df.orderBy(desc("age"))
df1.join(df2, df1.id == df2.id, "inner")
```

---

## Dataset

### 创建 Dataset

```scala
import spark.implicits._

case class Person(name: String, age: Int)

val people = Seq(Person("Alice", 30), Person("Bob", 25))
val ds = spark.createDataset(people)

// 从 DataFrame 转换
val ds = df.as[Person]
```

### Dataset 操作

```scala
// 类型安全的操作
ds.filter(_.age > 18)
ds.map(_.name)
ds.groupByKey(_.department).agg(avg(_.salary))
```

---

## Spark SQL

### 基本使用

```scala
// 注册临时表
df.createOrReplaceTempView("people")

// 执行 SQL
val result = spark.sql("SELECT name, age FROM people WHERE age > 18")
```

```python
# Python
df.createOrReplaceTempView("people")
result = spark.sql("SELECT name, age FROM people WHERE age > 18")
```

### 窗口函数

```scala
import org.apache.spark.sql.expressions.Window

val windowSpec = Window.partitionBy("department").orderBy(desc("salary"))

df.withColumn("rank", rank().over(windowSpec))
  .withColumn("dense_rank", dense_rank().over(windowSpec))
  .withColumn("row_number", row_number().over(windowSpec))
```

---

## Spark Streaming

### 基本使用

```scala
import org.apache.spark.streaming._

val ssc = new StreamingContext(sparkConf, Seconds(1))

// 从 Socket 接收数据
val lines = ssc.socketTextStream("localhost", 9999)

// 处理数据
val words = lines.flatMap(_.split(" "))
val pairs = words.map(word => (word, 1))
val wordCounts = pairs.reduceByKey(_ + _)

wordCounts.print()

ssc.start()
ssc.awaitTermination()
```

### Structured Streaming

```scala
import org.apache.spark.sql.streaming._

val df = spark.readStream
  .format("kafka")
  .option("kafka.bootstrap.servers", "localhost:9092")
  .option("subscribe", "topic")
  .load()

val query = df.writeStream
  .format("console")
  .outputMode("complete")
  .start()

query.awaitTermination()
```

---

## 常用操作

### 缓存

```scala
// 缓存 RDD
rdd.cache()
rdd.persist(StorageLevel.MEMORY_ONLY)

// 缓存 DataFrame
df.cache()

// 取消缓存
rdd.unpersist()
```

### 分区

```scala
// 重新分区
rdd.repartition(10)

// 合并分区
rdd.coalesce(5)

// 自定义分区
rdd.partitionBy(new HashPartitioner(10))
```

---

## 最佳实践

### 性能优化

- **合理分区**：避免数据倾斜
- **使用缓存**：复用计算结果
- **广播变量**：减少数据传输
- **使用 DataFrame**：比 RDD 性能更好

### 数据倾斜处理

- **增加随机前缀**：打散热点数据
- **使用自定义分区器**：均匀分布数据
- **两阶段聚合**：先局部聚合再全局聚合

### 内存管理

- **合理设置内存**：executor 和 driver 内存
- **使用序列化**：减少内存占用
- **及时释放缓存**：避免内存溢出

---

##  学习资源

- [Spark 官方文档](https://spark.apache.org/docs/latest/)
- [Spark 编程指南](https://spark.apache.org/docs/latest/rdd-programming-guide.html)
- [Spark SQL 指南](https://spark.apache.org/docs/latest/sql-programming-guide.html)

---

## 💡 常用命令速查

```bash
# 提交 Spark 作业
spark-submit --class com.example.MainClass app.jar

# 提交到集群
spark-submit --master spark://master:7077 --class com.example.MainClass app.jar

# 设置资源
spark-submit --executor-memory 4g --executor-cores 2 app.jar

# 查看作业
# http://localhost:8080
```

