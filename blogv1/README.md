# AI 实验室博客

这是一个基于 Next.js 14 构建的现代化个人博客和 AI 应用展示平台。本项目集成了多个 AI 功能模块，包括智能对话、图像生成等功能，同时也作为个人博客分享技术见解和经验。

## 🌟 特性

- 💫 现代化的响应式界面设计
- 🤖 集成多个 AI 功能模块：
  - AI 星座运势：基于大语言模型的智能对话系统
  - AI 穿搭分析：智能穿搭分析与推荐系统
  - 代码助手：智能代码补全与优化工具
  - 数据可视化：交互式数据展示平台
- 📝 支持 Markdown 格式的博客系统
- 🎨 基于 Tailwind CSS 的美观界面
- 🔍 全站搜索功能
- 🌙 自适应暗色/亮色主题

## 🛠️ 技术栈

- **框架**: Next.js 14
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **AI 集成**:
  - Google Generative AI
  - OpenAI API
  - Hugging Face Inference API
- **部署**: Vercel
- **其他工具**:
  - ESLint & Prettier: 代码质量和格式化
  - Framer Motion: 动画效果
  - Axios: HTTP 请求

## 🚀 快速开始

### 环境要求

- Node.js 18.0.0 或更高版本
- npm 或 yarn 或 pnpm

### 安装步骤

1. 克隆项目
\`\`\`bash
git clone [your-repository-url]
cd blogv1
\`\`\`

2. 安装依赖
\`\`\`bash
npm install
# 或
yarn install
# 或
pnpm install
\`\`\`

3. 配置环境变量
\`\`\`bash
cp .env.example .env.local
\`\`\`
然后在 .env.local 中填入必要的环境变量：
- OPENAI_API_KEY
- GOOGLE_AI_API_KEY
- HUGGINGFACE_API_KEY
- UNSPLASH_ACCESS_KEY

4. 启动开发服务器
\`\`\`bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
\`\`\`

访问 [http://localhost:3000](http://localhost:3000) 查看运行结果。

## 📦 项目结构

\`\`\`
blogv1/
├── app/                # Next.js 13+ App Router 页面
├── components/         # 可复用组件
├── lib/               # 工具函数和服务
├── public/            # 静态资源
├── styles/            # 全局样式
├── types/             # TypeScript 类型定义
└── scripts/           # 工具脚本
\`\`\`

## 🚢 部署

本项目推荐使用 Vercel 进行部署：

1. 在 [Vercel](https://vercel.com) 创建账号
2. 导入你的 Git 仓库
3. 配置环境变量
4. 点击部署

也支持其他部署平台，如 Netlify 或自托管服务器。

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建你的特性分支 (\`git checkout -b feature/AmazingFeature\`)
3. 提交你的更改 (\`git commit -m 'Add some AmazingFeature'\`)
4. 推送到分支 (\`git push origin feature/AmazingFeature\`)
5. 开启一个 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📮 联系方式

- 作者：[hopewind]
- Email：[hopewind@gmail.com]
- Blog：[7hope.us.kg]

## 🙏 致谢

感谢以下开源项目：

- [Next.js](https://nextjs.org)
- [React](https://reactjs.org)
- [Tailwind CSS](https://tailwindcss.com)
- [Vercel](https://vercel.com)
