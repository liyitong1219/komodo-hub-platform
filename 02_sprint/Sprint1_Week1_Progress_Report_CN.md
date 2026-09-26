# Sprint 1 Week 1 Progress Report

**Komodo Hub – Digital Animal Conservation Platform**  
**课程**：CUH601CMD · **文档类型**：Weekly Scrum Report / Sprint 1 Week 1 Increment  
**Sprint 周期**：Sprint 1 · Week 1  
**版本**：2026-09-26  
**证据存放**：`05_project_management/`、`evidence/<成员>/`、Git 提交记录、原型截图

---

## 1. Sprint Goal（本周 Sprint 目标）

本周为项目启动阶段，目标是完成 Komodo Hub 动物保护数字平台的**整体规划、需求分析**以及**可演示的基础系统框架**，并体现 Scrum 过程、团队协作、需求分析与项目管理，而非仅“完成代码”。

具体目标：

1. 确定项目方向与系统定位；
2. 分析多角色用户需求并冻结 V1.1 需求基线；
3. 完成系统整体架构与页面结构规划；
4. 搭建前端原型运行环境（`04_web_prototype/`）；
5. 实现基础登录/注册与多端口导航；
6. 建立学生端与教师端通过**班级邀请码**关联的初步交互逻辑。

**Product Goal（产品目标，Week 1 共识）**：支持社区参与式动物保护学习——学生在学校场景下安全学习并提交观察，教师管理班级与任务，公众与社区参与保护与内容共建，管理员审核与治理。

---

## 2. Team Activities（团队活动）

### 2.1 项目选题与需求讨论

团队进行选题讨论，确定主题为：

**Komodo Hub – A Digital Platform for Community-Supported Animal Conservation**

围绕以下问题展开讨论并记录于会议纪要：

| 讨论主题 | 结论摘要 |
|---|---|
| 学生如何参与动物保护学习 | 班级任务、物种库、活动报名、观察报告（教师可见、社区去身份） |
| 教师如何管理学习活动 | 班级、邀请码、任务发布、报告评阅、课程材料 |
| 普通用户如何参与保护 | 浏览物种、提交观察、评论、收藏、加入活动与社区 |
| 管理员如何维护平台 | 用户与组织审批、物种与内容审核、活动治理 |
| 社区组织角色 | 组织主页、成员、文库、活动与帖子审核 |

**Sprint 仪式（Week 1）**：

- Sprint Planning：确认 Sprint Goal、Backlog 优先级、DoD、角色轮换（见 `05_project_management/Role_Rotation_and_Evidence.md`）
- 每日站会（Daily Scrum）：进度、阻塞、当日计划
- 增量演示（内部）：登录各端口、学生入班、教师查看邀请码

### 2.2 系统端口划分（与原型一致）

| 端口 | 说明 |
|---|---|
| Student Portal | 学习、任务、报告、班级通讯、社区（隐私化展示） |
| Teacher Portal | 班级管理、报告评阅、课程材料、任务与反馈 |
| Public User Portal | 物种、搜索、社区信息流、收藏、活动 |
| Community Portal | 组织运营、成员、文库、活动与帖子审核 |
| Admin Portal | 用户、组织、物种、审核队列、活动 |
| Guest | 访客浏览物种与公开活动（只读） |

---

## 3. Requirement Analysis（需求分析）

本周完成功能框架设计，并输出/更新：

- `01_requirements/Komodo_Hub_SRS_CN.md`、`Komodo_Hub_SRS_EN.md`（V1.1，与案例对齐）
- 用例与状态：观察报告 `pending_teacher` / `pending_admin` / `approved` / `rejected` 等
- 隐私规则：学生进入社区信息流时**不公开**姓名、班级等（PublicReportView / 去身份化）

### 3.1 Student Portal

主要功能（Week 1 范围与后续 Sprint 拆分）：

- 注册与登录（学生注册需**班级邀请码**）
- 加入班级（注册时或登录后补填邀请码）
- 浏览物种库与公开活动
- 学习任务与提交（入班后）
- 观察报告提交（入班后；教师评阅链路在 Sprint 1 后续周扩展）

**学生—教师关联机制**：

```
Teacher registers / creates class
        ↓
System generates class access code
        ↓
Student registers (or joins) with access code
        ↓
Student linked to class & teacher
        ↓
Teacher manages class, tasks, and review
```

演示邀请码（种子数据）：`UJUNG-5A-2026`（教师端「班级管理」可查看/重新生成）。

### 3.2 Teacher Portal

主要功能：

