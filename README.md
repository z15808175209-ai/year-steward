<p align="center"><img src="public/icon.svg" width="104" alt="year-steward"></p>
<h1 align="center">year-steward · 私人管家</h1>
<p align="center"><strong>你随手记，它按时戳你一下。</strong><br>一个韩系盐系的年度管家 Web App：年度计划、固定任务、倒计时、备忘录与复盘。</p>

<p align="center">
  <a href="https://z15808175209-ai.github.io/year-steward/"><strong>🚀 打开项目入口（在线体验）</strong></a>
  ・
  <a href="#核心能力">功能</a>
  ・
  <a href="#本地开发">本地运行</a>
  ・
  <a href="https://github.com/z15808175209-ai/year-steward/issues">反馈问题</a>
</p>

<p align="center"><sub>React 18 + TypeScript · Dexie (IndexedDB) · 纯本地数据 · GitHub Pages 自动部署</sub></p>

> 一个温柔的"主动管家" —— 你随手记，它帮你分门别类、定优先级、按时戳你一下；你拖延了，它不催你、只是提醒；你做完了，它会记下让你复盘时看见。

**韩系盐系风格** · Mac 桌面优先 · 纯本地数据 · 开源可自部署

---

## 核心能力

按**二八定律**设计：20% 固定任务（Routine）打骨架，80% 弹性任务（Task）填内容。

| 模块 | 说明 |
|---|---|
| **Routine 固定任务** | 双模式：⏰ 锚定时间（到点提醒）+ ☁️ 当天完成（不被时间绑死）<br/>连续天数 / 最长坚持 / 跳过机制 |
| **Task 弹性任务** | 三色优先级（P0/P1/P2）+ 截止日期 + 钉选 + 完成勾选 |
| **Countdown 倒计时** | 重要日期 + 颜色随紧急度衰减（<7天红 / <30天橙 / 其他蓝灰） |
| **Notes 备忘录** | Markdown + 标签 + 全文搜索 |
| **Review 复盘** | 月/年视图 + Routine 完成率置顶 + 365 天热力图 |

---

## 项目入口

| 入口 | 地址 |
|---|---|
| 🌐 **在线体验** | https://z15808175209-ai.github.io/year-steward/ |
| 💻 源码仓库 | https://github.com/z15808175209-ai/year-steward |

## 部署

推送到 `main` 分支会自动触发 GitHub Actions 构建并部署到 GitHub Pages。

```
https://z15808175209-ai.github.io/year-steward/
```

---

## 数据隐私

- 所有数据存在你的浏览器 **IndexedDB** 本地，**不上传任何服务器**
- 换设备需手动导出/导入（v0.2+ 会加同步能力）
- 无账号、无登录、无追踪

---


## 路线图

- **M1 ✅** 5 个核心模块 + IndexedDB 本地存储 + GitHub Pages 自动部署
- **M2 ✅** 数据层（`repo`）+ 任务/倒计时/备忘录/Routine 全部 CRUD + 真实复盘统计
- **M3（下一步）** 主页面 UI 打磨 + 韩系盐系主题统一
- **后续** 移动端 PWA + 多设备同步 + AI 理性助理（基于历史数据的决策建议）

---

## License

MIT
