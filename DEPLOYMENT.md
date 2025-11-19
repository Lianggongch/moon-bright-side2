# GitHub Pages 部署说明

## GPS 权限问题排查

如果线上版本（GitHub Pages）无法请求 GPS 权限，可能的原因：

### 1. HTTPS 要求
- ✅ GitHub Pages 默认使用 HTTPS，应该没问题
- 检查浏览器地址栏是否显示 🔒 锁图标
- 如果显示"不安全"，需要检查 GitHub Pages 设置

### 2. 浏览器安全策略
- 某些浏览器（如 Chrome）要求地理位置 API 必须在用户交互后调用
- 解决方案：确保在用户点击/触摸后调用

### 3. GitHub Pages 配置
- 检查仓库 Settings → Pages
- Source 应该设置为 `main` 分支
- Custom domain 如果有，确保配置了 HTTPS

### 4. 代码检查
- 打开浏览器开发者工具（F12）
- 查看 Console 是否有错误信息
- 查看 Network 标签，检查是否有请求被阻止

### 5. 测试步骤
1. 打开 https://lianggongch.github.io/moon-bright-side2/
2. 打开开发者工具（F12）
3. 查看 Console 标签
4. 应该看到 "Requesting geolocation permission..."
5. 如果看到错误，记录错误信息

### 6. 常见错误
- `getCurrentPosition() and watchPosition() are deprecated on insecure origins` - 需要 HTTPS
- `User denied Geolocation` - 用户拒绝了权限
- `PositionError: timeout` - 超时，可能需要更长时间

## 解决方案

如果仍然无法工作，可以：
1. 添加一个"启用位置"按钮，让用户主动点击
2. 检查浏览器控制台的错误信息
3. 确认 GitHub Pages 使用的是 HTTPS

