'use client'//客户端

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Github, 
  Twitter, 
  Linkedin, 
  Moon, 
  Sun, 
  Code, 
  Terminal, 
  Globe, 
  BookOpen, 
  ArrowUpRight, 
  Mail,
  ChevronLeft,
  Sparkles,
  Layers,
  Zap,
  Search,
  Clock,
  Calendar,
  Briefcase,
  Send,
  MessageSquare,
  MapPin,
  Download,
  Bot,
  Loader2,
  X,
  ExternalLink,
  Play
} from 'lucide-react';

// --- Gemini API 配置 ---
const apiKey = ""; // 系统会自动注入 API Key

// Gemini API 调用辅助函数
const callGemini = async (prompt: string, systemInstruction = "") => {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "抱歉，我暂时无法回答这个问题。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI 服务暂时不可用，请稍后再试。";
  }
};

// --- 样式注入 (用于自定义动画) ---
const CustomStyles = () => (
  <style>{`
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    @keyframes gradient-xy {
      0%, 100% { background-size: 400% 400%; background-position: left center; }
      50% { background-size: 200% 200%; background-position: right center; }
    }
    .animate-float {
      animation: float 6s ease-in-out infinite;
    }
    .animate-gradient {
      background-size: 200% 200%;
      animation: gradient-xy 8s ease infinite;
    }
    .glass-panel {
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.6);
    }
    /* 这里的 CSS 依赖父级有 .dark 类，现在我们会把它加到 html 标签上 */
    .dark .glass-panel {
      background: rgba(24, 24, 27, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    /* 文章/项目详情排版优化 */
    .prose-custom {
      color: inherit;
      max-width: 65ch;
    }
    .prose-custom h2 {
      margin-top: 2em;
      margin-bottom: 0.8em;
      font-weight: 800;
      font-size: 1.75em;
      line-height: 1.2;
      letter-spacing: -0.02em;
    }
    .prose-custom h3 {
      margin-top: 1.5em;
      margin-bottom: 0.6em;
      font-weight: 700;
      font-size: 1.4em;
    }
    .prose-custom p {
      margin-bottom: 1.5em;
      line-height: 1.8;
      opacity: 0.9;
    }
    .prose-custom ul {
      list-style-type: disc;
      padding-left: 1.6em;
      margin-bottom: 1.5em;
      opacity: 0.9;
    }
    .prose-custom li {
      margin-bottom: 0.5em;
      padding-left: 0.4em;
    }
    .prose-custom strong {
      font-weight: 700;
      color: inherit;
    }
    .prose-custom blockquote {
      border-left: 4px solid #6366f1;
      padding-left: 1em;
      margin-left: 0;
      margin-right: 0;
      font-style: italic;
      opacity: 0.8;
      background: rgba(99, 102, 241, 0.1);
      padding: 1em;
      border-radius: 0 8px 8px 0;
    }
    .prose-custom code {
      background: rgba(125,125,125,0.15);
      padding: 0.2em 0.4em;
      border-radius: 6px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.9em;
      color: #ef4444;
    }
    .dark .prose-custom code {
      color: #f472b6;
    }
    .hide-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .hide-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    /* Timeline Line Fix */
    .timeline-line::before {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      left: 19px; 
      width: 2px;
      background: #e4e4e7;
      z-index: 0;
    }
    .dark .timeline-line::before {
      background: #27272a;
    }
    /* Chat Widget Animation */
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-slide-up {
      animation: slideUp 0.3s ease-out forwards;
    }
  `}</style>
);

// --- 数据类型 ---
type Project = {
  id: number;
  title: string;
  description: string;
  tags: string[];
  link: string;
  github: string;
  color: string;
  content: string;
};

type Service = {
  title: string;
  desc: string;
  icon: typeof Globe;
};

type ExperienceItem = {
  year: string;
  role: string;
  company: string;
  description: string;
};

type BlogPost = {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
  content: string;
};

