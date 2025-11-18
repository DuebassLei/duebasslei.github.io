---
title: Kafka实用操作笔记
description: Kafka基础核心知识及常用操作整理
tag:
  - Kafka
  - 消息队列
  - 流处理
sidebar: true
outline: [2,3,4]
lastUpdated: true
---

## 📖 目录

- [Kafka 基础概念](#kafka-基础概念)
- [核心组件](#核心组件)
- [Producer（生产者）](#producer生产者)
- [Consumer（消费者）](#consumer消费者)
- [Topic 和 Partition](#topic-和-partition)
- [Consumer Group](#consumer-group)
- [常用命令](#常用命令)
- [配置管理](#配置管理)
- [Kafka Streams](#kafka-streams)
- [最佳实践](#最佳实践)

---

## Kafka 基础概念

### 什么是 Kafka？

Apache Kafka 是一个分布式流处理平台，用于构建实时数据管道和流式应用程序。它具有高吞吐量、可扩展性和容错性。

### 核心特性

- **高吞吐量**：支持百万级消息处理
- **可扩展性**：水平扩展，添加节点即可增加容量
- **持久化**：消息持久化到磁盘
- **容错性**：通过副本机制保证高可用
- **实时性**：低延迟消息传递
- **分布式**：支持多节点集群

### 应用场景

- **消息队列**：解耦系统，异步处理
- **日志收集**：集中式日志管理
- **流处理**：实时数据处理和分析
- **事件溯源**：记录所有事件变更
- **指标收集**：监控和指标数据收集

---

## 核心组件

### Broker（代理）

Kafka 集群中的服务器节点，负责存储和转发消息。

```bash
# 启动 Kafka Broker
bin/kafka-server-start.sh config/server.properties
```

### Topic（主题）

消息的逻辑分类，类似于数据库中的表。

### Partition（分区）

Topic 的物理分割，每个 Partition 是一个有序的消息队列。

### Producer（生产者）

向 Kafka Topic 发送消息的客户端。

### Consumer（消费者）

从 Kafka Topic 读取消息的客户端。

### Consumer Group（消费者组）

一组共同消费一个 Topic 的 Consumer 集合。

### Offset（偏移量）

消息在 Partition 中的位置标识。

---

## Producer（生产者）

### Java Producer 示例

```java
import org.apache.kafka.clients.producer.*;
import java.util.Properties;

// Producer 配置
Properties props = new Properties();
props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, 
          "org.apache.kafka.common.serialization.StringSerializer");
props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, 
          "org.apache.kafka.common.serialization.StringSerializer");
props.put(ProducerConfig.ACKS_CONFIG, "all");  // 等待所有副本确认
props.put(ProducerConfig.RETRIES_CONFIG, 3);
props.put(ProducerConfig.BATCH_SIZE_CONFIG, 16384);
props.put(ProducerConfig.LINGER_MS_CONFIG, 1);
props.put(ProducerConfig.BUFFER_MEMORY_CONFIG, 33554432);

// 创建 Producer
KafkaProducer<String, String> producer = new KafkaProducer<>(props);

// 发送消息
ProducerRecord<String, String> record = 
    new ProducerRecord<>("my-topic", "key", "value");

producer.send(record, new Callback() {
    @Override
    public void onCompletion(RecordMetadata metadata, Exception exception) {
        if (exception == null) {
            System.out.printf("Message sent: topic=%s, partition=%d, offset=%d%n",
                metadata.topic(), metadata.partition(), metadata.offset());
        } else {
            exception.printStackTrace();
        }
    }
});

// 关闭 Producer
producer.close();
```

### 事务性 Producer

```java
Properties props = new Properties();
props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
props.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, true);
props.put(ProducerConfig.TRANSACTIONAL_ID_CONFIG, "prod-1");
props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, 
          "org.apache.kafka.common.serialization.StringSerializer");
props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, 
          "org.apache.kafka.common.serialization.StringSerializer");

KafkaProducer<String, String> producer = new KafkaProducer<>(props);

// 初始化事务
producer.initTransactions();

try {
    // 开始事务
    producer.beginTransaction();
    
    // 发送多条消息（原子性）
    producer.send(new ProducerRecord<>("topic1", "key1", "value1"));
    producer.send(new ProducerRecord<>("topic2", "key2", "value2"));
    
    // 提交事务
    producer.commitTransaction();
} catch (Exception e) {
    // 回滚事务
    producer.abortTransaction();
}

producer.close();
```

### Producer 配置参数

```java
// 关键配置
props.put(ProducerConfig.ACKS_CONFIG, "all");  // 0, 1, all
props.put(ProducerConfig.RETRIES_CONFIG, 3);
props.put(ProducerConfig.MAX_IN_FLIGHT_REQUESTS_PER_CONNECTION, 5);
props.put(ProducerConfig.COMPRESSION_TYPE_CONFIG, "snappy");  // gzip, snappy, lz4
props.put(ProducerConfig.BATCH_SIZE_CONFIG, 16384);
props.put(ProducerConfig.LINGER_MS_CONFIG, 10);
```

---

## Consumer（消费者）

### Java Consumer 示例

```java
import org.apache.kafka.clients.consumer.*;
import org.apache.kafka.common.TopicPartition;
import java.time.Duration;
import java.util.*;

// Consumer 配置
Properties props = new Properties();
props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
props.put(ConsumerConfig.GROUP_ID_CONFIG, "my-consumer-group");
props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, 
          "org.apache.kafka.common.serialization.StringDeserializer");
props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, 
          "org.apache.kafka.common.serialization.StringDeserializer");
props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");  // earliest, latest, none
props.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, false);  // 手动提交 offset
props.put(ConsumerConfig.MAX_POLL_RECORDS_CONFIG, 500);

// 创建 Consumer
KafkaConsumer<String, String> consumer = new KafkaConsumer<>(props);

// 订阅 Topic
consumer.subscribe(Collections.singletonList("my-topic"));

try {
    while (true) {
        // 拉取消息
        ConsumerRecords<String, String> records = consumer.poll(Duration.ofSeconds(1));
        
        for (ConsumerRecord<String, String> record : records) {
            System.out.printf("offset=%d, key=%s, value=%s%n",
                record.offset(), record.key(), record.value());
            
            // 处理消息
            processRecord(record);
        }
        
        // 手动提交 offset
        consumer.commitSync();
    }
} finally {
    consumer.close();
}
```

### 手动分配 Partition

```java
KafkaConsumer<String, String> consumer = new KafkaConsumer<>(props);

// 手动分配 Partition（不使用 Consumer Group）
TopicPartition partition0 = new TopicPartition("my-topic", 0);
TopicPartition partition1 = new TopicPartition("my-topic", 1);
consumer.assign(Arrays.asList(partition0, partition1));

// 定位到特定 offset
consumer.seek(partition0, 100L);

// 定位到开始
consumer.seekToBeginning(Collections.singletonList(partition0));

// 定位到结束
consumer.seekToEnd(Collections.singletonList(partition1));

// 按时间戳定位
Map<TopicPartition, Long> timestamps = new HashMap<>();
timestamps.put(partition0, System.currentTimeMillis() - 3600000);  // 1小时前
Map<TopicPartition, OffsetAndTimestamp> offsets = consumer.offsetsForTimes(timestamps);
offsets.forEach((tp, offsetAndTimestamp) -> {
    if (offsetAndTimestamp != null) {
        consumer.seek(tp, offsetAndTimestamp.offset());
    }
});
```

### Consumer 配置参数

```java
props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
props.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, true);
props.put(ConsumerConfig.AUTO_COMMIT_INTERVAL_MS_CONFIG, 5000);
props.put(ConsumerConfig.SESSION_TIMEOUT_MS_CONFIG, 30000);
props.put(ConsumerConfig.MAX_POLL_RECORDS_CONFIG, 500);
props.put(ConsumerConfig.MAX_POLL_INTERVAL_MS_CONFIG, 300000);
props.put(ConsumerConfig.FETCH_MIN_BYTES_CONFIG, 1);
props.put(ConsumerConfig.FETCH_MAX_WAIT_MS_CONFIG, 500);
```

---

## Topic 和 Partition

### 创建 Topic

```bash
# 创建 Topic
bin/kafka-topics.sh --bootstrap-server localhost:9092 \
  --create \
  --topic my-topic \
  --partitions 3 \
  --replication-factor 2

# 查看 Topic 列表
bin/kafka-topics.sh --bootstrap-server localhost:9092 --list

# 查看 Topic 详情
bin/kafka-topics.sh --bootstrap-server localhost:9092 \
  --describe \
  --topic my-topic

# 修改 Partition 数量
bin/kafka-topics.sh --bootstrap-server localhost:9092 \
  --alter \
  --topic my-topic \
  --partitions 5

# 删除 Topic
bin/kafka-topics.sh --bootstrap-server localhost:9092 \
  --delete \
  --topic my-topic
```

### Topic 配置

```bash
# 创建带配置的 Topic
bin/kafka-topics.sh --bootstrap-server localhost:9092 \
  --create \
  --topic my-topic \
  --partitions 3 \
  --replication-factor 2 \
  --config retention.ms=86400000 \
  --config cleanup.policy=delete

# 修改 Topic 配置
bin/kafka-configs.sh --bootstrap-server localhost:9092 \
  --alter \
  --entity-type topics \
  --entity-name my-topic \
  --add-config retention.ms=172800000

# 查看 Topic 配置
bin/kafka-configs.sh --bootstrap-server localhost:9092 \
  --describe \
  --entity-type topics \
  --entity-name my-topic
```

### 使用 Admin API 管理 Topic

```java
import org.apache.kafka.clients.admin.*;
import java.util.*;

Properties props = new Properties();
props.put(AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");

try (Admin admin = Admin.create(props)) {
    // 创建 Topic
    NewTopic newTopic = new NewTopic("my-topic", 3, (short) 2);
    CreateTopicsResult result = admin.createTopics(
        Collections.singleton(newTopic));
    result.all().get();
    
    // 列出所有 Topic
    ListTopicsResult listTopics = admin.listTopics();
    Set<String> topics = listTopics.names().get();
    
    // 描述 Topic
    DescribeTopicsResult describeTopics = admin.describeTopics(
        Collections.singleton("my-topic"));
    TopicDescription description = describeTopics.allTopicNames().get()
        .get("my-topic");
    
    // 删除 Topic
    DeleteTopicsResult deleteResult = admin.deleteTopics(
        Collections.singleton("my-topic"));
    deleteResult.all().get();
}
```

---

## Consumer Group

### Consumer Group 概念

- **负载均衡**：多个 Consumer 共同消费一个 Topic
- **容错性**：Consumer 故障时自动重新分配 Partition
- **Offset 管理**：Group 级别的 Offset 提交

### 管理 Consumer Group

```bash
# 列出所有 Consumer Group
bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 --list

# 查看 Consumer Group 详情
bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 \
  --describe \
  --group my-consumer-group

# 查看 Group 的 Offset 信息
bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 \
  --describe \
  --group my-consumer-group \
  --state

# 重置 Consumer Group Offset
bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 \
  --group my-consumer-group \
  --topic my-topic \
  --reset-offsets \
  --to-earliest \
  --execute

# 删除 Consumer Group
bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 \
  --delete \
  --group my-consumer-group
```

### 使用 Admin API 管理 Consumer Group

```java
try (Admin admin = Admin.create(props)) {
    // 列出 Consumer Group
    ListConsumerGroupsResult listGroups = admin.listConsumerGroups();
    Collection<ConsumerGroupListing> groups = listGroups.all().get();
    
    // 描述 Consumer Group
    String groupId = "my-consumer-group";
    DescribeConsumerGroupsResult describeResult = 
        admin.describeConsumerGroups(Collections.singleton(groupId));
    ConsumerGroupDescription groupDescription = 
        describeResult.all().get().get(groupId);
    
    // 查看 Group Offset
    ListConsumerGroupOffsetsResult offsetsResult = 
        admin.listConsumerGroupOffsets(groupId);
    Map<TopicPartition, OffsetAndMetadata> offsets = 
        offsetsResult.partitionsToOffsetAndMetadata().get();
    
    // 重置 Offset
    Map<TopicPartition, OffsetAndMetadata> offsetsToAlter = new HashMap<>();
    offsetsToAlter.put(new TopicPartition("my-topic", 0), 
                      new OffsetAndMetadata(100L));
    admin.alterConsumerGroupOffsets(groupId, offsetsToAlter).all().get();
    
    // 删除 Consumer Group
    admin.deleteConsumerGroups(Collections.singleton(groupId)).all().get();
}
```

---

## 常用命令

### 控制台 Producer

```bash
# 发送消息
bin/kafka-console-producer.sh --bootstrap-server localhost:9092 \
  --topic my-topic

# 指定 Key
bin/kafka-console-producer.sh --bootstrap-server localhost:9092 \
  --topic my-topic \
  --property "parse.key=true" \
  --property "key.separator=:"
```

### 控制台 Consumer

```bash
# 消费消息
bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 \
  --topic my-topic

# 从开始消费
bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 \
  --topic my-topic \
  --from-beginning

# 指定 Consumer Group
bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 \
  --topic my-topic \
  --group my-group

# 显示 Key 和 Value
bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 \
  --topic my-topic \
  --property print.key=true \
  --property print.value=true \
  --property key.separator=":"
```

### 查看消息

```bash
# 查看 Topic 中的消息（不消费）
bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 \
  --topic my-topic \
  --from-beginning \
  --max-messages 10
```

---

## 配置管理

### Broker 配置

```properties
# server.properties

# Broker ID
broker.id=0

# 监听地址
listeners=PLAINTEXT://localhost:9092

# 日志目录
log.dirs=/tmp/kafka-logs

# Topic 默认分区数
num.partitions=3

# 默认副本数
default.replication.factor=2

# 日志保留时间（毫秒）
log.retention.hours=168

# 日志保留大小
log.retention.bytes=1073741824

# 日志段大小
log.segment.bytes=1073741824

# Zookeeper 连接（如果使用）
zookeeper.connect=localhost:2181
```

### 动态修改配置

```bash
# 修改 Broker 配置
bin/kafka-configs.sh --bootstrap-server localhost:9092 \
  --alter \
  --entity-type brokers \
  --entity-name 1 \
  --add-config num.io.threads=5

# 查看 Broker 配置
bin/kafka-configs.sh --bootstrap-server localhost:9092 \
  --describe \
  --entity-type brokers \
  --entity-name 1
```

---

## Kafka Streams

### 基本概念

Kafka Streams 是用于构建流处理应用程序的客户端库。

### WordCount 示例

```java
import org.apache.kafka.streams.*;
import org.apache.kafka.streams.kstream.*;
import java.util.Arrays;
import java.util.Properties;

Properties props = new Properties();
props.put(StreamsConfig.APPLICATION_ID_CONFIG, "wordcount-app");
props.put(StreamsConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
props.put(StreamsConfig.DEFAULT_KEY_SERDE_CLASS_CONFIG, 
          Serdes.String().getClass());
props.put(StreamsConfig.DEFAULT_VALUE_SERDE_CLASS_CONFIG, 
          Serdes.String().getClass());

StreamsBuilder builder = new StreamsBuilder();

// 从输入 Topic 读取
KStream<String, String> textLines = builder.stream("streams-plaintext-input");

// 处理：分割单词并计数
KTable<String, Long> wordCounts = textLines
    .flatMapValues(value -> Arrays.asList(value.toLowerCase().split("\\W+")))
    .groupBy((key, word) -> word)
    .count();

// 写入输出 Topic
wordCounts.toStream().to("streams-wordcount-output", 
    Produced.with(Serdes.String(), Serdes.Long()));

KafkaStreams streams = new KafkaStreams(builder.build(), props);
streams.start();

// 添加关闭钩子
Runtime.getRuntime().addShutdownHook(new Thread(streams::close));
```

### Streams 配置

```java
props.put(StreamsConfig.APPLICATION_ID_CONFIG, "my-streams-app");
props.put(StreamsConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
props.put(StreamsConfig.DEFAULT_KEY_SERDE_CLASS_CONFIG, 
          Serdes.String().getClass());
props.put(StreamsConfig.DEFAULT_VALUE_SERDE_CLASS_CONFIG, 
          Serdes.String().getClass());
props.put(StreamsConfig.COMMIT_INTERVAL_MS_CONFIG, 30000);
props.put(StreamsConfig.CACHE_MAX_BYTES_BUFFERING_CONFIG, 10485760);
props.put(StreamsConfig.NUM_STANDBY_REPLICAS_CONFIG, 1);
```

---

## 最佳实践

### Producer 最佳实践

- **批量发送**：合理设置 `batch.size` 和 `linger.ms`
- **压缩**：使用压缩减少网络传输（snappy、gzip、lz4）
- **重试机制**：设置合理的重试次数和重试间隔
- **幂等性**：启用 `enable.idempotence` 保证消息不重复
- **事务**：需要跨 Topic 原子性时使用事务

```java
// 推荐配置
props.put(ProducerConfig.ACKS_CONFIG, "all");
props.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, true);
props.put(ProducerConfig.COMPRESSION_TYPE_CONFIG, "snappy");
props.put(ProducerConfig.BATCH_SIZE_CONFIG, 32768);
props.put(ProducerConfig.LINGER_MS_CONFIG, 10);
```

### Consumer 最佳实践

- **批量处理**：合理设置 `max.poll.records`
- **手动提交**：关键业务使用手动提交 Offset
- **错误处理**：实现重试和死信队列机制
- **Rebalance 处理**：实现 `ConsumerRebalanceListener`
- **Offset 管理**：定期检查 Lag，及时处理积压

```java
// 推荐配置
props.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, false);
props.put(ConsumerConfig.MAX_POLL_RECORDS_CONFIG, 500);
props.put(ConsumerConfig.SESSION_TIMEOUT_MS_CONFIG, 30000);
props.put(ConsumerConfig.MAX_POLL_INTERVAL_MS_CONFIG, 300000);
```

### Topic 设计最佳实践

- **分区数**：根据吞吐量需求设置，通常为 Consumer 数量的倍数
- **副本数**：生产环境至少 3 个副本
- **保留策略**：根据业务需求设置 `retention.ms` 或 `retention.bytes`
- **压缩策略**：日志类数据使用 `delete`，需要保留历史使用 `compact`

```bash
# 推荐配置
bin/kafka-topics.sh --bootstrap-server localhost:9092 \
  --create \
  --topic my-topic \
  --partitions 6 \
  --replication-factor 3 \
  --config retention.ms=604800000 \
  --config cleanup.policy=delete
```

### 性能优化

- **批量操作**：Producer 和 Consumer 都使用批量操作
- **压缩**：启用压缩减少网络和存储开销
- **分区策略**：合理设计 Key 的分区策略
- **监控**：监控 Lag、吞吐量、延迟等指标

---

##  学习资源

- [Apache Kafka 官方文档](https://kafka.apache.org/documentation/)
- [Kafka 快速开始](https://kafka.apache.org/quickstart)
- [Kafka Streams 文档](https://kafka.apache.org/documentation/streams/)

---

## 💡 常用命令速查

```bash
# Topic 操作
bin/kafka-topics.sh --bootstrap-server localhost:9092 --list
bin/kafka-topics.sh --bootstrap-server localhost:9092 --create --topic my-topic --partitions 3 --replication-factor 2
bin/kafka-topics.sh --bootstrap-server localhost:9092 --describe --topic my-topic
bin/kafka-topics.sh --bootstrap-server localhost:9092 --delete --topic my-topic

# Consumer Group 操作
bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 --list
bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 --describe --group my-group
bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 --delete --group my-group

# 控制台工具
bin/kafka-console-producer.sh --bootstrap-server localhost:9092 --topic my-topic
bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic my-topic --from-beginning

# 配置管理
bin/kafka-configs.sh --bootstrap-server localhost:9092 --describe --entity-type topics --entity-name my-topic
```

---

## 🔧 故障排查

### 查看 Consumer Lag

```bash
bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 \
  --describe \
  --group my-group
```

### 检查 Topic 消息

```bash
# 查看最新消息
bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 \
  --topic my-topic \
  --max-messages 10

# 查看特定 Partition 的消息
bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 \
  --topic my-topic \
  --partition 0 \
  --offset 100
```

### 监控指标

- **Consumer Lag**：消费者延迟
- **Throughput**：吞吐量
- **Latency**：延迟
- **Error Rate**：错误率
