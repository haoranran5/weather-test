# 🌍 智能天气预报应用

一个基于 Next.js 的现代化天气查询应用，集成多个天气API并具备智能切换功能，使用 shadcn/ui 组件库构建，提供实时天气信息、24小时趋势预报和全球城市排行榜功能。

## 🎉 最新更新

✅ **智能API管理系统** - 多API自动切换，确保高可用性
✅ **24小时天气趋势** - 精美的小时级天气预报卡片
✅ **API状态监控** - 实时监控API性能和可用性
✅ **优化用户体验** - 毛玻璃效果和现代化设计
✅ **多API支持** - WeatherAPI、OpenWeatherMap、Visual Crossing、Tomorrow.io

## ✨ 主要功能

### 🌍 智能天气查询

- 支持中文和英文城市名搜索
- **多API智能切换**：WeatherAPI、OpenWeatherMap、Visual Crossing、Tomorrow.io
- **自动故障转移**：API失败时自动切换到备用API
- 详细的天气信息展示（温度、湿度、风速、气压、空气质量等）
- 当前位置天气查询（基于地理定位）

### 📈 24小时天气趋势

- 精美的小时级天气预报卡片
- 温度变化趋势可视化
- 降雨概率和风速信息
- 响应式设计，完美适配各种设备

### 🔥 全球城市排行榜

- **全球最热 TOP10**：实时展示全球气温最高的极端气候城市
- **全球最冷 TOP10**：实时展示全球气温最低的极端气候城市
- 覆盖沙漠、极地、高原等极端气候地区
- 点击城市名可直接查询该城市详细天气
- 性能优化：智能缓存，30分钟更新一次确保数据准确性

### 📊 API状态监控

- 实时监控所有API的可用性和性能
- 显示响应时间、成功率、每日使用量
- 推荐最快和最可靠的API
- 自动30秒刷新状态

## 🚀 技术栈

- **前端框架**: Next.js 15 (App Router)
- **UI 框架**: React 19
- **UI 组件库**: shadcn/ui
- **样式**: Tailwind CSS
- **图标**: Lucide React
- **语言**: TypeScript
- **天气API**: WeatherAPI.com、OpenWeatherMap、Visual Crossing、Tomorrow.io
- **智能管理**: 多API自动切换和性能监控
- **部署**: 支持 Vercel 部署

## 📦 安装和运行

### 1. 克隆项目

```bash
git clone https://github.com/haoranran5/weather-test.git
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
# 主要API（推荐配置至少一个）
WEATHERAPI_KEY=your_weatherapi_key_here
OPENWEATHERMAP_API_KEY=your_openweathermap_api_key_here

# 备用API（可选，提高可用性）
VISUAL_CROSSING_API_KEY=your_visual_crossing_key_here
TOMORROW_API_KEY=your_tomorrow_io_key_here
```

### 4. 获取 API 密钥

**推荐配置（按优先级排序）：**

1. **WeatherAPI.com**（推荐）
   - 访问 [WeatherAPI.com](https://www.weatherapi.com/)
   - 免费额度：每月10,000次调用
   - 响应速度快，数据准确

2. **OpenWeatherMap**
   - 访问 [OpenWeatherMap](https://openweathermap.org/api)
   - 免费额度：每天1,000次调用
   - 稳定可靠的备用选择

3. **Visual Crossing**（可选）
   - 访问 [Visual Crossing](https://www.visualcrossing.com/)
   - 免费额度：每天1,000次调用

4. **Tomorrow.io**（可选）
   - 访问 [Tomorrow.io](https://www.tomorrow.io/)
   - 免费额度：每天500次调用

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

```text
src/
├── app/                           # Next.js App Router
│   ├── api/                      # API 路由
│   │   ├── weather/              # 智能天气查询 API
│   │   ├── api-status/           # API状态监控
│   │   ├── global-rankings-weatherapi/ # 全球排行榜
│   │   └── top-cities/           # 城市排行榜 API
│   ├── globals.css               # 全局样式
│   ├── layout.tsx                # 根布局
│   └── page.tsx                  # 主页面
├── components/                   # React 组件
│   ├── ui/                       # shadcn/ui 基础组件
│   ├── EnhancedWeatherSearch.tsx # 增强搜索组件
│   ├── GlobalRankings.tsx        # 全球排行榜组件
│   ├── WeatherChart.tsx          # 24小时天气趋势
│   ├── WeatherBackground.tsx     # 动态天气背景
│   ├── APIStatus.tsx             # API状态监控组件
│   └── ThemeToggle.tsx           # 主题切换
├── lib/                          # 核心库
│   ├── api-manager.ts            # 智能API管理器
│   └── utils.ts                  # 工具函数
├── types/                        # TypeScript 类型定义
│   └── weather.ts
├── constants/                    # 常量定义
│   ├── cities.ts
│   └── city-translations.ts      # 城市名翻译
└── utils/                        # 工具函数
    └── aqi-utils.ts              # 空气质量工具
```

## 🎨 功能特色

### 🚀 高可用性

- **智能API切换**: 4个天气API自动故障转移
- **性能优化**: 自动选择最快的可用API
- **实时监控**: API状态和性能实时监控
- **智能缓存**: 10分钟缓存减少API调用

### 🎯 用户体验

- **响应式设计**: 完美适配桌面端和移动端
- **毛玻璃效果**: 现代化的视觉设计
- **动态背景**: 根据天气条件变化的背景效果
- **流畅动画**: 优雅的加载状态和过渡效果

### 🌍 全球化支持

- **多语言支持**: 支持中英文城市搜索
- **全球数据**: 覆盖全球主要城市
- **本地化显示**: 中文城市名称翻译
- **时区适配**: 自动处理不同时区

## 🌐 API 说明

### 智能天气查询 API

- **路径**: `/api/weather`
- **参数**:
  - `city`: 城市名称
  - `lat` & `lon`: 经纬度坐标
- **特性**: 自动选择最快可用的API，支持故障转移

### 全球排行榜 API

- **路径**: `/api/global-rankings-fast`
- **返回**: 全球极端气候城市排行榜数据（最热、最冷）
- **性能**: 智能缓存，30分钟更新，覆盖21个极端气候城市

### API状态监控

- **路径**: `/api/api-status`
- **返回**: 所有API的实时状态、性能指标和使用统计

## 📱 部署

### Vercel 部署

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 添加环境变量（至少配置一个API密钥）：
   - `WEATHERAPI_KEY`
   - `OPENWEATHERMAP_API_KEY`
   - `VISUAL_CROSSING_API_KEY`（可选）
   - `TOMORROW_API_KEY`（可选）
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
