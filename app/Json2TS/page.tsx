'use client'
import React, { useState } from 'react';
import { Coffee, Copy, Check, Code2, ArrowRight, Zap, Terminal, Hammer } from 'lucide-react';

// --- 核心逻辑区域 (Logic) ---

/**
 * 递归生成 TypeScript 接口
 */
type InterfaceEntry = { name: string; content: string };

function generateTypeScriptInterfaces(jsonStr: string, rootName = 'RootObject') {
  const interfaces: InterfaceEntry[] = [];

  try {
    const jsonObj = JSON.parse(jsonStr);
    if (jsonObj === null || Array.isArray(jsonObj) || typeof jsonObj !== 'object') {
      throw new Error("根节点必须是对象类型");
    }
    parseObject(jsonObj as Record<string, unknown>, rootName, interfaces);
  } catch (err) {
    if (err instanceof Error) {
      throw new Error("JSON 格式错误，请检查符号是否闭合");
    }
    throw err;
  }

  // 将所有收集到的接口拼接，主接口放最后，子接口放前面，符合阅读习惯
  return interfaces.reverse().map(i => i.content).join('\n\n');
}

function parseObject(
  obj: Record<string, unknown>,
  interfaceName: string,
  interfaces: InterfaceEntry[]
) {
  const propsLines: string[] = [];

  for (const key in obj) {
    const value = obj[key];
    const type = getType(value);
    
    if (type === 'object') {
      const subInterfaceName = `${interfaceName}_${capitalize(key)}`;
      parseObject(value as Record<string, unknown>, subInterfaceName, interfaces);
      propsLines.push(`  ${key}: ${subInterfaceName};`);
    } 
    else if (type === 'object[]') {
      if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
        const subInterfaceName = `${interfaceName}_${capitalize(key)}Item`;
        parseObject(value[0] as Record<string, unknown>, subInterfaceName, interfaces);
        propsLines.push(`  ${key}: ${subInterfaceName}[];`);
      } else {
        propsLines.push(`  ${key}: any[];`);
      }
    }
    else {
      propsLines.push(`  ${key}: ${type};`);
    }
  }

  const interfaceContent = `export interface ${interfaceName} {\n${propsLines.join('\n')}\n}`;
  interfaces.push({ name: interfaceName, content: interfaceContent });
}

