---
title: 日志检索技巧
description: 查日志太慢，这套 grep 组合拳，效率直接提升10倍。wk、wc、sed也有！
tag:
  - Linux
sidebar: true
outline: [2,3,4]
lastUpdated: true
---

# Linux 日志相关操作

前段时间公司里来了个新同事——小王。技术底子不错，但查日志的方式让我直挠头。

事情是这样的：小王刚上线的功能在测试环境报错了。告警一响，我正好有空，就过去指导一下，顺便展示老司机经验。

结果看到他盯着终端执行：

```bash
tail -f app.log | grep "NullPointerException"
```

屏幕上一片寂静。等了差不多一分钟，终于跳出一行：

```bash
"2023-11-15 14:30:01.339 ERROR - java.lang.NullPointerException: null"
```

“找到了！”小王兴奋地说。

我忍不住提醒：“兄弟，你这只能看到异常类型，堆栈信息全丢了啊。”

小王愣了一下，随后用 `vi` 打开整个日志文件，开始 `/NullPointerException` 搜索，然后不停按 `n` 在几十万行日志里翻找。

实在看不下去，我推开键盘：“我来给你演示下更利索的。”

我当场操作，他愣了三秒，猛拍桌子：“我靠，原来还能这么玩？你这套操作必须写成文章，我前公司的兄弟们还在用 vi 硬翻呢！”

既然需求明确，今天我就把这份压箱底的日志排查指南完整分享，保证有收获！

---

## 第一现场示范

我接手后执行的第一条命令：

```bash
tail -f error.log | grep -A 30 "NullPointerException\|TimeoutException"
```

屏幕输出瞬间不同：完整异常堆栈、业务参数、调用链全部实时滚动呈现。

紧接着我又执行：

```bash
zgrep -A 30 -H "触发条件关键词" *.gz
```

文件名、异常堆栈、上下文一目了然。前后不过一分钟，我们就定位到了根因——一个隐蔽的并发边界条件。

复盘时我总结小王的“低效三板斧”：

1. **单行陷阱**：`tail -f | grep` 只能看到异常片段，关键堆栈缺失。
2. **视觉疲劳**：`vi` 逐行搜索十分消耗注意力，上下文关联困难。
3. **格式障碍**：面对压缩日志束手无策，额外解压打断工作流。

下面进入干货时间。

---

## 一、grep 组合拳：四类实战场景

### 1. 完整异常堆栈捕获技巧

```bash
# 关键参数：-A 确保堆栈完整性
grep -A50 "NullPointerException" application.log | less
```

**实战要点：**

- `-A N`：显示匹配行后 N 行，通常足以覆盖堆栈。
- `less` 分页器支持 `/` `?` 搜索、空格翻页、`q` 退出。
- 适用场景：事后分析、根因定位。

### 2. 实时异常监控与上下文保留

```bash
# 生产环境实时告警模式
tail -f application.log | grep -Ai30 "ERROR\|Exception"
```

**专业技巧：**

- `-i` 忽略大小写，兼容不同日志规范。
- 正则 `\|` 同时匹配多类异常关键词。
- `Ctrl + C` 优雅终止，避免信号干扰。

### 3. 压缩日志直接分析方案

```bash
# 跳过解压步骤，直击问题核心
zgrep -H -A50 "OutOfMemoryError" *.gz
```

**参数解析：**

- `-H` 保留文件名，方便多文件溯源。
- 原生支持 `.gz`，无需预处理。
- 拓展：结合 `zcat | grep` 处理特殊压缩格式。

### 4. 异常趋势统计与模式发现

```bash
# 多文件异常频率分析
grep -c "ConnectionTimeout" *.log | sort -nr -t: -k2
```

**进阶统计：**

- 管道与 `sort` 结合，按数量降序排序。
- 输出可直接导入监控系统。
- 通过频率变化识别系统瓶颈。

---

## 5. 高级参数应用指南

### 上下文控制矩阵

通过 `-A`、`-B`、`-C` 精准控制上下文范围，保证既不过量也不缺少关键信息。

### 反向工程技巧

```bash
# 排除干扰信息，聚焦核心问题
grep -v "健康检查\|心跳" app.log | grep -A30 "异常"

# 过滤已知噪音，提升信号纯度
```

---

## 二、生产环境实战进阶

### 多维度日志关联分析

```bash
# 时间窗口关联查询
grep -C10 "2023-11-15 14:30" app.log | grep -A20 "事务回滚"

# 分布式追踪集成
grep -A40 "traceId:0a1b2c3d" service*.log
```

通过多步管道将时间窗口、traceId、业务关键字串联，提高定位效率。

### 性能敏感场景优化

```bash
# 大文件处理加速方案
grep -m1000 "ERROR" large.log  # 限制输出数量
grep --binary-files=text "异常" binary.log  # 二进制安全处理
```

- `-m` 限制输出行数，避免洪水。
- `--binary-files=text` 防止被二进制文件打断。

### 正则表达式性能调优

```bash
# 高效模式匹配
grep -E "Timeout\|Reject\|Failure"  # 扩展正则更清晰
fgrep -f patterns.txt app.log       # 固定字符串性能最佳
```

---

## 三、扩展你的工具链

### 第一梯队：单机即时分析

**wc：行数统计利器**

```bash
# 统计错误出现总次数
grep "ERROR" app.log | wc -l

# 统计唯一异常类型数量
grep "Exception" app.log | awk -F':' '{print $4}' | sort | uniq | wc -l
```

**awk：字段处理与数据提炼**

```bash
# 提取特定字段（例：第 7 列状态码为 500 的日志行）
awk '$7 == 500' app.log

# 统计接口平均响应时间
awk '{sum+=$9; count++} END {print "平均响应时间:", sum/count, "ms"}' app.log

# 统计每个 URL 的访问次数
awk '{print $5}' access.log | sort | uniq -c | sort -nr
```

**sed：流式文本编辑与清洗**

```bash
# 提取 14:00 到 14:10 的日志
sed -n '/2023-11-15 14:00:00/,/2023-11-15 14:10:00/p' app.log

# 清理日志中的敏感信息（如手机号）
sed 's/\([0-9]\{3\}\)[0-9]\{4\}\([0-9]\{4\}\)/\1****\2/g' app.log
```

### 第二梯队：组合技发挥最大威力

**场景：统计每分钟超时错误数量**

```bash
grep "Timeout" application.log | \
sed -n 's/.*\(2023-11-15 14:[0-9][0-9]\).*/\1/p' | \
sort | \
uniq -c
```

**场景：分析 Nginx 日志，找出返回码 ≠ 200 的请求 IP**

```bash
awk '$9 != 200 {print $1}' access.log | sort | uniq -c | sort -nr | head -20
```

---

