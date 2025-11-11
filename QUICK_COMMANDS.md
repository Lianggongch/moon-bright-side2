# 快速命令行操作指南

## 一键完成所有操作

打开 PowerShell 或 CMD，复制粘贴以下命令：

```bash
# 1. 进入项目目录
cd "C:\Users\lenovo\Desktop\月之亮面"

# 2. 查看有哪些文件被修改了
git status

# 3. 添加所有修改的文件
git add .

# 4. 提交更改
git commit -m "修复GitHub Actions部署问题"

# 5. 推送到GitHub
git push origin main
```

## 如果推送失败（网络问题）

如果第5步失败，可以尝试：

```bash
# 方法1：增加超时时间后重试
git config --global http.postBuffer 524288000
git push origin main

# 方法2：如果使用代理，设置代理（替换为你的代理地址和端口）
git config --global http.proxy http://127.0.0.1:7890
git config --global https.proxy http://127.0.0.1:7890
git push origin main

# 方法3：取消代理设置（如果之前设置过）
git config --global --unset http.proxy
git config --global --unset https.proxy
git push origin main
```

## 推送成功后

1. 访问：https://github.com/Lianggongch/moon-bright-side/actions
2. 查看最新的工作流运行状态
3. 如果显示绿色✓，说明部署成功
4. 访问网站：https://Lianggongch.github.io/moon-bright-side/

## 如果还是失败

使用 GitHub Desktop 图形界面会更简单：
1. 打开 GitHub Desktop
2. 点击 "Push origin" 按钮
3. 完成！

