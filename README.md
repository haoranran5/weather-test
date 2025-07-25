# 🌍 全球天气预报应用

一个基于 Next.js 和 OpenWeatherMap API 的现代化天气查询应用，使用 shadcn/ui 组件库构建，提供实时天气信息和全球城市排行榜功能。

## 🎉 最新更新

✅ **Runtime Error 已修复** - 应用现在可以正常运行
✅ **shadcn/ui 集成完成** - 使用现代化 UI 组件库
✅ **基础功能实现** - 天气查询和排行榜功能正常工作
✅ **Air Quality API 集成** - 支持空气质量数据查询

## ✨ 主要功能

### 🌍 全球城市天气查询
- 支持中文和英文城市名搜索
- 实时天气数据获取
- 详细的天气信息展示（温度、湿度、风速、气压等）
- 当前位置天气查询（基于地理定位）

### 🔥 全球最热城市 TOP10
- 实时展示全球气温最高的10个城市
- 点击城市名可直接查询该城市天气

### ❄️ 全球最冷城市 TOP10
- 实时展示全球气温最低的10个城市
- 温度数据实时更新

### 💧 全球湿度最高城市 TOP10
- 展示全球湿度最高的10个城市
- 湿度百分比显示

### 🏭 空气污染最严重 TOP10
- 基于 AQI（空气质量指数）排序
- 污染等级标识（优、良、轻度污染等）
- 颜色编码显示污染程度

## 🚀 技术栈

- **前端框架**: Next.js 15 (App Router)
- **UI 框架**: React 19
- **UI 组件库**: shadcn/ui
- **样式**: Tailwind CSS
- **图标**: Lucide React
- **语言**: TypeScript
- **API**: OpenWeatherMap API + Air Quality API
- **部署**: 支持 Vercel 部署

## 📦 安装和运行

### 1. 克隆项目
```bash
git clone <repository-url>
cd weather-test
```

### 2. 安装依赖
```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 3. 配置环境变量
复制 `.env.example` 文件为 `.env.local`：
```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件，添加你的 API 密钥：
```env
OPENWEATHERMAP_API_KEY=your_openweathermap_api_key_here
AIR_QUALITY_API_KEY=5453ff00-b0d4-4895-9e87-1fa4309f2bf5
```

### 4. 获取 API 密钥
1. 访问 [OpenWeatherMap](https://openweathermap.org/api)
2. 注册账户并获取免费 API 密钥
3. 将密钥添加到 `.env.local` 文件中

### 5. 启动开发服务器
```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

## 🏗️ 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   │   ├── weather/       # 天气查询 API
│   │   └── top-cities/    # 城市排行榜 API
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx          # 主页面
├── components/            # React 组件
│   ├── WeatherCard.tsx    # 天气信息卡片
│   ├── WeatherSearch.tsx  # 搜索组件
│   └── TopCitiesList.tsx  # 排行榜组件
├── types/                 # TypeScript 类型定义
│   └── weather.ts
├── utils/                 # 工具函数
│   └── weather.ts
└── constants/             # 常量定义
    └── cities.ts
```

## 🎨 功能特色

- **响应式设计**: 完美适配桌面端和移动端
- **实时数据**: 天气数据每5分钟自动更新
- **智能缓存**: 减少 API 调用，提升性能
- **错误处理**: 完善的错误提示和重试机制
- **用户体验**: 流畅的动画效果和加载状态
- **多语言支持**: 支持中英文城市搜索

## 🌐 API 说明

### 天气查询 API
- **路径**: `/api/weather`
- **参数**:
  - `city`: 城市名称
  - `lat` & `lon`: 经纬度坐标

### 城市排行榜 API
- **路径**: `/api/top-cities`
- **返回**: 全球城市各项指标排行榜数据

## 📱 部署

### Vercel 部署
1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 添加环境变量 `OPENWEATHERMAP_API_KEY`
4. 部署完成

### 其他平台
项目支持部署到任何支持 Node.js 的平台，如 Netlify、Railway 等。

## 🔧 开发

### 构建生产版本
```bash
npm run build
npm run start
```

### 代码检查
```bash
npm run lint
```

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 联系

如有问题或建议，请通过 Issue 联系。
