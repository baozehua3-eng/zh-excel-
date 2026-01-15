# Excel文件对比工具

**版本：v1.0.1**

一个基于Web的Excel文件对比工具，支持对比两个Excel文件的数值、文本和表结构差异，并提供交互式冲突解决和导出功能。

## 功能特性

- 📊 支持对比Excel文件的数值、文本和表结构
- 🎨 高亮显示差异（并排对比视图）
- 🖱️ **点击差异单元格自动解决冲突**（点击文件A或B的单元格即可选择采用哪个文件的值）
- 👁️ **实时合并结果预览**（在文件下方实时显示合并后的结果）
- ⚙️ 默认解决策略设置（批量处理未解决的冲突）
- 💾 导出整合后的Excel文件

## 技术栈

- React + TypeScript
- Vite
- SheetJS (xlsx.js)

## 安装和运行

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 预览构建结果
npm run preview
```

## 使用说明

1. **上传文件**：上传两个Excel文件（支持拖拽或点击上传）
2. **自动对比**：系统自动对比并高亮显示所有差异
3. **解决冲突**：直接点击文件A或文件B中的差异单元格，自动采用该文件的值
   - 点击文件A的差异单元格 → 采用文件A的值
   - 点击文件B的差异单元格 → 采用文件B的值
   - 可以重复点击切换选择
4. **查看预览**：在文件下方实时查看合并结果预览
5. **批量处理**（可选）：使用默认解决策略批量处理未解决的冲突
6. **导出文件**：点击"导出整合后的Excel文件"按钮下载最终结果

### 使用技巧

- 🎯 **快速操作**：直接点击差异单元格即可解决冲突，无需额外操作
- 👀 **实时反馈**：合并预览会实时更新，随时查看最终结果
- 🔄 **灵活切换**：可以随时点击另一个文件的单元格来切换选择
- ⚡ **批量处理**：对于大量差异，可以使用默认策略一键处理

## Git 仓库设置

### 初始化 Git 仓库

```bash
# 初始化 Git 仓库
git init

# 添加所有文件
git add .

# 提交代码
git commit -m "Initial commit: Excel文件对比工具"
```

### 连接到 GitHub

1. **在 GitHub 上创建新仓库**
   - 访问 https://github.com/new
   - 输入仓库名称（例如：`excel-compare-tool`）
   - 选择 Public 或 Private
   - **不要**勾选 "Initialize this repository with a README"
   - 点击 "Create repository"

2. **推送代码到 GitHub**

```bash
# 添加远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/你的用户名/excel-compare-tool.git

# 设置主分支
git branch -M main

# 推送代码
git push -u origin main
```

### 日常开发工作流

```bash
# 1. 查看修改状态
git status

# 2. 添加修改的文件
git add .

# 或者添加特定文件
git add src/components/FileUploader.tsx

# 3. 提交修改
git commit -m "描述你的修改内容"

# 4. 推送到 GitHub
git push
```

### 分支管理（可选）

```bash
# 创建新功能分支
git checkout -b feature/新功能名称

# 开发完成后合并到主分支
git checkout main
git merge feature/新功能名称
git push
```

## 在线部署

### 使用 Vercel 部署（推荐）

1. **通过 GitHub 自动部署**
   - 访问 https://vercel.com
   - 使用 GitHub 账号登录
   - 点击 "New Project"
   - 选择你的 GitHub 仓库
   - 框架预设选择 "Vite"
   - 点击 "Deploy"
   - 等待 1-2 分钟，获得在线访问链接

2. **手动部署**
   ```bash
   # 构建项目
   npm run build
   
   # 将 dist 文件夹上传到 Vercel
   # 访问 https://vercel.com → Add New → Upload
   ```

### 使用 Netlify 部署

1. 访问 https://www.netlify.com
2. 连接 GitHub 仓库或直接上传 `dist` 文件夹
3. 自动部署完成

部署后，任何人都可以通过链接访问你的工具，无需本地安装！

---

## 版本历史

### v1.0.1 (当前版本)
- ✨ 新增：点击差异单元格自动解决冲突功能
- ✨ 新增：实时合并结果预览
- 🎨 优化：简化操作流程，移除差异清单视图
- 🎨 优化：改进用户界面和交互体验

### v1.0.0
- 🎉 初始版本发布
- 📊 基础Excel文件对比功能
- 🔧 交互式冲突解决
- 💾 Excel文件导出功能