// --- 数据 ---
const PROJECTS: Project[] = [
  {
    id: 1,
    title: "Nebula Dashboard",
    description: "下一代电商数据可视化平台，支持千万级数据实时渲染。利用 WebWorker 进行数据预处理，通过 WebGL 实现高性能图表绘制。",
    tags: ["React", "WebGL", "Rust", "D3.js"],
    link: "#",
    github: "#",
    color: "from-purple-500 to-indigo-500",
    content: `
      <h3>项目背景</h3>
      <p>在处理千万级别的电商大促数据时，传统的 DOM 图表方案会导致浏览器主线程阻塞，页面卡顿严重。Nebula Dashboard 旨在解决这一性能瓶颈。</p>
      
      <h3>技术挑战</h3>
      <ul>
        <li><strong>海量数据渲染：</strong> 如何在 16ms 内渲染 10万+ 数据点？</li>
        <li><strong>数据计算阻塞：</strong> 复杂的数据聚合计算会占用 UI 线程。</li>
      </ul>

      <h3>解决方案</h3>
      <p>我们采用 <strong>Rust + WebAssembly</strong> 编写核心计算模块，相比 JS 提升了 4 倍计算效率。渲染层使用自定义 WebGL着色器，配合 <strong>OffscreenCanvas</strong> 在 Worker 线程进行绘制。</p>
      
      <h3>成果</h3>
      <p>最终实现了 60fps 的流畅交互体验，即使在数据量达到 500万条时，首屏加载时间也被控制在 1.5秒以内。</p>
    `
  },
  {
    id: 2,
    title: "Aether Chat",
    description: "基于 LLM 的智能助手，具备记忆上下文与多模态理解能力。集成了 LangChain 处理复杂任务链。",
    tags: ["Next.js", "OpenAI", "Vector DB", "LangChain"],
    link: "#",
    github: "#",
    color: "from-emerald-400 to-cyan-500",
    content: `
      <h3>产品愿景</h3>
      <p>打造一个不仅仅是“聊天”，而是能真正理解用户意图并执行复杂任务流的 AI 助手。</p>
      
      <h3>核心架构</h3>
      <p>项目基于 <strong>Next.js 14 (App Router)</strong> 构建，使用 <strong>LangChain</strong> 编排 Agent 逻辑。为了保护用户隐私，我们引入了本地向量数据库进行知识库检索 (RAG)，敏感数据不上云。</p>
      
      <h3>特色功能</h3>
      <ul>
        <li><strong>多模态输入：</strong> 支持上传图片和文档进行分析。</li>
        <li><strong>流式响应：</strong> 采用 RSC + Streaming 技术，实现打字机效果，降低首字节时间 (TTFB)。</li>
      </ul>
    `
  },
  {
    id: 3,
    title: "Pixel Perfect",
    description: "面向设计师与开发者的协作工具，自动将 Figma 设计稿转换为高质量的 Tailwind 代码。",
    tags: ["Electron", "Vue 3", "Vite", "AST"],
    link: "#",
    github: "#",
    color: "from-orange-400 to-rose-500",
    content: `
      <h3>痛点分析</h3>
      <p>设计师的 Figma稿到开发者的代码之间，总是存在还原度不高、沟通成本大的问题。</p>
      
      <h3>实现原理</h3>
      <p>Pixel Perfect 是一个 Electron 桌面应用。它通过 Figma API 获取节点数据，利用 <strong>AST (抽象语法树)</strong> 转换技术，将设计属性智能映射为 Tailwind CSS 类名，并自动合并冗余样式。</p>
    `
  },
  {
    id: 4,
    title: "Zenith UI",
    description: "一套企业级、无障碍优先 (A11y) 的 React 组件库。全量覆盖 WAI-ARIA 标准。",
    tags: ["TypeScript", "A11y", "Design System", "Storybook"],
    link: "#",
    github: "#",
    color: "from-blue-400 to-blue-600",
    content: `
      <h3>设计理念</h3>
      <p>“无障碍不是特性，而是标配。” Zenith UI 的每一个组件都经过严格的屏幕阅读器测试，确保键盘导航和语义化的完整性。</p>
      
      <h3>工程化实践</h3>
      <p>使用 <strong>Turborepo</strong> 管理 Monorepo 仓库，结合 <strong>Storybook</strong> 进行文档编写和可视化测试。发布流程完全自动化，支持按需加载和 Tree Shaking。</p>
    `
  },
  {
    id: 5,
    title: "FlowMotion 3D",
    description: "基于 Three.js 的 3D 产品展示落地页生成器。支持拖拽式场景搭建、PBR 材质调节。",
    tags: ["Three.js", "React Three Fiber", "GSAP"],
    link: "#",
    github: "#",
    color: "from-pink-500 to-rose-500",
    content: `
      <h3>交互体验</h3>
      <p>为营销活动页提供沉浸式的 3D 体验。用户可以360度旋转查看产品细节，配合 GSAP 动画，实现丝滑的滚动视差效果。</p>
    `
  },
  {
    id: 6,
    title: "Nomad Notes",
    description: "一款专注于离线优先体验的 React Native 笔记应用。使用 CRDT 算法解决多端数据同步冲突。",
    tags: ["React Native", "Local-First", "SQLite", "CRDT"],
    link: "#",
    github: "#",
    color: "from-amber-400 to-orange-500",
    content: `
      <h3>离线优先 (Local-First)</h3>
      <p>在弱网或无网环境下依然可用。数据优先存储在本地 SQLite，网络恢复后通过 CRDT (冲突避免复制数据类型) 算法自动合并多端修改，真正做到“数据在手，随时同步”。</p>
    `
  }
];

