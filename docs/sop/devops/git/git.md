---
title: GIT基础
description: GIT基础记录
tag:
  - GIT
sidebar: true
outline: [2,3,4]
lastUpdated: true
---

# GIT基础信息

## Git 基础常用操作

### Git 全局设置

Git 全局设置:

```bash
git config --global user.name "海边的小溪鱼"
git config --global user.email "1130122701@qq.com"
```

### 创建 git 仓库

创建 git 仓库:

```bash

mkdir cs
cd cs
git init
touch README.md
git add README.md
git commit -m "first commit"
# 关联远程仓库
git remote add origin https://gitee.com/DuebassLei/cs.git
git push -u origin "master"
```

### 已有仓库?关联远程仓库

```bash
cd existing_git_repo
git remote add origin https://gitee.com/DuebassLei/cs.git
# 推送本地 master 分支到远程仓库 origin
git push -u origin "master"
```

#### 推送本地分支到远程仓库-强制覆盖

```bash
git push -f -u origin "master"
```

> 要将所有本地分支推送到远程仓库（例如你定义的 origin-yn），并设置上游跟踪，可以使用以下命令：

```bash
# 推送所有本地分支到 origin-yn 远程仓库
git push -u origin-yn --all

# 强制推送所有本地分支到 origin-yn 远程仓库
git push -f -u origin-yn --all
```
