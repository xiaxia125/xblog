'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Upload, X, FileSpreadsheet, AlertCircle, Loader2, Table2, Download } from 'lucide-react';

export default function App() {
  const [tableData, setTableData] = useState<any[][]>([]);
  const [headerLabels, setHeaderLabels] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLibLoaded, setIsLibLoaded] = useState(false);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. 动态加载 SheetJS
  useEffect(() => {
    if ((window as any).XLSX) {
      setIsLibLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = "https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js";
    script.async = true;
    script.onload = () => setIsLibLoaded(true);
    document.body.appendChild(script);
  }, []);

  const getExcelColumnLabel = (index: number) => {
    let label = '';
    let i = index;
    while (i >= 0) {
      label = String.fromCharCode(65 + (i % 26)) + label;
      i = Math.floor(i / 26) - 1;
    }
    return label;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!isLibLoaded) {
      setErrorMsg("引擎正在预热中，请稍后 1 秒再试");
      return;
    }

    setFileName(file.name);
    setErrorMsg('');
    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const XLSX = (window as any).XLSX;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });

        if (jsonData.length === 0) {
          setErrorMsg('表格内容为空');
          setIsLoading(false);
          return;
        }

        let maxCols = 0;
        jsonData.forEach(row => {
          if (row.length > maxCols) maxCols = row.length;
        });

        const labels: string[] = [];
        for (let i = 0; i < maxCols; i++) {
          labels.push(getExcelColumnLabel(i));
        }
        
        setHeaderLabels(labels);
        setTableData(jsonData);
      } catch (err) {
        console.error(err);
        setErrorMsg('文件解析失败，请检查文件格式');
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  // 新增：处理导出逻辑
  const handleExport = () => {
    if (!isLibLoaded || tableData.length === 0) return;

    try {
      const XLSX = (window as any).XLSX;
      
      // 1. 将当前的二维数组转换为工作表
      const ws = XLSX.utils.aoa_to_sheet(tableData);
      
      // 2. 创建一个新的工作簿
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
      
      // 3. 生成文件名 (加上 edited_ 前缀)
      const exportName = fileName ? `edited_${fileName}` : 'export.xlsx';
      
      // 4. 下载文件
      XLSX.writeFile(wb, exportName);
      
    } catch (err) {
      console.error("Export failed:", err);
      setErrorMsg("导出失败，请重试");
    }
  };

  const clearData = () => {
    setTableData([]);
    setHeaderLabels([]);
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCellBlur = (rowIndex: number, colIndex: number, e: React.FocusEvent<HTMLTableCellElement>) => {
    const newValue = e.target.innerText;
    const newData = [...tableData];
    if (!newData[rowIndex]) newData[rowIndex] = [];
    newData[rowIndex][colIndex] = newValue;
    setTableData(newData);
  };

  return (
    <div className="flex flex-col h-screen bg-white font-sans text-slate-800">
      {/* 顶部导航栏 - Modern Style */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex-none z-20 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg shadow-sm">
            <Table2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-800 tracking-tight">DataGrid <span className="text-indigo-600">Pro</span></h1>
            <p className="text-xs text-slate-500 font-medium">Excel 在线预览</p>
          </div>
        </div>

        <div className="flex gap-3 items-center">
           {fileName && (
             <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-600 mr-2">
                <FileSpreadsheet className="w-3.5 h-3.5 text-green-600" />
                <span className="truncate max-w-[150px]">{fileName}</span>
             </div>
           )}

          {!isLibLoaded && (
            <div className="flex items-center gap-2 text-xs text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" />
              正在加载引擎...
            </div>
          )}

          {tableData.length === 0 ? (
            <label className={`cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-2 text-sm font-medium active:scale-95 ${!isLibLoaded ? 'opacity-70 cursor-not-allowed' : ''}`}>
              <Upload className="w-4 h-4" />
              <span>导入表格</span>
              <input 
                ref={fileInputRef}
                type="file" 
                onChange={handleFileUpload} 
                accept=".xlsx, .xls" 
                className="hidden" 
                disabled={!isLibLoaded}
              />
            </label>
          ) : (
            <>
              <button 
                 onClick={handleExport}
                 className="hidden sm:flex text-slate-600 hover:bg-slate-100 px-3 py-2 rounded-lg text-sm font-medium transition items-center gap-2 border border-transparent hover:border-slate-200 active:bg-slate-200"
              >
                 <Download className="w-4 h-4" />
                 导出
              </button>
              <button 
                onClick={clearData} 
                className="text-sm text-slate-600 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition flex items-center gap-1.5 font-medium"
              >
                <X className="w-4 h-4" />
                关闭
              </button>
            </>
          )}
        </div>
      </header>

      {/* 错误提示 */}
      {errorMsg && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-red-800">解析中断</h3>
            <p className="text-sm text-red-600 mt-1">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* 主体内容区 */}
      <main className="flex-1 overflow-hidden relative flex flex-col bg-slate-50/50">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4">
            <div className="p-4 bg-white rounded-full shadow-lg border border-slate-100">
               <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
            <p className="text-sm font-medium animate-pulse">正在解析数据结构...</p>
          </div>
        ) : tableData.length > 0 ? (
          /* 表格容器 */
          <div className="flex-1 overflow-auto relative custom-scrollbar m-4 mt-2 bg-white rounded-lg border border-slate-200 shadow-sm">
            <style>{`
              .custom-scrollbar::-webkit-scrollbar { height: 12px; width: 12px; }
              .custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; border-left: 1px solid #e2e8f0; border-top: 1px solid #e2e8f0; }
              .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border: 3px solid transparent; background-clip: content-box; border-radius: 99px; }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; border: 3px solid transparent; background-clip: content-box; border-radius: 99px; }
              .custom-scrollbar::-webkit-scrollbar-corner { background: #f8fafc; }
            `}</style>
            
            <table className="w-full border-collapse text-sm table-fixed">
              {/* 表头 */}
              <thead className="sticky top-0 z-10">
                <tr>
                  {/* 左上角全选块 */}
                  <th className="bg-slate-50 border-b border-r border-slate-200 w-12 sticky left-0 z-20"></th>
                  
                  {/* 列标 A, B, C... */}
                  {headerLabels.map((colLabel, index) => (
                    <th key={index} className="bg-slate-50 border-b border-r border-slate-200 px-2 py-1.5 text-xs font-semibold text-slate-500 select-none text-center relative group w-28 tracking-wider">
                      {colLabel}
                      {/* 列宽调整把手 */}
                      <div className="absolute right-0 top-0 bottom-0 w-1 hover:bg-indigo-500 cursor-col-resize opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, rowIndex) => (
                  <tr key={rowIndex} className="group">
                    {/* 行号 */}
                    <td className="sticky left-0 bg-slate-50 border-b border-r border-slate-200 text-center text-xs font-semibold text-slate-400 w-12 select-none z-10 group-hover:bg-slate-100 group-hover:text-slate-600 transition-colors">
                      {rowIndex + 1}
                    </td>
                    
                    {/* 单元格数据 */}
                    {headerLabels.map((_, colIndex) => (
                      <td 
                        key={colIndex}
                        className="border-b border-r border-slate-200 px-3 py-1.5 text-slate-700 cursor-text bg-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500/50 focus:bg-indigo-50/10 hover:bg-slate-50 whitespace-nowrap overflow-hidden text-ellipsis max-w-[300px] selection:bg-indigo-100 selection:text-indigo-900"
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => handleCellBlur(rowIndex, colIndex, e)}
                      >
                         {row[colIndex] !== undefined ? row[colIndex] : ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* 空状态 - Modern Empty State */
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="w-full max-w-md bg-white border-2 border-dashed border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center hover:border-indigo-300 hover:bg-slate-50/50 transition-all group">
               <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <FileSpreadsheet className="w-8 h-8 text-indigo-600" />
               </div>
               <h3 className="text-xl font-bold text-slate-800 mb-2">上传 Excel 表格</h3>
               <p className="text-slate-500 text-sm mb-6 max-w-xs leading-relaxed">
                 支持 .xlsx 或 .xls 格式。<br/>纯前端解析，您的数据不会上传到任何服务器。
               </p>
               
               <label className={`cursor-pointer bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl shadow-lg shadow-slate-200 hover:shadow-xl hover:shadow-slate-300 transition-all flex items-center gap-2 text-sm font-semibold active:scale-95 ${!isLibLoaded ? 'opacity-70 cursor-not-allowed' : ''}`}>
                <Upload className="w-4 h-4" />
                <span>选择文件</span>
                <input 
                  ref={fileInputRef}
                  type="file" 
                  onChange={handleFileUpload} 
                  accept=".xlsx, .xls" 
                  className="hidden" 
                  disabled={!isLibLoaded}
                />
              </label>
            </div>
          </div>
        )}

        {/* 底部状态栏 */}
        <footer className="bg-white border-t border-slate-200 px-4 py-2 flex justify-between items-center text-xs font-medium text-slate-500 flex-none">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${tableData.length > 0 ? 'bg-green-500' : 'bg-slate-300'}`}></span>
              <span>{tableData.length > 0 ? '就绪' : '等待导入'}</span>
            </div>
            {tableData.length > 0 && (
              <span className="text-slate-400 pl-4 border-l border-slate-200">
                {tableData.length} 行 / {headerLabels.length} 列
              </span>
            )}
          </div>
          <div className="opacity-50 hover:opacity-100 transition-opacity cursor-default">
            Powered by SheetJS
          </div>
        </footer>
      </main>
    </div>
  );
}