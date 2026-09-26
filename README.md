# Komodo Hub — Software Engineering Project

本目录是小组软件工程作业的统一工作区。当前基线为 **需求 SRS V1.0+ 可演示 Web 原型**。

## 运行原型

直接双击 `04_web_prototype/index.html`，或在本目录执行：

```powershell
cd 04_web_prototype
python -m http.server 5173
```

然后打开 http://localhost:5173。

## 演示账号与密码

仅供本地演示；**请勿写入公开页面或提交到公开仓库**（若需公开代码，请改用环境变量或私下分发）。

| 角色 | 邮箱 | 密码 |
|---|---|---|
| 管理员 | `admin@komodo.id` | `demo123` |
| 学生 | `student@komodo.id` | `demo123` |
| 教师 | `teacher@komodo.id` | `demo123` |
| 公众用户 | `public@komodo.id` | `demo123` |
| 社区负责人 | `community@komodo.id` | `demo123` |

**班级邀请码（演示班级）**：`UJUNG-5A-2026`（教师登录后在「班级管理」查看/复制；学生注册或入班时填写。）

登录页不提供账号列表；重置种子数据：登录页 **「重置演示数据」**。

## 目录约定

- `01_requirements/`：`Komodo_Hub_SRS_CN.md`（中文）、`Komodo_Hub_SRS_EN.md`（英文）
- `02_sprint/`：Sprint 1 计划、Week 1 过程报告（中英）、Review 模板
- `03_design/`：架构、数据模型、隐私与安全设计
- `04_web_prototype/`：可运行原型与后续代码入口
- `05_project_management/`：角色轮换、风险、会议记录、证据清单
- `06_source_materials/`：作业 brief、Komodo Hub case 与 HOW TO 原文

## 当前范围

原型覆盖 V1.1 多端口：**登录页选择账号进入对应端**（管理/学生/教师/公众/社区），各端导航与功能不同；支持访客浏览物种与公开社区。核心链路：提交报告 → 管理员审核 → 通过后进入社区（学生身份隐私化）；班级教学、社区运营、活动与搜索/收藏等可在本地演示数据中操作。登录页可「重置演示数据」。

## 学术诚信记录

本原型与文档由小组根据案例材料自行分析和实现。