const SERVICES: Service[] = [
  { title: "Web 应用开发", desc: "从零构建高性能、可扩展的单页应用 (SPA) 和全栈解决方案。", icon: Globe },
  { title: "UI/UX 设计", desc: "以用户体验为核心的界面设计，兼顾美学与交互流畅度。", icon: Layers },
  { title: "前端架构咨询", desc: "为团队提供技术选型、代码规范及性能优化建议。", icon: Zap },
  { title: "技术写作与培训", desc: "编写清晰的技术文档，进行内部技术分享与指导。", icon: BookOpen },
];

const EXPERIENCE: ExperienceItem[] = [
  {
    year: "2022 - 至今",
    role: "Senior Frontend Engineer",
    company: "TechFlow Inc.",
    description: "负责公司核心 SaaS 产品的架构重构，将首屏加载速度提升了 40%。主导设计系统的搭建，统一了全线产品的 UI 风格。"
  },
  {
    year: "2019 - 2022",
    role: "Frontend Developer",
    company: "Creative Digital",
    description: "参与多个大型电商项目的开发。引入了自动化测试流程，将 Bug 率降低了 25%。"
  },
  {
    year: "2018 - 2019",
    role: "Junior Web Developer",
    company: "StartUp Studio",
    description: "负责企业官网及营销 H5 的快速迭代开发，积累了丰富的响应式布局经验。"
  }
];

const BLOG_CATEGORIES = ["全部", "工程化", "设计", "职业思考", "生活"];

const BLOG_POSTS: BlogPost[] = [
  {
    id: 1,
    title: "重构思维：从 MVC 到 Server Components",
    excerpt: "Web 开发范式正在经历十年未有之变局，RSC 不仅仅是性能优化，更是架构哲学的回归。",
    date: "2023-11-12",
    readTime: "6 min",
    category: "工程化",
    content: `
      <p>在过去的十年里，我们习惯了客户端渲染（CSR）带来的交互红利，但也逐渐感受到了 Bundle 体积膨胀带来的性能瓶颈。<strong>React Server Components (RSC)</strong> 的出现，标志着钟摆开始回调。</p>
      <h2>为什么我们需要 RSC？</h2>
      <p>简单来说，RSC 允许我们将组件逻辑直接在服务器上运行，只发送渲染结果（HTML/JSON）给客户端。这意味着：</p>
      <ul>
        <li>零 Bundle Size 的依赖库</li>
        <li>直接访问后端数据库</li>
        <li>自动的代码分割</li>
      </ul>
      <blockquote>这不仅仅是性能优化，更是一种思维方式的转变。</blockquote>
      <p>我们不再需要在 <code>useEffect</code> 中请求数据，数据获取变得像定义变量一样自然。</p>
    `
  },
  {
    id: 2,
    title: "CSS 魔法：探索 View Transitions API",
    excerpt: "原生支持的页面转场动画终于来了，让我们看看如何用几行代码实现 App 级的流畅体验。",
    date: "2023-10-28",
    readTime: "4 min",
    category: "设计",
    content: `
      <p>以前要在 Web 上实现平滑的页面过渡（Shared Element Transitions）是非常痛苦的，往往需要复杂的 JavaScript 计算坐标。</p>
      <h2>原生支持的转场</h2>
      <p>现在，浏览器原生支持了 <strong>View Transitions API</strong>。你只需要调用 <code>document.startViewTransition()</code>，浏览器就会自动捕获旧状态和新状态，并进行平滑过渡。</p>
      <p>这对于构建类 App 体验的单页应用（SPA）来说，是一个巨大的飞跃。</p>
    `
  },
  {
    id: 3,
    title: "前端基础设施的 Rust 化",
    excerpt: "为什么前端基础设施正在被 Rust 重写？作为 JS 开发者，我们该如何拥抱这波浪潮。",
    date: "2023-09-15",
    readTime: "10 min",
    category: "工程化",
    content: `
      <p>从 SWC 到 Turbopack，前端工具链正在经历一场“Rust化”的革命。为什么是 Rust？</p>
      <p>除了众所周知的性能优势（比 Node.js 快 20-100 倍），Rust 的内存安全和类型系统让构建复杂的编译器变得更加可靠。</p>
    `
  }
];

// --- 高级组件 ---

// 聚光灯效果卡片
type SpotlightCardProps = {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
};

