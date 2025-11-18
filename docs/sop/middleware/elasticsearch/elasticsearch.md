---
title: Elasticsearch实用操作笔记
description: Elasticsearch基础核心知识及常用操作整理
tag:
  - Elasticsearch
  - 搜索引擎
  - ELK
sidebar: true
outline: [2,3,4]
lastUpdated: true
---

## 📖 目录

- [Elasticsearch 基础概念](#elasticsearch-基础概念)
- [核心概念](#核心概念)
- [索引操作](#索引操作)
- [文档操作](#文档操作)
- [查询 DSL](#查询-dsl)
- [聚合分析](#聚合分析)
- [映射（Mapping）](#映射mapping)
- [分析器（Analyzer）](#分析器analyzer)
- [常用命令](#常用命令)
- [最佳实践](#最佳实践)

---

## Elasticsearch 基础概念

### 什么是 Elasticsearch？

Elasticsearch 是一个分布式、RESTful 风格的搜索和数据分析引擎，能够实时存储、搜索和分析大量数据。

### 核心特性

- **分布式**：自动分片和副本
- **实时搜索**：近实时的搜索和分析
- **RESTful API**：简单的 HTTP API
- **全文搜索**：强大的全文搜索能力
- **可扩展性**：水平扩展，支持大规模数据
- **多租户**：支持多个索引

### 应用场景

- **全文搜索**：网站搜索、日志搜索
- **日志分析**：ELK 栈的核心组件
- **数据分析**：实时数据分析
- **监控**：应用和系统监控
- **推荐系统**：基于搜索的推荐

### 安装和启动

```bash
# 下载 Elasticsearch
wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-8.11.0-linux-x86_64.tar.gz
tar -xzf elasticsearch-8.11.0-linux-x86_64.tar.gz
cd elasticsearch-8.11.0

# 启动 Elasticsearch
./bin/elasticsearch

# 后台启动
./bin/elasticsearch -d

# 验证运行
curl http://localhost:9200
```

---

## 核心概念

### Index（索引）

类似数据库，是文档的集合。

### Type（类型）

索引中的逻辑分类（7.x 后已废弃）。

### Document（文档）

索引中的基本单位，类似数据库中的行。

### Field（字段）

文档的属性，类似数据库中的列。

### Mapping（映射）

定义文档及其字段的存储和索引方式。

### Shard（分片）

索引的水平分割，每个分片是一个独立的 Lucene 索引。

### Replica（副本）

分片的副本，提供高可用和性能。

---

## 索引操作

### 创建索引

```bash
# 基本创建
PUT /my_index

# 带设置创建
PUT /my_index
{
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1
  }
}

# 带映射创建
PUT /my_index
{
  "settings": {
    "number_of_shards": 1
  },
  "mappings": {
    "properties": {
      "title": {
        "type": "text"
      },
      "price": {
        "type": "double"
      }
    }
  }
}
```

### 查看索引

```bash
# 查看所有索引
GET /_cat/indices?v

# 查看索引信息
GET /my_index

# 查看索引设置
GET /my_index/_settings

# 查看索引映射
GET /my_index/_mapping
```

### 删除索引

```bash
# 删除索引
DELETE /my_index

# 删除多个索引
DELETE /index1,index2

# 删除所有索引（危险）
DELETE /_all
```

### 关闭/打开索引

```bash
# 关闭索引
POST /my_index/_close

# 打开索引
POST /my_index/_open
```

---

## 文档操作

### 索引文档

```bash
# 自动生成 ID
POST /my_index/_doc
{
  "title": "Elasticsearch Guide",
  "price": 29.99,
  "tags": ["search", "elasticsearch"]
}

# 指定 ID
PUT /my_index/_doc/1
{
  "title": "Elasticsearch Guide",
  "price": 29.99
}

# 批量索引
POST /_bulk
{"index":{"_index":"my_index","_id":"1"}}
{"title":"Document 1","price":10.99}
{"index":{"_index":"my_index","_id":"2"}}
{"title":"Document 2","price":20.99}
```

### 获取文档

```bash
# 获取文档
GET /my_index/_doc/1

# 获取多个文档
GET /_mget
{
  "docs": [
    {"_index": "my_index", "_id": "1"},
    {"_index": "my_index", "_id": "2"}
  ]
}
```

### 更新文档

```bash
# 更新整个文档
PUT /my_index/_doc/1
{
  "title": "Updated Title",
  "price": 39.99
}

# 部分更新
POST /my_index/_update/1
{
  "doc": {
    "price": 35.99
  }
}

# 脚本更新
POST /my_index/_update/1
{
  "script": {
    "source": "ctx._source.price += params.increment",
    "params": {
      "increment": 5
    }
  }
}
```

### 删除文档

```bash
# 删除文档
DELETE /my_index/_doc/1

# 按查询删除
POST /my_index/_delete_by_query
{
  "query": {
    "match": {
      "title": "test"
    }
  }
}
```

---

## 查询 DSL

### 基本查询

```bash
# Match 查询
GET /my_index/_search
{
  "query": {
    "match": {
      "title": "elasticsearch"
    }
  }
}

# Term 查询（精确匹配）
GET /my_index/_search
{
  "query": {
    "term": {
      "status": "published"
    }
  }
}

# Range 查询
GET /my_index/_search
{
  "query": {
    "range": {
      "price": {
        "gte": 10,
        "lte": 100
      }
    }
  }
}
```

### 复合查询

```bash
# Bool 查询
GET /my_index/_search
{
  "query": {
    "bool": {
      "must": [
        {"match": {"title": "elasticsearch"}}
      ],
      "must_not": [
        {"term": {"status": "deleted"}}
      ],
      "should": [
        {"match": {"tags": "search"}}
      ],
      "filter": [
        {"range": {"price": {"gte": 10, "lte": 100}}}
      ]
    }
  }
}

# Multi-match 查询
GET /my_index/_search
{
  "query": {
    "multi_match": {
      "query": "elasticsearch",
      "fields": ["title^2", "content"]
    }
  }
}
```

### 分页和排序

```bash
GET /my_index/_search
{
  "from": 0,
  "size": 10,
  "sort": [
    {"price": {"order": "desc"}},
    {"_score": {"order": "desc"}}
  ],
  "query": {
    "match_all": {}
  }
}
```

---

## 聚合分析

### 指标聚合

```bash
# 平均值
GET /my_index/_search
{
  "size": 0,
  "aggs": {
    "avg_price": {
      "avg": {
        "field": "price"
      }
    }
  }
}

# 统计信息
GET /my_index/_search
{
  "size": 0,
  "aggs": {
    "price_stats": {
      "stats": {
        "field": "price"
      }
    }
  }
}

# 求和
GET /my_index/_search
{
  "size": 0,
  "aggs": {
    "total_price": {
      "sum": {
        "field": "price"
      }
    }
  }
}
```

### 桶聚合

```bash
# Terms 聚合
GET /my_index/_search
{
  "size": 0,
  "aggs": {
    "tags": {
      "terms": {
        "field": "tags.keyword",
        "size": 10
      }
    }
  }
}

# Date Histogram 聚合
GET /my_index/_search
{
  "size": 0,
  "aggs": {
    "sales_over_time": {
      "date_histogram": {
        "field": "date",
        "calendar_interval": "month"
      }
    }
  }
}

# Range 聚合
GET /my_index/_search
{
  "size": 0,
  "aggs": {
    "price_ranges": {
      "range": {
        "field": "price",
        "ranges": [
          {"to": 50},
          {"from": 50, "to": 100},
          {"from": 100}
        ]
      }
    }
  }
}
```

### 嵌套聚合

```bash
GET /my_index/_search
{
  "size": 0,
  "aggs": {
    "tags": {
      "terms": {
        "field": "tags.keyword"
      },
      "aggs": {
        "avg_price": {
          "avg": {
            "field": "price"
          }
        }
      }
    }
  }
}
```

---

## 映射（Mapping）

### 字段类型

```bash
PUT /my_index
{
  "mappings": {
    "properties": {
      "title": {
        "type": "text",
        "analyzer": "standard"
      },
      "status": {
        "type": "keyword"
      },
      "price": {
        "type": "double"
      },
      "date": {
        "type": "date",
        "format": "yyyy-MM-dd"
      },
      "location": {
        "type": "geo_point"
      },
      "tags": {
        "type": "keyword"
      }
    }
  }
}
```

### 多字段映射

```bash
PUT /my_index
{
  "mappings": {
    "properties": {
      "title": {
        "type": "text",
        "fields": {
          "keyword": {
            "type": "keyword"
          },
          "english": {
            "type": "text",
            "analyzer": "english"
          }
        }
      }
    }
  }
}
```

### 动态映射

```bash
# 禁用动态映射
PUT /my_index
{
  "mappings": {
    "dynamic": false,
    "properties": {
      "title": {
        "type": "text"
      }
    }
  }
}

# 严格模式
PUT /my_index
{
  "mappings": {
    "dynamic": "strict"
  }
}
```

---

## 分析器（Analyzer）

### 内置分析器

- **standard**：标准分析器
- **simple**：简单分析器
- **whitespace**：空白字符分析器
- **keyword**：关键字分析器
- **stop**：停用词分析器
- **language**：语言特定分析器

### 自定义分析器

```bash
PUT /my_index
{
  "settings": {
    "analysis": {
      "analyzer": {
        "my_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": [
            "lowercase",
            "my_stop_filter"
          ]
        }
      },
      "filter": {
        "my_stop_filter": {
          "type": "stop",
          "stopwords": ["the", "a", "an"]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "title": {
        "type": "text",
        "analyzer": "my_analyzer"
      }
    }
  }
}
```

---

## 常用命令

### 集群管理

```bash
# 查看集群健康
GET /_cluster/health

# 查看集群状态
GET /_cluster/stats

# 查看节点信息
GET /_cat/nodes?v

# 查看分片信息
GET /_cat/shards?v
```

### 索引管理

```bash
# 查看所有索引
GET /_cat/indices?v

# 查看索引别名
GET /_cat/aliases?v

# 创建别名
POST /_aliases
{
  "actions": [
    {
      "add": {
        "index": "my_index",
        "alias": "my_alias"
      }
    }
  ]
}
```

### 模板管理

```bash
# 创建索引模板
PUT /_index_template/my_template
{
  "index_patterns": ["logs-*"],
  "template": {
    "settings": {
      "number_of_shards": 1
    },
    "mappings": {
      "properties": {
        "timestamp": {
          "type": "date"
        }
      }
    }
  }
}
```

---

## 最佳实践

### 索引设计

- **合理分片**：每个分片 10-50GB
- **副本设置**：生产环境至少 1 个副本
- **索引命名**：使用有意义的命名规范
- **索引模板**：使用模板统一管理

### 查询优化

- **使用 Filter**：不需要评分时使用 filter
- **避免深度分页**：使用 scroll 或 search_after
- **合理使用缓存**：利用 filter 缓存
- **字段选择**：只返回需要的字段

### 映射设计

- **选择合适的类型**：text vs keyword
- **禁用不需要的字段**：`"enabled": false`
- **使用多字段**：同时支持搜索和聚合

### 性能优化

- **批量操作**：使用 bulk API
- **刷新频率**：调整 refresh_interval
- **分片策略**：合理设置分片数量
- **监控指标**：定期检查集群健康

---

##  学习资源

- [Elasticsearch 官方文档](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html)
- [Elasticsearch 查询 DSL](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl.html)
- [Elasticsearch 聚合](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations.html)

---

## 💡 常用命令速查

```bash
# 集群
GET /_cluster/health
GET /_cat/nodes?v

# 索引
GET /_cat/indices?v
PUT /my_index
DELETE /my_index

# 文档
GET /my_index/_doc/1
POST /my_index/_doc
PUT /my_index/_doc/1
DELETE /my_index/_doc/1

# 搜索
GET /my_index/_search
POST /my_index/_search

# 批量
POST /_bulk
```

