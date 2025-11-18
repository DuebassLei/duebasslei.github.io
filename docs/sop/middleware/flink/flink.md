---
title: Flink实用操作笔记
description: Flink基础核心知识及常用操作整理
tag:
  - Flink
  - 流处理
  - 大数据
sidebar: true
outline: [2,3,4]
lastUpdated: true
---

## 📖 目录

- [Flink 基础概念](#flink-基础概念)
- [核心概念](#核心概念)
- [DataStream API](#datastream-api)
- [状态管理](#状态管理)
- [检查点（Checkpoint）](#检查点checkpoint)
- [窗口（Window）](#窗口window)
- [时间语义](#时间语义)
- [常用操作](#常用操作)
- [最佳实践](#最佳实践)

---

## Flink 基础概念

### 什么是 Flink？

Apache Flink 是一个分布式流处理框架，用于处理无界和有界数据流。它提供了低延迟、高吞吐量的流处理能力。

### 核心特性

- **流处理优先**：原生支持流处理
- **低延迟**：毫秒级延迟
- **高吞吐量**：支持大规模数据处理
- **状态管理**：强大的状态管理能力
- **容错性**：精确一次语义
- **事件时间**：支持事件时间处理

### 应用场景

- **实时数据分析**：实时数据流分析
- **实时监控**：系统实时监控和告警
- **实时推荐**：实时推荐系统
- **CEP**：复杂事件处理
- **ETL**：实时数据转换

### 安装和启动

```bash
# 下载 Flink
wget https://archive.apache.org/dist/flink/flink-1.18.0/flink-1.18.0-bin-scala_2.12.tgz
tar -xzf flink-1.18.0-bin-scala_2.12.tgz
cd flink-1.18.0

# 启动集群
./bin/start-cluster.sh

# 停止集群
./bin/stop-cluster.sh

# 访问 Web UI
# http://localhost:8081
```

---

## 核心概念

### DataStream

无界数据流，Flink 的基本数据抽象。

### DataSet

有界数据集（批处理），Flink 1.12 后推荐使用 DataStream API。

### Operator

数据流上的操作，如 map、filter、keyBy 等。

### Task

执行算子的基本单位。

### Parallelism

并行度，算子并行执行的任务数。

### Watermark

事件时间的进度标记，用于处理乱序数据。

---

## DataStream API

### 创建执行环境

```java
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;

// 创建流执行环境
StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();

// 设置并行度
env.setParallelism(4);
```

### 数据源

```java
// 从集合创建
DataStream<String> stream = env.fromCollection(Arrays.asList("a", "b", "c"));

// 从文件创建
DataStream<String> stream = env.readTextFile("file:///path/to/file");

// 从 Socket 创建
DataStream<String> stream = env.socketTextStream("localhost", 9999);

// 从 Kafka 创建
Properties props = new Properties();
props.setProperty("bootstrap.servers", "localhost:9092");
props.setProperty("group.id", "flink-consumer");

FlinkKafkaConsumer<String> consumer = new FlinkKafkaConsumer<>(
    "topic",
    new SimpleStringSchema(),
    props
);
DataStream<String> stream = env.addSource(consumer);
```

### 转换操作

```java
// Map
DataStream<Integer> mapped = stream.map(s -> s.length());

// Filter
DataStream<String> filtered = stream.filter(s -> s.startsWith("a"));

// FlatMap
DataStream<String> flatMapped = stream.flatMap((String value, Collector<String> out) -> {
    for (String word : value.split(" ")) {
        out.collect(word);
    }
});

// KeyBy
KeyedStream<String, String> keyed = stream.keyBy(s -> s.substring(0, 1));

// Reduce
DataStream<Integer> reduced = keyed.reduce((a, b) -> a + b);
```

### 数据输出

```java
// 输出到控制台
stream.print();

// 输出到文件
stream.writeAsText("file:///path/to/output");

// 输出到 Kafka
FlinkKafkaProducer<String> producer = new FlinkKafkaProducer<>(
    "topic",
    new SimpleStringSchema(),
    props
);
stream.addSink(producer);
```

---

## 状态管理

### 状态类型

#### 1. ValueState

```java
public class CountFunction extends RichFlatMapFunction<String, Tuple2<String, Integer>> {
    private transient ValueState<Integer> count;
    
    @Override
    public void open(Configuration config) {
        ValueStateDescriptor<Integer> descriptor =
            new ValueStateDescriptor<>("count", Integer.class);
        count = getRuntimeContext().getState(descriptor);
    }
    
    @Override
    public void flatMap(String value, Collector<Tuple2<String, Integer>> out) throws Exception {
        Integer currentCount = count.value();
        if (currentCount == null) {
            currentCount = 0;
        }
        currentCount++;
        count.update(currentCount);
        out.collect(new Tuple2<>(value, currentCount));
    }
}
```

#### 2. ListState

```java
ListStateDescriptor<String> descriptor = new ListStateDescriptor<>("list", String.class);
ListState<String> listState = getRuntimeContext().getListState(descriptor);
```

#### 3. MapState

```java
MapStateDescriptor<String, Integer> descriptor = 
    new MapStateDescriptor<>("map", String.class, Integer.class);
MapState<String, Integer> mapState = getRuntimeContext().getMapState(descriptor);
```

### 状态后端

```java
// HashMapStateBackend（内存）
env.setStateBackend(new HashMapStateBackend());

// EmbeddedRocksDBStateBackend（RocksDB）
EmbeddedRocksDBStateBackend rocksDBStateBackend = new EmbeddedRocksDBStateBackend(true);
rocksDBStateBackend.setDbStoragePath("/flink/rocksdb-storage");
env.setStateBackend(rocksDBStateBackend);
```

---

## 检查点（Checkpoint）

### 启用检查点

```java
// 启用检查点
env.enableCheckpointing(60000); // 60秒

// 配置检查点
CheckpointConfig checkpointConfig = env.getCheckpointConfig();
checkpointConfig.setCheckpointingMode(CheckpointingMode.EXACTLY_ONCE);
checkpointConfig.setMinPauseBetweenCheckpoints(500);
checkpointConfig.setCheckpointTimeout(600000);
checkpointConfig.setMaxConcurrentCheckpoints(1);
checkpointConfig.enableExternalizedCheckpoints(
    CheckpointConfig.ExternalizedCheckpointCleanup.RETAIN_ON_CANCELLATION
);

// 设置检查点存储
checkpointConfig.setCheckpointStorage("hdfs://namenode:9000/flink/checkpoints");
```

### 保存点（Savepoint）

```bash
# 创建保存点
flink savepoint <jobId> <savepointPath>

# 从保存点恢复
flink run -s <savepointPath> <jarFile>

# 取消作业并创建保存点
flink cancel -s <savepointPath> <jobId>
```

---

## 窗口（Window）

### 时间窗口

```java
// 滚动时间窗口
stream.keyBy(...)
    .window(TumblingEventTimeWindows.of(Time.seconds(5)))
    .sum("value");

// 滑动时间窗口
stream.keyBy(...)
    .window(SlidingEventTimeWindows.of(Time.seconds(10), Time.seconds(5)))
    .sum("value");

// 会话窗口
stream.keyBy(...)
    .window(EventTimeSessionWindows.withGap(Time.minutes(5)))
    .sum("value");
```

### 计数窗口

```java
// 滚动计数窗口
stream.keyBy(...)
    .countWindow(100)
    .sum("value");

// 滑动计数窗口
stream.keyBy(...)
    .countWindow(100, 10)
    .sum("value");
```

### 窗口函数

```java
// 增量聚合
stream.keyBy(...)
    .window(...)
    .aggregate(new AggregateFunction<Event, Long, Long>() {
        @Override
        public Long createAccumulator() {
            return 0L;
        }
        
        @Override
        public Long add(Event value, Long accumulator) {
            return accumulator + 1;
        }
        
        @Override
        public Long getResult(Long accumulator) {
            return accumulator;
        }
        
        @Override
        public Long merge(Long a, Long b) {
            return a + b;
        }
    });

// 全窗口函数
stream.keyBy(...)
    .window(...)
    .apply(new WindowFunction<Event, String, String, TimeWindow>() {
        @Override
        public void apply(String key, TimeWindow window, 
                         Iterable<Event> values, Collector<String> out) {
            // 处理窗口中的所有元素
        }
    });
```

---

## 时间语义

### 处理时间（Processing Time）

```java
env.setStreamTimeCharacteristic(TimeCharacteristic.ProcessingTime);
```

### 事件时间（Event Time）

```java
env.setStreamTimeCharacteristic(TimeCharacteristic.EventTime);

// 分配时间戳和生成 Watermark
stream.assignTimestampsAndWatermarks(
    WatermarkStrategy.<Event>forBoundedOutOfOrderness(Duration.ofSeconds(20))
        .withTimestampAssigner((event, timestamp) -> event.getTimestamp())
);
```

### 水印（Watermark）

```java
// 有序数据
stream.assignTimestampsAndWatermarks(
    WatermarkStrategy.<Event>forMonotonousTimestamps()
        .withTimestampAssigner((event, timestamp) -> event.getTimestamp())
);

// 乱序数据
stream.assignTimestampsAndWatermarks(
    WatermarkStrategy.<Event>forBoundedOutOfOrderness(Duration.ofSeconds(20))
        .withTimestampAssigner((event, timestamp) -> event.getTimestamp())
);
```

---

## 常用操作

### 连接（Join）

```java
// 窗口连接
stream1.join(stream2)
    .where(e1 -> e1.getKey())
    .equalTo(e2 -> e2.getKey())
    .window(TumblingEventTimeWindows.of(Time.seconds(5)))
    .apply(new JoinFunction<Event1, Event2, String>() {
        @Override
        public String join(Event1 first, Event2 second) {
            return first.getValue() + "-" + second.getValue();
        }
    });
```

### 侧输出（Side Output）

```java
// 定义侧输出标签
OutputTag<String> outputTag = new OutputTag<String>("side-output"){};

// 使用侧输出
SingleOutputStreamOperator<String> mainStream = stream
    .process(new ProcessFunction<String, String>() {
        @Override
        public void processElement(String value, Context ctx, Collector<String> out) {
            if (value.startsWith("ERROR")) {
                ctx.output(outputTag, value);
            } else {
                out.collect(value);
            }
        }
    });

// 获取侧输出流
DataStream<String> sideStream = mainStream.getSideOutput(outputTag);
```

---

## 最佳实践

### 性能优化

- **合理设置并行度**：根据数据量和资源设置
- **使用 KeyBy**：合理使用 KeyBy 进行数据分区
- **状态优化**：合理选择状态后端
- **检查点优化**：合理设置检查点间隔

### 容错设计

- **启用检查点**：生产环境必须启用
- **状态后端**：使用持久化状态后端
- **保存点**：定期创建保存点

### 时间处理

- **使用事件时间**：准确的时间语义
- **合理设置 Watermark**：根据数据延迟设置
- **处理延迟数据**：使用侧输出处理延迟数据

---

##  学习资源

- [Flink 官方文档](https://flink.apache.org/docs/)
- [Flink 中文文档](https://flink.apache.org/zh/docs/)
- [Flink 示例](https://github.com/apache/flink/tree/master/flink-examples)

---

## 💡 常用命令速查

```bash
# 提交作业
flink run -c com.example.MainClass app.jar

# 列出运行中的作业
flink list

# 取消作业
flink cancel <jobId>

# 查看作业详情
flink info <jobId>

# 创建保存点
flink savepoint <jobId> <savepointPath>

# 从保存点恢复
flink run -s <savepointPath> app.jar
```