const SpotlightCard = ({
  children,
  className = "",
  onClick,
}: SpotlightCardProps) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const div = divRef.current;
    const rect = div.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseEnter = () => setOpacity(1);
  const handleMouseLeave = () => setOpacity(0);

  return (
    <div
      ref={divRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/50 shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px transition duration-300 opacity-0 group-hover:opacity-100"
        style={{
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(120,119,198,0.1), transparent 40%)`,
        }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
};

type NavItemProps = {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  showLabel: boolean;
};

// 导航栏项
const NavItem = ({ active, onClick, icon: Icon, label, showLabel }: NavItemProps) => (
  <button
    onClick={onClick}
    className={`relative flex items-center gap-2 px-2 sm:px-3 md:px-4 py-2 md:py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
      active
        ? "text-zinc-900 dark:text-white bg-white dark:bg-zinc-800 shadow-md scale-105"
        : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
    }`}
  >
    <Icon size={16} />
    <span className={`${showLabel ? 'hidden md:inline' : 'hidden'}`}>{label}</span>
  </button>
);

// Gemini Chat Widget
const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: '你好！我是 Alex 的 AI 数字助手。你可以问我关于 Alex 的工作经历、项目经验或者技术栈的问题。' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // 构建 System Prompt，注入简历数据
    const systemPrompt = `
      你现在是 Alex 的个人网站 AI 助手。你的任务是以专业、友好且带有一点点幽默感的口吻，回答访客关于 Alex 的问题。
      
      这是 Alex 的背景数据：
      - 核心技能：React 19, TypeScript, Next.js, Tailwind, Rust.
      - 工作经历：${JSON.stringify(EXPERIENCE)}
      - 项目经验：${JSON.stringify(PROJECTS)}
      - 提供的服务：${JSON.stringify(SERVICES)}
      
      请遵循以下规则：
      1. 使用第一人称复数（“我们”）或第三人称（“Alex”）来回答。
      2. 如果被问到你不知道的问题，请诚实回答，并建议访客通过“联系”页面发送邮件。
      3. 尽量简短精炼，除非用户要求详细解释。
      4. 回答要是中文。
    `;

    const responseText = await callGemini(userMessage.text, systemPrompt);
    
    setMessages(prev => [...prev, { role: 'assistant', text: responseText }]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-80 md:w-96 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[500px]">
          {/* Header */}
          <div className="p-4 bg-indigo-600 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <span className="font-bold">Ask Alex AI ✨</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-indigo-700 p-1 rounded"><X size={18} /></button>
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50 dark:bg-black/20">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-none' 
                    : 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded-bl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-zinc-800 p-3 rounded-xl rounded-bl-none border border-zinc-200 dark:border-zinc-700">
                  <Loader2 size={16} className="animate-spin text-indigo-500" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2 px-4 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full shadow-xl hover:scale-105 transition-all font-medium"
      >
        {isOpen ? (
          <>关闭对话</>
        ) : (
          <>
            <Sparkles size={18} className="text-yellow-400 dark:text-purple-600" />
            Ask AI
          </>
        )}
      </button>
    </div>
  );
};

// 页脚
const Footer = () => (
  <footer className="mt-20 py-10 border-t border-zinc-200 dark:border-zinc-800 text-center">
    <div className="flex justify-center gap-6 mb-6">
      <a href="#" className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"><Github size={20} /></a>
      <a href="#" className="text-zinc-400 hover:text-blue-400 transition-colors"><Twitter size={20} /></a>
      <a href="#" className="text-zinc-400 hover:text-blue-700 transition-colors"><Linkedin size={20} /></a>
    </div>
    <p className="text-zinc-500 dark:text-zinc-500 text-sm">
      © {new Date().getFullYear()} Alex.Design. All rights reserved. <br className="sm:hidden"/> Crafted with React & Tailwind.
    </p>
  </footer>
);

// --- 页面组件 ---

export default function PersonalWebsite() {
  // 初始化 Theme 状态，优先从 localStorage 读取
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
             (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return true; // 默认为深色
  });

  const [activeTab, setActiveTab] = useState('home');
  const [scrolled, setScrolled] = useState(false);
  
  // 博客相关状态
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  // Project Detail State
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedProjectTag, setSelectedProjectTag] = useState("All"); 
  
  // AI Summary State
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  // 联系表单状态
  const [formStatus, setFormStatus] = useState('idle'); 

  // 监听滚动
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- 核心修改：同步 Dark Mode 到 <html> 标签 (document.documentElement) ---
  // 这是 Next.js + Tailwind 'class' 模式的标准做法
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSelectedPost(null);
    setSelectedProject(null); 
    setSelectedProjectTag("All"); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // 博客筛选逻辑
  const filteredPosts = useMemo(() => {
    return BLOG_POSTS.filter(post => {
      const matchesCategory = selectedCategory === "全部" || post.category === selectedCategory;
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // 项目筛选逻辑
  const uniqueTags = useMemo(() => {
    const tags = new Set(["All"]);
    PROJECTS.forEach(project => {
      project.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }, []);

  const filteredProjects = useMemo(() => {
    if (selectedProjectTag === "All") {
      return PROJECTS;
    }
    return PROJECTS.filter(project => project.tags.includes(selectedProjectTag));
  }, [selectedProjectTag]);

  const handleBackToBlog = () => {
    setSelectedPost(null);
    setSummary(null); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToProjects = () => {
    setSelectedProject(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGenerateSummary = async () => {
    if (!selectedPost) return;
    setIsSummarizing(true);
    const prompt = `请用中文为以下技术博客文章生成一个简短的、包含3个要点的摘要 (Bullet points)。文章内容：${selectedPost.content}`;
    const result = await callGemini(prompt);
    setSummary(result);
    setIsSummarizing(false);
  };

  const handleContactSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormStatus('submitting');
    setTimeout(() => {
      setFormStatus('success');
    }, 1500);
  };

  return (
    // 移除了这里 className 上的 'dark' 类，因为现在直接加在 html 标签上了
    <div className={`min-h-screen font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-300`}>
      <CustomStyles />
      
      {/* 全局背景 */}
      <div className="fixed inset-0 -z-10 bg-zinc-50 dark:bg-black transition-colors duration-500">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-400/20 dark:bg-purple-900/20 blur-[120px] animate-float" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-400/20 dark:bg-blue-900/10 blur-[120px] animate-float" style={{ animationDelay: '-3s' }} />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 dark:brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      {/* 悬浮导航栏 */}
      <nav className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${scrolled ? 'w-[90%] max-w-md' : 'w-[95%] max-w-4xl'}`}>
        <div className="glass-panel rounded-full px-2 py-2 flex items-center justify-between shadow-2xl shadow-black/5 dark:shadow-black/50 ring-1 ring-white/20">
          <div className="flex items-center gap-2 pl-3 pr-4 cursor-pointer group" onClick={() => handleTabChange('home')}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:scale-110 transition-transform shrink-0">
              A
            </div>
            {/* 修复逻辑：Logo 文字只在未滚动且屏幕宽度大于 sm 时显示 */}
            {!scrolled && <span className="hidden sm:inline font-bold text-zinc-800 dark:text-white tracking-tight group-hover:text-indigo-500 transition-colors whitespace-nowrap">Alex.Design</span>}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* 修复逻辑：showLabel={!scrolled} - 滚动时隐藏所有文字，变成纯图标模式 */}
            <NavItem active={activeTab === 'home'} onClick={() => handleTabChange('home')} icon={Layers} label="首页" showLabel={!scrolled} />
            <NavItem active={activeTab === 'projects'} onClick={() => handleTabChange('projects')} icon={Terminal} label="作品" showLabel={!scrolled} />
            <NavItem active={activeTab === 'about'} onClick={() => handleTabChange('about')} icon={Sparkles} label="关于" showLabel={!scrolled} />
            <NavItem active={activeTab === 'blog'} onClick={() => handleTabChange('blog')} icon={BookOpen} label="博客" showLabel={!scrolled} />
            <NavItem active={activeTab === 'contact'} onClick={() => handleTabChange('contact')} icon={MessageSquare} label="联系" showLabel={!scrolled} />
          </div>

          <button 
            onClick={toggleTheme}
            className="p-2.5 rounded-full text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors ml-1 shrink-0"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </nav>

      {/* 主内容区域 */}
      <main className="pt-36 pb-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto transition-all duration-500 min-h-screen flex flex-col">
        
        {activeTab === 'home' && (
          <div className="space-y-24 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Hero Section */}
            <section className="text-center space-y-8 py-10 relative">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-100 dark:border-emerald-500/20 tracking-wide uppercase mb-4">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                接受远程协作 / 自由职业
              </div>
              
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter text-zinc-900 dark:text-white leading-[0.9]">
                Building Digital <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-gradient">Future.</span>
              </h1>
              
              <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                你好，我是 Alex。一名热衷于构建极致体验的前端架构师。
                <br className="hidden md:block"/>
                我通过代码与设计的融合，帮助企业和个人将想法转化为现实。
              </p>

              <div className="flex items-center justify-center gap-4 pt-4">
                <button onClick={() => handleTabChange('projects')} className="px-8 py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full font-bold hover:scale-105 transition-transform shadow-lg hover:shadow-xl">
                  查看作品
                </button>
                <button onClick={() => handleTabChange('contact')} className="px-8 py-4 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 rounded-full font-bold hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">
                  联系我
                </button>
              </div>
            </section>

            {/* Services Section */}
            <section>
              <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-10 text-center">我的专业领域</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {SERVICES.map((service, idx) => (
                  <SpotlightCard key={idx} className="p-6 text-center hover:-translate-y-1">
                    <div className="w-12 h-12 mx-auto bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-4">
                      <service.icon size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">{service.title}</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      {service.desc}
                    </p>
                  </SpotlightCard>
                ))}
              </div>
            </section>

            {/* Featured Work Preview */}
            <section className="bg-zinc-100 dark:bg-zinc-900/50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-20 rounded-3xl">
               <div className="max-w-5xl mx-auto">
                 <div className="flex justify-between items-end mb-10">
                   <div>
                     <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">精选案例</h2>
                     <p className="text-zinc-500">最近的一些开发项目与实验。</p>
                   </div>
                   <button onClick={() => handleTabChange('projects')} className="flex items-center text-indigo-600 dark:text-indigo-400 font-medium hover:gap-2 transition-all">
                     查看全部 <ArrowUpRight size={18} className="ml-1"/>
                   </button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {PROJECTS.slice(0, 2).map(project => (
                     <div 
                      key={project.id} 
                      className="group cursor-pointer" 
                      onClick={() => {
                        handleTabChange('projects');
                        setSelectedProject(project);
                      }}
                    >
                       <div className={`w-full aspect-video rounded-2xl bg-gradient-to-br ${project.color} mb-4 opacity-90 group-hover:opacity-100 transition-opacity shadow-lg`} />
                       <h3 className="text-xl font-bold text-zinc-900 dark:text-white group-hover:text-indigo-500 transition-colors">{project.title}</h3>
                       <p className="text-zinc-500 text-sm mt-1">{project.description}</p>
                     </div>
                   ))}
                 </div>
               </div>
            </section>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
             {!selectedProject ? (
               <>
                {/* Projects List View */}
                 <div className="text-center mb-10">
                   <h2 className="text-4xl font-bold text-zinc-900 dark:text-white mb-4">作品集</h2>
                   <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
                     这里汇集了我参与的商业项目、开源贡献以及一些有趣的个人实验。点击卡片查看详细介绍。
                   </p>
                 </div>
                 
                 {/* ✨ NEW: Project Tag Filter Section ✨ */}
                 <div className="flex flex-wrap justify-center gap-3 mb-12 p-4 bg-white dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-lg">
                    {uniqueTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => setSelectedProjectTag(tag)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                          selectedProjectTag === tag
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                            : 'text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                 </div>
                 
                 {/* Project Grid - now uses filteredProjects */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {filteredProjects.length > 0 ? (
                     filteredProjects.map((project) => (
                       <SpotlightCard 
                          key={project.id} 
                          className="group h-full"
                          onClick={() => {
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                            setSelectedProject(project);
                          }}
                        >
                         <div className="flex flex-col h-full">
                           <div className={`w-full h-48 bg-gradient-to-br ${project.color} relative overflow-hidden`}>
                             <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                             <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-black/80 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                               <Code size={12} /> 点击查看详情
                             </div>
                           </div>
                           <div className="p-8 flex-grow flex flex-col">
                             <div className="flex justify-between items-start mb-4">
                               <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">{project.title}</h3>
                               <ArrowUpRight className="text-zinc-400 group-hover:text-indigo-500 transition-colors" />
                             </div>
                             <p className="text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed flex-grow">
                               {project.description}
                             </p>
                             <div className="flex flex-wrap gap-2 mt-auto">
                               {project.tags.map(tag => (
                                 <span key={tag} className="px-3 py-1 text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-md">
                                   {tag}
                                 </span>
                               ))}
                             </div>
                           </div>
                         </div>
                       </SpotlightCard>
                     ))
                   ) : (
                     <div className="md:col-span-2 text-center py-12 bg-white dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                       <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">未找到 {selectedProjectTag} 相关的项目</h3>
                       <p className="text-zinc-500">请尝试选择其他技术标签。</p>
                     </div>
                   )}
                 </div>
               </>
             ) : (
               /* Project Detail View */
               <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <button 
                   onClick={handleBackToProjects}
                   className="group flex items-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-8 transition-colors"
                 >
                   <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform mr-1" />
                   <span className="font-medium">返回作品列表</span>
                 </button>

                 <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden">
                   {/* Hero Image Area */}
                   <div className={`w-full h-64 md:h-80 bg-gradient-to-br ${selectedProject.color} relative`}>
                     <div className="absolute inset-0 flex items-center justify-center">
                        <h1 className="text-4xl md:text-6xl font-extrabold text-white text-center px-4 drop-shadow-lg">
                          {selectedProject.title}
                        </h1>
                     </div>
                   </div>

                   <div className="p-8 md:p-12">
                     {/* Meta & Links */}
                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-10 border-b border-zinc-100 dark:border-zinc-800">
                       <div className="flex flex-wrap gap-2">
                         {selectedProject.tags.map(tag => (
                           <span key={tag} className="px-3 py-1 text-sm font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-full">
                             {tag}
                           </span>
                         ))}
                       </div>
                       <div className="flex gap-3">
                          <a href={selectedProject.link} className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg font-bold hover:opacity-90 transition-opacity">
                            <Globe size={16} /> Live Demo
                          </a>
                          <a href={selectedProject.github} className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                            <Github size={16} /> Source
                          </a>
                       </div>
                     </div>

                     {/* Content */}
                     <div className="prose-custom text-lg text-zinc-700 dark:text-zinc-300">
                       <p className="text-xl font-medium leading-relaxed mb-8 text-zinc-900 dark:text-zinc-100">
                         {selectedProject.description}
                       </p>
                       {selectedProject.content ? (
                         <div dangerouslySetInnerHTML={{ __html: selectedProject.content }} />
                       ) : (
                         <div className="p-8 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl text-center text-zinc-500">
                           <p>更多项目细节整理中...</p>
                         </div>
                       )}
                     </div>
                   </div>
                 </div>
               </div>
             )}
          </div>
        )}

        {activeTab === 'about' && (
          <div className="max-w-3xl mx-auto space-y-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
             {/* Intro */}
             <section className="text-center">
                <div className="w-32 h-32 mx-auto rounded-full bg-zinc-200 dark:bg-zinc-800 mb-6 overflow-hidden border-4 border-white dark:border-zinc-700 shadow-xl relative">
                   {/* Avatar Placeholder */}
                   <div className="absolute inset-0 flex items-center justify-center text-zinc-400 text-4xl font-bold bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50">
                     A
                   </div>
                </div>
                <h2 className="text-4xl font-bold text-zinc-900 dark:text-white mb-4">关于 Alex</h2>
                <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  我是一名拥有 5 年经验的前端工程师。我不仅关注代码的质量，更在意产品背后的人文关怀。
                  <br/>我相信，优秀的技术应该像空气一样，无处不在却又自然无感。
                </p>
                <div className="flex justify-center gap-4 mt-6">
                   <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-sm font-medium">
                     <Download size={16} /> 下载简历
                   </button>
                   <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-sm font-medium">
                     <MapPin size={16} /> 中国 · 上海
                   </button>
                </div>
             </section>
             
             {/* Skills */}
             <section>
               <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
                 <Zap className="text-yellow-500" /> 技术栈
               </h3>
               <div className="flex flex-wrap gap-3">
                 {['React 19', 'TypeScript', 'Next.js 14', 'Tailwind CSS', 'Node.js', 'PostgreSQL', 'Rust', 'Figma', 'Docker', 'AWS'].map(skill => (
                   <span key={skill} className="px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-700 dark:text-zinc-300 text-sm font-bold shadow-sm">
                     {skill}
                   </span>
                 ))}
               </div>
             </section>

             {/* Experience Timeline */}
             <section>
               <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-8 flex items-center gap-2">
                 <Briefcase className="text-indigo-500" /> 工作经历
               </h3>
               <div className="space-y-8 relative timeline-line">
                 {EXPERIENCE.map((job, index) => (
                   <div key={index} className="relative pl-12 group">
                     <div className="absolute left-[14px] top-2 w-3 h-3 bg-white dark:bg-black border-2 border-indigo-500 rounded-full z-10 group-hover:scale-125 transition-transform"></div>
                     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                       <h4 className="text-xl font-bold text-zinc-900 dark:text-white">{job.role}</h4>
                       <span className="text-sm font-mono text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">{job.year}</span>
                     </div>
                     <div className="text-indigo-600 dark:text-indigo-400 font-medium mb-2">{job.company}</div>
                     <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm">
                       {job.description}
                     </p>
                   </div>
                 ))}
               </div>
             </section>
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="max-w-2xl mx-auto w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-zinc-900 dark:text-white mb-4">联系我</h2>
              <p className="text-zinc-500 dark:text-zinc-400">
                无论是项目合作、技术交流，还是仅仅想打个招呼，都欢迎随时联系。
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-900/50 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl">
              {formStatus === 'success' ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">发送成功!</h3>
                  <p className="text-zinc-500">我会尽快回复您的邮件。</p>
                  <button onClick={() => setFormStatus('idle')} className="mt-6 text-indigo-600 font-medium hover:underline">发送另一条消息</button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-900 dark:text-zinc-300">姓名</label>
                      <input required type="text" className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" placeholder="您的称呼" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-900 dark:text-zinc-300">邮箱</label>
                      <input required type="email" className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" placeholder="example@domain.com" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-900 dark:text-zinc-300">消息内容</label>
                    <textarea required rows={5} className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none" placeholder="请描述您的需求..."></textarea>
                  </div>
                  <button 
                    type="submit" 
                    disabled={formStatus === 'submitting'}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {formStatus === 'submitting' ? '发送中...' : <><Send size={18} /> 发送消息</>}
                  </button>
                </form>
              )}
            </div>

            <div className="mt-12 flex justify-center gap-8">
              <div className="flex flex-col items-center gap-2 text-zinc-500">
                <Mail size={24} className="text-zinc-900 dark:text-white"/>
                <span className="text-sm">hello@alex.design</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-zinc-500">
                <MessageSquare size={24} className="text-zinc-900 dark:text-white"/>
                <span className="text-sm">@AlexDesign</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'blog' && (
          <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 w-full">
             {!selectedPost ? (
               <>
                 {/* Blog Header */}
                 <div className="mb-12 space-y-8">
                   <div className="text-center">
                     <h2 className="text-4xl font-bold text-zinc-900 dark:text-white mb-4">博客文章</h2>
                     <p className="text-zinc-500 dark:text-zinc-400">分享关于技术、设计与生活的思考。</p>
                   </div>

                   <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-zinc-900/50 p-4 rounded-2xl border border-zinc-200 dark:border-white/5 shadow-sm">
                     {/* Categories */}
                     <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto hide-scrollbar">
                       {BLOG_CATEGORIES.map(cat => (
                         <button
                           key={cat}
                           onClick={() => setSelectedCategory(cat)}
                           className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                             selectedCategory === cat
                               ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-lg'
                               : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5'
                           }`}
                         >
                           {cat}
                         </button>
                       ))}
                     </div>

                     {/* Search */}
                     <div className="relative w-full md:w-64">
                       <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                       <input
                         type="text"
                         placeholder="搜索文章..."
                         value={searchQuery}
                         onChange={(e) => setSearchQuery(e.target.value)}
                         className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-xl text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                       />
                     </div>
                   </div>
                 </div>

                 {/* Blog Grid */}
                 <div className="space-y-4">
                   {filteredPosts.length > 0 ? (
                     filteredPosts.map((post) => (
                       <div 
                          key={post.id} 
                          onClick={() => {
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                            setSelectedPost(post);
                          }}
                          className="group relative p-8 rounded-2xl bg-white dark:bg-zinc-900/30 hover:bg-white dark:hover:bg-zinc-800/50 border border-zinc-200 dark:border-white/5 hover:border-indigo-500/30 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl"
                       >
                          <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 rounded-md bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                              {post.category}
                            </span>
                            <span className="text-xs text-zinc-400 flex items-center gap-1">
                              <Calendar size={12} /> {post.date}
                            </span>
                          </div>
                          
                          <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3 group-hover:text-indigo-500 transition-colors">
                            {post.title}
                          </h3>
                          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4 line-clamp-2">
                            {post.excerpt}
                          </p>
                          
                          <div className="flex items-center text-sm font-medium text-zinc-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            阅读全文 <ArrowUpRight size={16} className="ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                          </div>
                       </div>
                     ))
                   ) : (
                     <div className="text-center py-20">
                       <div className="inline-block p-4 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-4">
                         <Search size={32} className="text-zinc-400" />
                       </div>
                       <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">未找到相关文章</h3>
                     </div>
                   )}
                 </div>
               </>
             ) : (
               /* Article Detail View */
               <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <button 
                   onClick={handleBackToBlog}
                   className="group flex items-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-8 transition-colors"
                 >
                   <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform mr-1" />
                   <span className="font-medium">返回列表</span>
                 </button>

                 <article className="bg-white dark:bg-zinc-900/30 p-8 md:p-12 rounded-3xl border border-zinc-200 dark:border-zinc-800">
                   <header className="mb-10 pb-10 border-b border-zinc-100 dark:border-zinc-800">
                     <div className="flex gap-4 mb-6">
                        <span className="px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold tracking-wide uppercase">
                          {selectedPost.category}
                        </span>
                     </div>
                     <h1 className="text-3xl md:text-5xl font-extrabold text-zinc-900 dark:text-white mb-6 leading-tight">
                       {selectedPost.title}
                     </h1>
                     <div className="flex items-center justify-between flex-wrap gap-4">
                       <div className="flex items-center gap-6 text-zinc-500 dark:text-zinc-400 text-sm font-mono">
                         <span className="flex items-center gap-2"><Calendar size={14} /> {selectedPost.date}</span>
                         <span className="flex items-center gap-2"><Clock size={14} /> {selectedPost.readTime} 阅读</span>
                       </div>
                       
                       {/* ✨ Gemini AI Summary Button ✨ */}
                      <button 
                         onClick={handleGenerateSummary}
                         disabled={isSummarizing || Boolean(summary)}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-bold rounded-full shadow-lg hover:shadow-indigo-500/25 hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                       >
                          {isSummarizing ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Sparkles size={16} />
                          )}
                          {summary ? "摘要已生成" : "AI 生成摘要"}
                       </button>
                     </div>
                     
                     {/* AI Summary Result Block */}
                     {summary && (
                       <div className="mt-8 p-6 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-2xl animate-in fade-in slide-in-from-top-4">
                         <h4 className="flex items-center gap-2 font-bold text-indigo-800 dark:text-indigo-300 mb-3">
                           <Bot size={18} /> Gemini AI 摘要
                         </h4>
                         <div className="prose-custom text-indigo-900 dark:text-indigo-200 text-sm leading-relaxed whitespace-pre-line">
                           {summary}
                         </div>
                       </div>
                     )}
                   </header>

                   <div 
                     className="prose-custom text-lg text-zinc-700 dark:text-zinc-300"
                     dangerouslySetInnerHTML={{ __html: selectedPost.content }}
                   />
                 </article>
               </div>
             )}
          </div>
        )}

        <Footer />
      </main>
      
      {/* ✨ Gemini AI Chat Widget ✨ */}
      <AIChatWidget />
      
    </div>
  );
}