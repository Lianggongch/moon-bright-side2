# 解决Git推送网络问题

## 问题诊断
错误信息：`fatal: unable to access 'https://github.com/...': Recv failure: Connection was reset`

这是**网络连接问题**，不是代码问题。可能的原因：
- 网络不稳定
- 防火墙/代理设置
- GitHub服务器临时问题

## 解决方案

### 方案1：直接重试（推荐）
```bash
git push origin main
```
网络问题通常是暂时的，重试几次可能就能成功。

### 方案2：检查Git配置
```bash
# 检查远程仓库地址
git remote -v

# 如果使用HTTPS，可以尝试增加缓冲区大小
git config --global http.postBuffer 524288000
git config --global http.lowSpeedLimit 0
git config --global http.lowSpeedTime 999999

# 然后重试
git push origin main
```

### 方案3：使用SSH代替HTTPS（如果已配置SSH密钥）
```bash
# 查看当前远程地址
git remote get-url origin

# 如果显示HTTPS地址，改为SSH
git remote set-url origin git@github.com:Lianggongch/moon-bright-side.git

# 然后推送
git push origin main
```

### 方案4：使用GitHub Desktop
如果命令行一直失败，可以使用GitHub Desktop图形界面推送，通常更稳定。

## 关于GitHub Pages网址

GitHub Pages的网址格式是：
```
https://你的用户名.github.io/仓库名/
```

对于你的项目：
```
https://Lianggongch.github.io/moon-bright-side/
```

**注意**：
- 网址不会因为推送失败而改变
- 只有成功部署后，网站才能访问
- 如果部署失败，网站会显示404或之前的版本

## 检查部署状态

推送成功后，检查部署状态：
1. 访问：`https://github.com/Lianggongch/moon-bright-side/actions`
2. 查看最新的工作流运行状态
3. 如果显示绿色✓，说明部署成功
4. 然后访问：`https://Lianggongch.github.io/moon-bright-side/`

## 如果一直失败

可以尝试：
1. 更换网络（比如手机热点）
2. 使用VPN
3. 等待一段时间后重试
4. 检查是否有防火墙阻止

