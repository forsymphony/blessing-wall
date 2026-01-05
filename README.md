# 🏮 祝福墙 - Blessing Wall

基于 Vue 3 + Element Plus + 阿里云 ESA 的祝福墙应用。用户可以选择祝福短语进行投票，支持查看总祝福次数和今日祝福次数。

## ✨ 功能特性

- 🎴 8 条精美祝福卡片，支持点击送出祝福
- 📊 实时统计展示（总祝福次数 / 今日祝福次数）
- 🎨 精美的 UI 设计，渐变背景、卡片动画
- 🌐 使用阿里云 ESA EdgeKV 存储数据，全球边缘节点加速
- 🔧 支持 Mock 模式，方便本地开发调试

## 📦 技术栈

- **前端框架**: Vue 3 + TypeScript
- **构建工具**: Vite 5
- **UI 组件**: Element Plus
- **HTTP 客户端**: Axios
- **边缘服务**: 阿里云 ESA (EdgeKV + Edge Functions)

## 🚀 快速开始

### 1. 安装依赖

```bash
cd blessing-wall
npm install
```

### 2. 本地开发（Mock 模式）

```bash
npm run dev
```

默认启用 Mock 模式，数据存储在内存中，方便开发调试。

### 3. 构建生产版本

```bash
npm run build
```

## ⚙️ 配置 ESA

### 步骤 1：创建 EdgeKV 命名空间

1. 登录 [阿里云 ESA 控制台](https://esa.console.aliyun.com/)
2. 进入「边缘计算」→「EdgeKV」
3. 点击「创建命名空间」，名称填写：`blessing_wall`

### 步骤 2：部署边缘函数

1. 进入「边缘计算」→「函数和Pages」
2. 点击「创建函数」
3. 将 `esa-edge-function/edge-function.js` 的代码粘贴到编辑器
4. 保存并部署

### 步骤 3：配置路由

1. 在函数设置中添加路由规则
2. 绑定到您的站点域名
3. 设置路径匹配规则（如 `/api/*`）

### 步骤 4：配置前端环境变量

在项目根目录创建 `.env.production` 文件：

```env
VITE_ESA_BASE_URL=https://your-site.alicdn.com/api
VITE_USE_MOCK=false
```

## 📁 项目结构

```
blessing-wall/
├── src/
│   ├── api/
│   │   └── esa.ts              # ESA API 封装（含 Mock）
│   ├── components/
│   │   ├── BlessingCard.vue    # 祝福卡片组件
│   │   └── StatsPanel.vue      # 统计面板组件
│   ├── data/
│   │   └── blessings.ts        # 8条祝福短语数据
│   ├── types/
│   │   └── blessing.ts         # TypeScript 类型定义
│   ├── views/
│   │   └── HomePage.vue        # 主页
│   ├── App.vue
│   ├── main.ts
│   └── style.css               # 全局样式
├── esa-edge-function/
│   └── edge-function.js        # ESA 边缘函数代码
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 🎨 自定义祝福语

编辑 `src/data/blessings.ts` 文件：

```typescript
export const blessings: Blessing[] = [
  {
    id: 'blessing_1',
    text: '您的祝福语',
    emoji: '🎉',
    gradient: 'var(--card-gradient-1)'
  },
  // ...
]
```

## 📝 API 接口

### POST /bless

发送祝福，增加计数。

**请求体：**
```json
{
  "id": "blessing_1"
}
```

**响应：**
```json
{
  "success": true,
  "id": "blessing_1",
  "totalCount": 128,
  "todayCount": 15
}
```

### GET /stats

获取所有祝福的统计数据。

**参数：**
- `type`: `total` | `today` | `all`

**响应：**
```json
{
  "success": true,
  "stats": [
    {
      "id": "blessing_1",
      "totalCount": 128,
      "todayCount": 15
    }
  ]
}
```

## 📄 License

MIT