- 教师注册（含年级、班级信息；演示环境需管理员审批后登录）
- 登录后创建/管理班级、查看与分享邀请码
- 发布任务与课程材料（原型已搭页面与本地数据流）
- 班级学生报告评阅入口

关系结构：

```
Teacher → Class → Students
```

### 3.3 其他角色（Week 1 分析范围）

- **Public**：物种、报告、评论、收藏、活动、加入社区组织  
- **Community**：组织主页、成员、文库、活动、帖子审核  
- **Admin**：用户、组织审批、物种、全局审核与活动  

---

## 4. Front-end Framework Development（前端框架开发）

### 4.1 多角色页面结构

采用单页应用式原型（Vanilla JS），按角色切换导航与视图：

```
Komodo Hub
├── Guest / Public browse
├── Student Portal
├── Teacher Portal
├── Public User Portal
├── Community Portal
└── Admin Portal
```

代码入口：`04_web_prototype/index.html`，模块：`store.js`（数据）、`auth.js`（会话与导航）、`views.js`（页面）、`app.js`（事件与模态框）。

完成基础布局：左侧固定导航 + 右侧主内容区。

### 4.2 认证界面

- **Login**：邮箱 + 密码；访客浏览入口；重置演示数据  
- **Register**：分 Tab — Public / Student / Teacher  
  - **Student**：班级邀请码、学号、姓名、出生日期、邮箱、密码等  
  - **Teacher**：姓名、邮箱、密码、学校名称（可选）、年级、班级（注册时创建演示班级与邀请码逻辑）  

账号说明见根目录 `README.md`（不展示在登录页，符合演示安全约定）。

---

## 5. Basic Functional Implementation（基础功能实现）

### 5.1 学生—教师注册与入班交互

| 角色 | 行为 |
|---|---|
| 教师 | 注册 →（审批后）登录 → 班级管理 → 查看/复制/重新生成邀请码 |
| 学生 | 注册时填写邀请码 → 绑定班级与教师；未入班时任务/报告/留言门禁提示 |

已在原型中用本地数据验证上述关系。

### 5.2 本地数据存储（原型阶段）

当前用户与业务数据存储在浏览器 **localStorage**（键名随版本迁移，如 `komodo_hub_v1_4`），包括：

- 用户、会话（sessionStorage）
- 班级、邀请码、任务、报告、活动、物种种子数据等

**目的**：快速验证流程与 UI/权限边界。  
**后续 Sprint**：数据库设计、后端 API、安全认证与密码哈希。

---

## 6. Web Function Analysis（后续功能分析）

团队对完整产品 backlog 做了初步拆分：

| 角色 | 后续重点 |
|---|---|
| Student | Dashboard、学习进度、活动参与、报告与任务闭环 |
| Teacher | 班级分析、课程发布、作业批改与反馈 |
| Public | 搜索、收藏、活动报名、社区互动 |
| Admin | 审核策略、审计日志、内容与用户治理 |
| Community | 文库、活动运营、成员与禁言 |

后续团队会继续优化其中的功能细节。

---

## 7. Team Collaboration（团队协作）

### 7.1 角色与贡献（Week 1）

请按小组实际分工在表中填写姓名与证据链接；下表为报告示例结构。

| 成员 | Sprint 1 Week 1 角色 | 主要贡献 |
|---|---|---|
| 李依桐 | Product Owner / 协调 | 项目启动、需求讨论主持、Backlog 优先级、与教师端/入班流程对齐 |
| 李依桐 | Scrum Master | Planning/站会记录、DoD、证据清单检查 |
| ALL Menbers | Architect | 用例/状态流、隐私边界、模块划分 |
| ALL Menbers | Database | 实体初稿、与报告/班级关系建模 |
| 李依桐 | Web | 原型框架、登录注册、多端口导航 |

由于本周是项目开始的第一周，团队成员不是很齐，本周大部分内容由李依桐完成，小组各同学参与讨论并给出建议，但是下周的工作会有更合理的划分。
全员参与：选题、用户故事讨论、页面流程建议、测试场景构思。

---

## 8. Next Sprint Plan（Sprint 1 · Week 2 及以后）

Week 2 建议重点：

**Student / Teacher**

- 学生 Dashboard 与学习资源页深化  
- 教师班级学生列表与任务发布闭环  
- 报告评阅 → 管理员审核状态联动

**工程**

- 测试场景与截图（S1-05） 
- 需求—实现追踪矩阵更新（S1-06）
- 数据库表结构初稿与迁移计划  


