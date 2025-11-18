---
title: Logstash实用操作笔记
description: Logstash基础核心知识及常用操作整理
tag:
  - Logstash
  - 日志处理
  - ELK
sidebar: true
outline: [2,3,4]
lastUpdated: true
---

## 📖 目录

- [Logstash 基础概念](#logstash-基础概念)
- [Pipeline 结构](#pipeline-结构)
- [Input 插件](#input-插件)
- [Filter 插件](#filter-插件)
- [Output 插件](#output-插件)
- [常用配置示例](#常用配置示例)
- [最佳实践](#最佳实践)

---

## Logstash 基础概念

### 什么是 Logstash？

Logstash 是一个服务器端数据处理管道，能够同时从多个来源采集数据、转换数据，然后将数据发送到指定的存储库。

### 核心特性

- **数据采集**：支持多种数据源
- **数据转换**：丰富的过滤插件
- **数据输出**：支持多种输出目标
- **实时处理**：实时数据流处理
- **可扩展性**：插件化架构

### 应用场景

- **日志收集**：集中式日志管理
- **数据转换**：数据格式转换和清洗
- **数据路由**：将数据路由到不同目标
- **实时监控**：实时数据处理和分析

### 安装和启动

```bash
# 下载 Logstash
wget https://artifacts.elastic.co/downloads/logstash/logstash-8.11.0-linux-x86_64.tar.gz
tar -xzf logstash-8.11.0-linux-x86_64.tar.gz
cd logstash-8.11.0

# 启动 Logstash
bin/logstash -e 'input { stdin{} } output { stdout{} }'

# 使用配置文件启动
bin/logstash -f config/logstash.conf

# 后台启动
bin/logstash -f config/logstash.conf --daemonize
```

---

## Pipeline 结构

### 基本结构

```ruby
input {
  # 输入插件
}

filter {
  # 过滤插件
}

output {
  # 输出插件
}
```

### 配置示例

```ruby
input {
  beats {
    port => 5044
  }
}

filter {
  grok {
    match => { "message" => "%{COMBINEDAPACHELOG}" }
  }
  geoip {
    source => "clientip"
  }
}

output {
  elasticsearch {
    hosts => ["localhost:9200"]
    index => "apache-logs-%{+YYYY.MM.dd}"
  }
}
```

---

## Input 插件

### File

```ruby
input {
  file {
    path => "/var/log/apache2/access.log"
    start_position => "beginning"
    sincedb_path => "/dev/null"
  }
}
```

### Beats

```ruby
input {
  beats {
    port => 5044
  }
}
```

### HTTP

```ruby
input {
  http {
    port => 8080
    codec => json
  }
}
```

### Kafka

```ruby
input {
  kafka {
    bootstrap_servers => "localhost:9092"
    topics => ["logs"]
    codec => json
  }
}
```

### TCP/UDP

```ruby
input {
  tcp {
    port => 5000
    codec => json_lines
  }
  
  udp {
    port => 5001
    codec => json
  }
}
```

### Redis

```ruby
input {
  redis {
    host => "localhost"
    port => 6379
    key => "logstash"
    data_type => "list"
  }
}
```

---

## Filter 插件

### Grok

```ruby
filter {
  grok {
    match => {
      "message" => "%{COMBINEDAPACHELOG}"
    }
  }
}

# 自定义模式
filter {
  grok {
    match => {
      "message" => "%{TIMESTAMP_ISO8601:timestamp} %{LOGLEVEL:level} %{GREEDYDATA:message}"
    }
  }
}
```

### Date

```ruby
filter {
  date {
    match => ["timestamp", "yyyy-MM-dd HH:mm:ss"]
    target => "@timestamp"
  }
}
```

### Mutate

```ruby
filter {
  mutate {
    # 添加字段
    add_field => { "new_field" => "new_value" }
    
    # 删除字段
    remove_field => ["old_field"]
    
    # 重命名字段
    rename => { "old_name" => "new_name" }
    
    # 转换类型
    convert => { "price" => "float" }
    
    # 替换字段值
    replace => { "status" => "active" }
    
    # 大小写转换
    uppercase => "field_name"
    lowercase => "field_name"
  }
}
```

### JSON

```ruby
filter {
  json {
    source => "message"
    target => "parsed"
  }
}
```

### GeoIP

```ruby
filter {
  geoip {
    source => "clientip"
    target => "geoip"
  }
}
```

### User Agent

```ruby
filter {
  useragent {
    source => "user_agent"
    target => "ua"
  }
}
```

### Dissect

```ruby
filter {
  dissect {
    mapping => {
      "message" => "%{timestamp} [%{level}] %{message}"
    }
  }
}
```

### KV

```ruby
filter {
  kv {
    field_split => "&"
    value_split => "="
    source => "query_string"
  }
}
```

---

## Output 插件

### Elasticsearch

```ruby
output {
  elasticsearch {
    hosts => ["localhost:9200"]
    index => "logs-%{+YYYY.MM.dd}"
    document_type => "_doc"
  }
}
```

### File

```ruby
output {
  file {
    path => "/var/log/logstash/output.log"
    codec => json_lines
  }
}
```

### Kafka

```ruby
output {
  kafka {
    bootstrap_servers => "localhost:9092"
    topic_id => "logs"
    codec => json
  }
}
```

### Redis

```ruby
output {
  redis {
    host => "localhost"
    port => 6379
    data_type => "list"
    key => "logstash"
  }
}
```

### HTTP

```ruby
output {
  http {
    url => "http://api.example.com/logs"
    http_method => "post"
    format => "json"
  }
}
```

### 条件输出

```ruby
output {
  if [level] == "error" {
    elasticsearch {
      hosts => ["localhost:9200"]
      index => "error-logs-%{+YYYY.MM.dd}"
    }
  } else {
    elasticsearch {
      hosts => ["localhost:9200"]
      index => "logs-%{+YYYY.MM.dd}"
    }
  }
}
```

---

## 常用配置示例

### Apache 日志处理

```ruby
input {
  file {
    path => "/var/log/apache2/access.log"
    start_position => "beginning"
  }
}

filter {
  grok {
    match => { "message" => "%{COMBINEDAPACHELOG}" }
  }
  
  date {
    match => ["timestamp", "dd/MMM/yyyy:HH:mm:ss Z"]
  }
  
  geoip {
    source => "clientip"
  }
  
  useragent {
    source => "agent"
    target => "user_agent"
  }
  
  mutate {
    convert => {
      "response" => "integer"
      "bytes" => "integer"
    }
  }
}

output {
  elasticsearch {
    hosts => ["localhost:9200"]
    index => "apache-logs-%{+YYYY.MM.dd}"
  }
}
```

### JSON 日志处理

```ruby
input {
  beats {
    port => 5044
  }
}

filter {
  json {
    source => "message"
  }
  
  date {
    match => ["@timestamp", "yyyy-MM-dd'T'HH:mm:ss.SSSZ"]
  }
  
  mutate {
    remove_field => ["host", "agent"]
  }
}

output {
  elasticsearch {
    hosts => ["localhost:9200"]
    index => "app-logs-%{+YYYY.MM.dd}"
  }
}
```

### 多输入多输出

```ruby
input {
  beats {
    port => 5044
    tags => ["beats"]
  }
  
  file {
    path => "/var/log/app.log"
    tags => ["file"]
  }
}

filter {
  if "beats" in [tags] {
    json {
      source => "message"
    }
  }
  
  if "file" in [tags] {
    grok {
      match => { "message" => "%{TIMESTAMP_ISO8601:timestamp} %{LOGLEVEL:level} %{GREEDYDATA:message}" }
    }
  }
}

output {
  if "beats" in [tags] {
    elasticsearch {
      hosts => ["localhost:9200"]
      index => "beats-logs-%{+YYYY.MM.dd}"
    }
  }
  
  if "file" in [tags] {
    elasticsearch {
      hosts => ["localhost:9200"]
      index => "file-logs-%{+YYYY.MM.dd}"
    }
  }
}
```

---

## 最佳实践

### 性能优化

- **批量处理**：合理设置 batch size
- **过滤顺序**：将最严格的过滤放在前面
- **条件过滤**：使用条件语句减少不必要的处理
- **字段选择**：只处理需要的字段

### 错误处理

```ruby
filter {
  grok {
    match => { "message" => "%{PATTERN:field}" }
    tag_on_failure => ["_grokparsefailure"]
  }
}

output {
  if "_grokparsefailure" in [tags] {
    file {
      path => "/var/log/logstash/errors.log"
    }
  }
}
```

### 配置管理

- **模块化配置**：将配置拆分为多个文件
- **环境变量**：使用环境变量管理配置
- **版本控制**：配置文件纳入版本控制

### 监控和调试

```ruby
# 调试模式
output {
  stdout {
    codec => rubydebug
  }
}

# 条件调试
output {
  if [debug] == "true" {
    stdout {
      codec => rubydebug
    }
  }
}
```

---

##  学习资源

- [Logstash 官方文档](https://www.elastic.co/guide/en/logstash/current/index.html)
- [Logstash 插件](https://www.elastic.co/guide/en/logstash/current/plugins.html)
- [Grok 模式](https://github.com/logstash-plugins/logstash-patterns-core)

---

## 💡 常用命令速查

```bash
# 启动 Logstash
bin/logstash -f config/logstash.conf

# 测试配置
bin/logstash -f config/logstash.conf --config.test_and_exit

# 自动重载配置
bin/logstash -f config/logstash.conf --config.reload.automatic

# 指定配置文件目录
bin/logstash --path.config=/etc/logstash/conf.d

# 查看插件
bin/logstash-plugin list
bin/logstash-plugin install plugin_name
```

