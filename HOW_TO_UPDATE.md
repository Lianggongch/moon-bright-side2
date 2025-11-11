# 如何替换GitHub上的文件

## 🔄 方法一：使用Git命令行（推荐）

### 1. 进入项目目录
```bash
cd "C:\Users\lenovo\Desktop\月之亮面"
```

### 2. 检查当前状态
```bash
git status
```

### 3. 添加修改的文件
```bash
git add test-complete.html
```

### 4. 提交更改
```bash
git commit -m "修复iOS陀螺仪权限请求问题"
```

### 5. 推送到GitHub
```bash
git push origin main
```

## 🔄 方法二：使用GitHub网页界面

1. **进入你的GitHub仓库**
   - 访问：`https://github.com/你的用户名/仓库名`

2. **点击要替换的文件**
   - 点击 `test-complete.html`

3. **点击编辑按钮**
   - 点击右上角的 ✏️ (Edit) 按钮

4. **粘贴新内容**
   - 删除旧内容
   - 粘贴修复后的新内容

5. **提交更改**
   - 在页面底部填写提交信息："修复iOS陀螺仪权限请求问题"
   - 点击 "Commit changes"

## 🔄 方法三：使用GitHub Desktop

1. **打开GitHub Desktop**
2. **选择你的仓库**
3. **查看更改**
   - 左侧会显示修改的文件
4. **填写提交信息**
   - "修复iOS陀螺仪权限请求问题"
5. **点击 "Commit to main"**
6. **点击 "Push origin"**

## ✅ 验证更新

推送完成后，等待几分钟，然后：
1. 访问你的GitHub Pages地址
2. 在iOS设备上测试陀螺仪功能
3. 应该能看到"请求陀螺仪权限"按钮
4. 点击按钮后应该弹出权限请求对话框

## 🔍 本次修复内容

- ✅ 添加了iOS设备检测
- ✅ iOS设备强制显示权限请求按钮
- ✅ 改进了权限请求的错误处理
- ✅ 添加了更详细的状态提示
- ✅ 修复了定时器重复创建的问题
- ✅ 添加了数据验证（NaN检查）

