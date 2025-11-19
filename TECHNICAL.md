# 技术文档

## 技术栈

### 前端框架
- **React 18.2.0** - UI框架
- **TypeScript 5.0+** - 类型安全
- **Vite 4.3.0** - 构建工具

### 样式
- **内联样式** - 直接使用style属性，确保样式一致性
- CSS变量定义在`index.html`中

### API服务

#### 1. IPGeolocation Astronomy API
- **用途**: 获取月亮方位角、高度角、月升月落时间
- **端点**: `https://api.ipgeolocation.io/astronomy`
- **参数**: `apiKey`, `lat`, `long`, `date`
- **返回字段**: `moon_azimuth`, `moon_altitude`, `moonrise`, `moonset`
- **API密钥**: `da4ee14a6a904b369cf22b13bcfade57`

#### 2. Visual Crossing Weather API
- **用途**: 获取云量数据
- **端点**: `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/{lat},{lon}/{date}`
- **参数**: `key`, `unitGroup=metric`, `include=current`
- **返回字段**: `currentConditions.cloudcover`
- **API密钥**: `K84ZRGQH2W3662DSD9QKHY239`

#### 3. Nominatim API (OpenStreetMap)
- **用途**: 逆地理编码（坐标转城市名称）
- **端点**: `https://nominatim.openstreetmap.org/reverse`
- **参数**: `format=json`, `lat`, `lon`, `zoom=10`, `addressdetails=1`
- **返回字段**: `address.city`, `address.town`, `address.state`

### 浏览器API

#### Geolocation API
- **用途**: 获取GPS坐标
- **方法**: `navigator.geolocation.getCurrentPosition()`
- **权限**: 需要用户授权

#### Device Orientation API
- **用途**: 获取陀螺仪数据（设备方向）
- **事件**: `deviceorientation`
- **字段**: `alpha` (方位角), `beta` (前后倾斜), `gamma` (左右倾斜)
- **权限**: iOS 13+需要用户交互请求权限

## 核心算法

### 月亮可见度计算
```
水平对齐度 = cos((角度差 / 30) * π/2) * 100
高度角因子 = sin((高度角 / 90) * π/2) * 100
云量因子 = 100 - 云量百分比
月相因子 = 月相照明度 * 100
最终可见度 = (水平对齐度 × 高度角因子 × 云量因子 × 月相因子) / 100³
```

### 月相计算
- 使用`moonPhaseCalculator.ts`模块
- 基于Jean Meeus的《Astronomical Algorithms》
- 计算儒略日、月龄、照明度

## 配置文件

### package.json
- 依赖: `react`, `react-dom`
- 开发依赖: `@types/react`, `@types/react-dom`, `@vitejs/plugin-react`, `typescript`, `vite`, `tailwindcss`, `postcss`, `autoprefixer`

### vite.config.ts
- 插件: `@vitejs/plugin-react`
- 基础路径: `./`
- 输出目录: `dist`

### tsconfig.json
- 目标: ES2020
- JSX: react-jsx
- 模块解析: bundler
- 包含: `*.tsx`, `*.ts`
- 排除: `node_modules`, `dist`, `vite.config.ts`, `tailwind.config.js`

### tsconfig.node.json
- 用于Node.js环境配置文件（如vite.config.ts）

## 项目结构

```
月之亮面/
├── index.html              # HTML入口，定义CSS变量
├── main.tsx                # React入口文件
├── index.tsx              # 主组件（Image）
├── moonPhaseCalculator.ts  # 月相计算模块
├── vite.config.ts         # Vite配置
├── tsconfig.json          # TypeScript配置
├── tsconfig.node.json     # Node环境TypeScript配置
├── tailwind.config.js     # Tailwind配置（已不使用）
├── package.json           # 项目依赖
└── README.md              # 项目说明
```

## 部署

### GitHub Pages
- 使用GitHub Actions自动部署
- 工作流文件: `.github/workflows/deploy.yml`
- 构建命令: `npm install && npm run build`
- 输出目录: `dist`

## 注意事项

1. **HTTPS要求**: GPS和陀螺仪API需要在HTTPS环境下使用（或localhost）
2. **权限要求**: 需要用户授权GPS和陀螺仪权限
3. **iOS限制**: iOS 13+需要用户交互才能请求陀螺仪权限
4. **API限制**: 注意各API的调用频率限制


