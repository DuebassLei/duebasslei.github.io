---
title: RabbitMQ实用操作笔记
description: RabbitMQ基础核心知识及常用操作整理
tag:
  - RabbitMQ
  - 消息队列
  - AMQP
sidebar: true
outline: [2,3,4]
lastUpdated: true
---

## 📖 目录

- [RabbitMQ 基础概念](#rabbitmq-基础概念)
- [核心概念](#核心概念)
- [Exchange 类型](#exchange-类型)
- [连接和通道](#连接和通道)
- [Producer（生产者）](#producer生产者)
- [Consumer（消费者）](#consumer消费者)
- [队列和绑定](#队列和绑定)
- [消息确认](#消息确认)
- [常用命令](#常用命令)
- [最佳实践](#最佳实践)

---

## RabbitMQ 基础概念

### 什么是 RabbitMQ？

RabbitMQ 是一个开源的消息代理软件，实现了高级消息队列协议（AMQP）。它用于在分布式系统中传递消息，支持多种消息传递模式。

### 核心特性

- **可靠性**：支持消息持久化、确认机制
- **灵活的路由**：支持多种 Exchange 类型
- **集群支持**：支持高可用集群部署
- **管理界面**：提供 Web 管理界面
- **多协议支持**：支持 AMQP、MQTT、STOMP 等

### 应用场景

- **异步处理**：解耦系统，异步处理任务
- **应用解耦**：系统间通过消息通信
- **流量削峰**：缓冲突发流量
- **日志收集**：集中式日志处理
- **任务队列**：分布式任务调度

### 安装和启动

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install rabbitmq-server

# CentOS/RHEL
sudo yum install rabbitmq-server

# 启动服务
sudo systemctl start rabbitmq-server

# 停止服务
sudo systemctl stop rabbitmq-server

# 启用管理插件
sudo rabbitmq-plugins enable rabbitmq_management

# 访问管理界面
# http://localhost:15672
# 默认用户名/密码: guest/guest
```

---

## 核心概念

### Producer（生产者）

发送消息的应用程序。

### Consumer（消费者）

接收消息的应用程序。

### Queue（队列）

存储消息的缓冲区，类似于邮箱。

### Exchange（交换机）

接收生产者发送的消息，并根据路由规则将消息路由到队列。

### Binding（绑定）

连接 Exchange 和 Queue 的规则。

### Routing Key（路由键）

生产者发送消息时指定的键，用于路由消息。

### Connection（连接）

应用程序与 RabbitMQ 服务器之间的 TCP 连接。

### Channel（通道）

连接中的虚拟连接，用于执行操作。

---

## Exchange 类型

### 1. Direct Exchange（直连交换机）

路由键完全匹配时，消息被路由到队列。

```java
// 声明 Direct Exchange
channel.exchangeDeclare("direct_logs", "direct");

// 绑定队列
channel.queueBind(queueName, "direct_logs", "error");
channel.queueBind(queueName, "direct_logs", "warning");
```

### 2. Fanout Exchange（扇出交换机）

将消息路由到所有绑定的队列，忽略路由键。

```java
// 声明 Fanout Exchange
channel.exchangeDeclare("logs", "fanout");

// 绑定队列（路由键被忽略）
channel.queueBind(queueName, "logs", "");
```

### 3. Topic Exchange（主题交换机）

根据路由键模式匹配，将消息路由到队列。

```java
// 声明 Topic Exchange
channel.exchangeDeclare("topic_logs", "topic");

// 绑定队列（支持通配符）
channel.queueBind(queueName, "topic_logs", "*.error");
channel.queueBind(queueName, "topic_logs", "system.*");
```

**路由键模式**：

- `*`：匹配一个单词
- `#`：匹配零个或多个单词

### 4. Headers Exchange（头交换机）

根据消息头属性路由，忽略路由键。

```java
// 声明 Headers Exchange
channel.exchangeDeclare("headers_logs", "headers");

// 绑定队列（匹配头属性）
Map<String, Object> headers = new HashMap<>();
headers.put("x-match", "all");  // all 或 any
headers.put("level", "error");
headers.put("source", "system");
channel.queueBind(queueName, "headers_logs", "", headers);
```

---

## 连接和通道

### 创建连接

```java
import com.rabbitmq.client.ConnectionFactory;
import com.rabbitmq.client.Connection;

ConnectionFactory factory = new ConnectionFactory();
factory.setHost("localhost");
factory.setPort(5672);
factory.setUsername("guest");
factory.setPassword("guest");
factory.setVirtualHost("/");

Connection connection = factory.newConnection();
```

### 创建通道

```java
import com.rabbitmq.client.Channel;

Channel channel = connection.createChannel();
```

### 关闭连接

```java
channel.close();
connection.close();
```

---

## Producer（生产者）

### 基本发送消息

```java
// 声明队列
channel.queueDeclare("hello", false, false, false, null);

// 发送消息
String message = "Hello World!";
channel.basicPublish("", "hello", null, message.getBytes());
System.out.println(" [x] Sent '" + message + "'");
```

### 发送到 Exchange

```java
// 声明 Exchange
channel.exchangeDeclare("logs", "fanout");

// 发送消息
String message = "Hello World!";
channel.basicPublish("logs", "", null, message.getBytes());
```

### 消息持久化

```java
// 声明持久化队列
boolean durable = true;
channel.queueDeclare("task_queue", durable, false, false, null);

// 发送持久化消息
channel.basicPublish("", "task_queue",
    MessageProperties.PERSISTENT_TEXT_PLAIN,
    message.getBytes());
```

### 设置消息属性

```java
import com.rabbitmq.client.AMQP.BasicProperties;

BasicProperties props = new BasicProperties.Builder()
    .contentType("text/plain")
    .deliveryMode(2)  // 持久化
    .priority(5)
    .messageId("msg-001")
    .timestamp(new Date())
    .build();

channel.basicPublish("", "queue", props, message.getBytes());
```

---

## Consumer（消费者）

### 基本消费消息

```java
// 声明队列
channel.queueDeclare("hello", false, false, false, null);

// 创建消费者
DeliverCallback deliverCallback = (consumerTag, delivery) -> {
    String message = new String(delivery.getBody(), "UTF-8");
    System.out.println(" [x] Received '" + message + "'");
};

// 消费消息
channel.basicConsume("hello", true, deliverCallback, consumerTag -> {});
```

### 手动确认

```java
DeliverCallback deliverCallback = (consumerTag, delivery) -> {
    String message = new String(delivery.getBody(), "UTF-8");
    System.out.println(" [x] Received '" + message + "'");
    
    try {
        // 处理消息
        doWork(message);
    } finally {
        // 手动确认
        channel.basicAck(delivery.getEnvelope().getDeliveryTag(), false);
    }
};

boolean autoAck = false;
channel.basicConsume("task_queue", autoAck, deliverCallback, consumerTag -> {});
```

### 拒绝消息

```java
// 拒绝消息并重新入队
channel.basicNack(deliveryTag, false, true);

// 拒绝消息并丢弃
channel.basicNack(deliveryTag, false, false);

// 拒绝单条消息
channel.basicReject(deliveryTag, true);  // true=重新入队
```

### 预取数量

```java
// 设置预取数量（QoS）
int prefetchCount = 1;
channel.basicQos(prefetchCount);
```

---

## 队列和绑定

### 声明队列

```java
// 基本队列
channel.queueDeclare("hello", false, false, false, null);

// 持久化队列
boolean durable = true;
channel.queueDeclare("task_queue", durable, false, false, null);

// 排他队列（仅当前连接可见）
boolean exclusive = true;
channel.queueDeclare("exclusive_queue", false, exclusive, false, null);

// 自动删除队列（无消费者时删除）
boolean autoDelete = true;
channel.queueDeclare("temp_queue", false, false, autoDelete, null);
```

### 绑定队列到 Exchange

```java
// 绑定到 Direct Exchange
channel.queueBind(queueName, "direct_logs", "error");

// 绑定到 Fanout Exchange
channel.queueBind(queueName, "logs", "");

// 绑定到 Topic Exchange
channel.queueBind(queueName, "topic_logs", "*.error");
```

### 解绑队列

```java
channel.queueUnbind(queueName, "logs", "");
```

---

## 消息确认

### 发布确认（Publisher Confirms）

```java
// 启用发布确认
channel.confirmSelect();

// 等待确认
channel.waitForConfirms();

// 异步确认
channel.addConfirmListener((sequenceNumber, multiple) -> {
    // 消息已确认
}, (sequenceNumber, multiple) -> {
    // 消息被拒绝
});
```

### 消费者确认

```java
// 自动确认（不推荐）
boolean autoAck = true;
channel.basicConsume("queue", autoAck, deliverCallback, cancelCallback);

// 手动确认
boolean autoAck = false;
channel.basicConsume("queue", autoAck, deliverCallback, cancelCallback);

// 在回调中确认
channel.basicAck(delivery.getEnvelope().getDeliveryTag(), false);
```

---

## 常用命令

### 管理命令

```bash
# 启动服务
sudo systemctl start rabbitmq-server

# 停止服务
sudo systemctl stop rabbitmq-server

# 查看状态
sudo rabbitmqctl status

# 查看队列
sudo rabbitmqctl list_queues

# 查看 Exchange
sudo rabbitmqctl list_exchanges

# 查看绑定
sudo rabbitmqctl list_bindings

# 查看连接
sudo rabbitmqctl list_connections

# 查看通道
sudo rabbitmqctl list_channels

# 查看消费者
sudo rabbitmqctl list_consumers

# 清除队列
sudo rabbitmqctl purge_queue queue_name

# 删除队列
sudo rabbitmqctl delete_queue queue_name
```

### 用户管理

```bash
# 添加用户
sudo rabbitmqctl add_user username password

# 删除用户
sudo rabbitmqctl delete_user username

# 修改密码
sudo rabbitmqctl change_password username new_password

# 设置用户标签
sudo rabbitmqctl set_user_tags username administrator

# 设置权限
sudo rabbitmqctl set_permissions -p / username ".*" ".*" ".*"

# 查看用户
sudo rabbitmqctl list_users
```

### 集群管理

```bash
# 加入集群
sudo rabbitmqctl stop_app
sudo rabbitmqctl join_cluster rabbit@node1
sudo rabbitmqctl start_app

# 查看集群状态
sudo rabbitmqctl cluster_status

# 离开集群
sudo rabbitmqctl stop_app
sudo rabbitmqctl reset
sudo rabbitmqctl start_app
```

---

## 最佳实践

### 连接管理

- **复用连接**：一个应用程序使用一个连接
- **通道复用**：每个线程使用独立的通道
- **及时关闭**：使用完毕后关闭通道和连接

### 队列设计

- **持久化队列**：重要消息使用持久化队列
- **合理命名**：使用有意义的队列名称
- **设置 TTL**：为消息设置过期时间

### 消息处理

- **幂等性**：确保消息处理是幂等的
- **错误处理**：实现重试和死信队列
- **批量处理**：合理使用批量操作

### 性能优化

- **预取数量**：合理设置 QoS
- **消息大小**：避免发送过大的消息
- **连接池**：使用连接池管理连接

### 示例：完整的生产者

```java
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import com.rabbitmq.client.MessageProperties;

public class Producer {
    private static final String TASK_QUEUE = "task_queue";

    public static void main(String[] argv) throws Exception {
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost("localhost");
        
        try (Connection connection = factory.newConnection();
             Channel channel = connection.createChannel()) {
            
            // 声明持久化队列
            channel.queueDeclare(TASK_QUEUE, true, false, false, null);
            
            String message = String.join(" ", argv);
            
            // 发送持久化消息
            channel.basicPublish("", TASK_QUEUE,
                MessageProperties.PERSISTENT_TEXT_PLAIN,
                message.getBytes("UTF-8"));
            
            System.out.println(" [x] Sent '" + message + "'");
        }
    }
}
```

### 示例：完整的消费者

```java
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import com.rabbitmq.client.DeliverCallback;

public class Consumer {
    private static final String TASK_QUEUE = "task_queue";

    public static void main(String[] argv) throws Exception {
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost("localhost");
        
        Connection connection = factory.newConnection();
        Channel channel = connection.createChannel();
        
        // 声明队列
        channel.queueDeclare(TASK_QUEUE, true, false, false, null);
        
        // 设置预取数量
        channel.basicQos(1);
        
        DeliverCallback deliverCallback = (consumerTag, delivery) -> {
            String message = new String(delivery.getBody(), "UTF-8");
            
            System.out.println(" [x] Received '" + message + "'");
            try {
                doWork(message);
            } finally {
                // 手动确认
                channel.basicAck(delivery.getEnvelope().getDeliveryTag(), false);
            }
        };
        
        channel.basicConsume(TASK_QUEUE, false, deliverCallback, consumerTag -> {});
    }
    
    private static void doWork(String task) {
        // 模拟工作
        for (char ch : task.toCharArray()) {
            if (ch == '.') {
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException _ignored) {
                    Thread.currentThread().interrupt();
                }
            }
        }
    }
}
```

---

##  学习资源

- [RabbitMQ 官方文档](https://www.rabbitmq.com/documentation.html)
- [RabbitMQ 教程](https://www.rabbitmq.com/getstarted.html)
- [AMQP 协议](https://www.rabbitmq.com/amqp-0-9-1-reference.html)

---

## 💡 常用命令速查

```bash
# 服务管理
sudo systemctl start rabbitmq-server
sudo systemctl stop rabbitmq-server
sudo rabbitmqctl status

# 队列管理
sudo rabbitmqctl list_queues
sudo rabbitmqctl purge_queue queue_name
sudo rabbitmqctl delete_queue queue_name

# Exchange 管理
sudo rabbitmqctl list_exchanges
sudo rabbitmqctl list_bindings

# 用户管理
sudo rabbitmqctl add_user username password
sudo rabbitmqctl set_user_tags username administrator
sudo rabbitmqctl set_permissions -p / username ".*" ".*" ".*"

# 集群管理
sudo rabbitmqctl cluster_status
```