function getType(value: unknown) {
  if (value === null) return 'any';
  if (typeof value === 'string') return 'string';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'boolean';
  if (Array.isArray(value)) return 'object[]';
  if (typeof value === 'object') return 'object';
  return 'any';
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// --- UI 组件区域 (View) ---

export default function TypeCraftTool() {
  const [jsonInput, setJsonInput] = useState('');
  const [tsOutput, setTsOutput] = useState('');
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const sampleData = {
    "code": 200,
    "message": "success",
    "data": {
      "user_info": {
        "id": 1089,
        "username": "frontend_master",
        "preferences": {
          "theme": "dark",
          "notifications": true
        }
      },
      "posts": [
        { "id": 1, "title": "How to make money", "views": 5000 },
        { "id": 2, "title": "TypeScript Tips", "views": 3200 }
      ]
    }
  };

  const handleLoadSample = () => {
    setJsonInput(JSON.stringify(sampleData, null, 2));
    setError('');
  };

  const handleConvert = () => {
    if (!jsonInput.trim()) return;
    setError('');
    try {
      const result = generateTypeScriptInterfaces(jsonInput, 'ApiResponse');
      setTsOutput(result);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('未知错误，请查看控制台');
        console.error(err);
      }
      setTsOutput('');
    }
  };

  const handleCopy = () => {
    if (!tsOutput) return;
    const textArea = document.createElement("textarea");
    textArea.value = tsOutput;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-100">
      {/* 顶部导航 - 已更新品牌名为 TypeCraft */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg shadow-indigo-200 shadow-md transform rotate-3">
            <Hammer className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-800 tracking-tight">TypeCraft</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-xs font-medium text-slate-400 hidden sm:inline-block">JSON to TypeScript Converter</span>
          <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            v1.0
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-4 md:p-8">
        {/* 标题区域 - 更新 Slogan */}
        <div className="text-center mb-10 mt-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Type<span className="text-indigo-600">Craft</span>
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
            瞬间将杂乱的 JSON “锻造”为完美的 TypeScript 类型定义。<br/>
            <span className="text-sm text-slate-400 mt-2 block">支持递归解析 · 智能类型推断 · 一键复制</span>
          </p>
        </div>

        {/* 核心操作区 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
          
          {/* 左侧：输入区 */}
          <div className="flex flex-col h-full bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden ring-1 ring-slate-100 group focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
                <Terminal className="w-4 h-4 mr-1.5 text-slate-400" /> Raw JSON
              </span>
              <button 
                onClick={handleLoadSample}
                className="text-xs text-indigo-600 font-semibold hover:bg-indigo-50 px-3 py-1.5 rounded-md transition-colors border border-transparent hover:border-indigo-100"
              >
                加载测试数据
              </button>
            </div>
            <div className="flex-1 relative">
              <textarea
                className="w-full h-full p-4 font-mono text-sm bg-white resize-none focus:outline-none focus:bg-slate-50/50 transition-colors text-slate-600 leading-relaxed"
                placeholder='在此粘贴 JSON...'
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                spellCheck={false}
              />
              {error && (
                <div className="absolute bottom-4 left-4 right-4 bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 flex items-center animate-bounce shadow-sm">
                  <Zap className="w-4 h-4 mr-2 flex-shrink-0" />
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* 中间转换按钮 (移动端显示，桌面端隐藏) */}
          <div className="lg:hidden flex justify-center">
             <button
              onClick={handleConvert}
              className="bg-indigo-600 text-white px-6 py-2 rounded-full font-bold shadow-lg active:scale-95 transition-transform flex items-center"
            >
              开始转换 <ArrowRight className="ml-2 w-4 h-4" />
            </button>
          </div>

          {/* 右侧：输出区 */}
          <div className="flex flex-col h-full bg-[#1e1e1e] rounded-2xl shadow-xl overflow-hidden ring-4 ring-slate-200/50 group hover:ring-indigo-100 transition-all">
            <div className="px-4 py-3 bg-[#252526] border-b border-[#333] flex justify-between items-center">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center">
                 <Code2 className="w-4 h-4 mr-1.5" /> TypeScript Interface
              </span>
              <button
                onClick={handleCopy}
                disabled={!tsOutput}
                className={`flex items-center space-x-1 text-xs px-3 py-1.5 rounded transition-all duration-200 font-medium ${
                  copySuccess
                    ? 'bg-green-600 text-white shadow-[0_0_10px_rgba(22,163,74,0.5)]'
                    : 'bg-[#333] text-gray-300 hover:bg-[#444] hover:text-white border border-[#444]'
                }`}
              >
                {copySuccess ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                <span>{copySuccess ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>
            <div className="flex-1 relative overflow-auto custom-scrollbar">
              <pre className="p-4 font-mono text-sm text-[#d4d4d4] leading-relaxed">
                {tsOutput ? (
                  <code dangerouslySetInnerHTML={{
                    // 简单的语法高亮模拟
                    __html: tsOutput
                      .replace(/export interface/g, '<span class="text-[#569cd6]">export interface</span>')
                      .replace(/string/g, '<span class="text-[#4ec9b0]">string</span>')
                      .replace(/number/g, '<span class="text-[#b5cea8]">number</span>')
                      .replace(/boolean/g, '<span class="text-[#569cd6]">boolean</span>')
                      .replace(/any/g, '<span class="text-[#c586c0]">any</span>')
                      .replace(/;/g, '<span class="text-[#d4d4d4]">;</span>')
                      .replace(/{/g, '<span class="text-[#ffd700]">{</span>')
                      .replace(/}/g, '<span class="text-[#ffd700]">}</span>')
                  }} />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-600 select-none">
                    <div className="w-16 h-16 mb-4 rounded-full bg-[#252526] flex items-center justify-center">
                      <Hammer className="w-8 h-8 opacity-40" />
                    </div>
                    <p className="text-sm font-medium">准备就绪，等待输入...</p>
                  </div>
                )}
              </pre>
            </div>
          </div>
        </div>

        {/* 桌面端大按钮 */}
        <div className="hidden lg:flex justify-center -mt-6 relative z-10">
          <button
            onClick={handleConvert}
            className="group bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-full font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 transition-all flex items-center space-x-3 ring-4 ring-white"
          >
            <span className="text-lg">锻造 TypeScript 定义</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* 💡 关键点：打赏引导 (Monetization) */}
        <div className="mt-20 max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-2xl p-8 text-center relative overflow-hidden shadow-sm">
            {/* 背景装饰 */}
            <div className="absolute -top-6 -right-6 text-orange-200 opacity-40 rotate-12">
              <Coffee className="w-32 h-32" />
            </div>
            
            <h3 className="text-xl font-bold text-slate-800 mb-3 relative z-10">
              TypeCraft 帮你省下时间了吗？
            </h3>
            <p className="text-slate-600 mb-8 relative z-10">
              如果这个工具让你不用再手写那些繁琐的 interface，<br/>
              不妨请我喝杯咖啡，支持服务器继续运行。
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
              <button className="flex items-center justify-center bg-[#FF5F5F] hover:bg-[#ff4747] text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-md hover:shadow-lg hover:-translate-y-0.5 transform duration-200">
                <Coffee className="w-5 h-5 mr-2" />
                投喂咖啡 (¥5)
              </button>
              <button className="flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-8 py-3 rounded-xl font-bold transition-colors shadow-sm hover:shadow-md">
                给个 Star ⭐
              </button>
            </div>
          </div>
          
          <p className="text-center text-slate-400 text-xs mt-8">
            TypeCraft © 2023 · Developed with ❤️ by FrontEndHacker
          </p>
        </div>
      </main>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1e1e1e;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #444;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  );
}