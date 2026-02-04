# OMEGA Dashboard 部署指南

## 概述

本项目使用 [Vercel](https://vercel.com) 部署，区域选择香港 (`hkg1`) 以优化亚太地区访问速度。

---

## 1. Vercel 项目创建

### 方式一：通过 GitHub 自动部署（推荐）

1. **连接 GitHub 仓库**
   - 登录 [Vercel Dashboard](https://vercel.com/dashboard)
   - 点击 "Add New Project"
   - 选择 "Import Git Repository"
   - 授权并选择 `OMEGA` 仓库

2. **配置项目**
   - **Root Directory**: `omega-dashboard`（重要！选择子目录）
   - **Framework Preset**: Next.js（自动检测）
   - **Build Command**: `npm run build`（已在 vercel.json 配置）
   - **Output Directory**: `.next`（已在 vercel.json 配置）

3. **点击 Deploy**

### 方式二：使用 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 在 omega-dashboard 目录下
cd omega-dashboard

# 登录并部署
vercel login
vercel
```

---

## 2. 环境变量配置

在 Vercel 项目设置中配置以下环境变量：

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `NEXT_PUBLIC_API_URL` | FastAPI 后端地址 | `https://api.omega.example.com` |

### 配置步骤

1. 进入 Vercel 项目 → **Settings** → **Environment Variables**
2. 添加变量：
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: 你的后端 API 地址
   - **Environment**: 勾选 Production / Preview / Development

### 使用 Vercel Secret（推荐）

对于敏感配置，使用 Vercel Secrets：

```bash
# 创建 secret
vercel secrets add omega-api-url "https://api.omega.example.com"

# vercel.json 中引用
# "NEXT_PUBLIC_API_URL": "@omega-api-url"
```

---

## 3. 域名绑定

### 添加自定义域名

1. 进入 Vercel 项目 → **Settings** → **Domains**
2. 输入域名（如 `omega.yourdomain.com`）
3. 根据提示配置 DNS：
   - **CNAME**: `omega` → `cname.vercel-dns.com`
   - 或 **A**: `@` → `76.76.21.21`

### SSL 证书

Vercel 自动配置 Let's Encrypt SSL 证书，无需手动操作。

---

## 4. 后端 API 配置

### CORS 设置

确保后端 FastAPI 配置了正确的 CORS：

```python
# omega-api/main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://omega.yourdomain.com",  # 生产域名
        "https://omega-dashboard.vercel.app",  # Vercel 默认域名
        "http://localhost:3000",  # 本地开发
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 后端部署选项

| 方案 | 适合场景 | 预估成本 |
|------|----------|----------|
| [Railway](https://railway.app) | 简单快速 | $5+/月 |
| [Fly.io](https://fly.io) | 多区域部署 | 免费起步 |
| [Render](https://render.com) | 免费额度 | 免费起步 |
| [Google Cloud Run](https://cloud.google.com/run) | 按需计费 | 按用量 |

---

## 5. 部署验证

### 检查清单

- [ ] 页面正常加载，无白屏
- [ ] 暗色模式切换正常
- [ ] API 请求返回数据（检查网络面板）
- [ ] WebSocket 连接成功（信号推送）
- [ ] 移动端响应式正常

### 常见问题

**Q: 页面加载但无数据？**
- 检查 `NEXT_PUBLIC_API_URL` 环境变量
- 检查后端 CORS 配置
- 查看浏览器控制台错误

**Q: 构建失败？**
- 检查 Node.js 版本（需要 v18+）
- 清理 `.next` 缓存重新部署

**Q: 图片加载失败？**
- 检查 `next.config.ts` 的 `remotePatterns` 配置

---

## 6. CI/CD 自动部署

连接 GitHub 后，Vercel 自动配置：

- **Production**: `main` 分支推送自动部署
- **Preview**: PR 自动生成预览链接
- **Instant Rollback**: 一键回滚到任意历史版本

### 跳过部署

在 commit message 中添加 `[skip ci]` 或 `[skip vercel]` 可跳过自动部署。

---

## 快速命令参考

```bash
# 本地开发
npm run dev

# 生产构建测试
npm run build && npm run start

# Vercel CLI 部署
vercel              # 预览部署
vercel --prod       # 生产部署
vercel logs         # 查看日志
vercel env pull     # 拉取环境变量到本地
```

---

_最后更新: 2026-02-04_
