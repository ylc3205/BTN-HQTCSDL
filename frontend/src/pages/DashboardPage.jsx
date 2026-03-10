import { useState, useRef } from "react";
import EditorLayout from "../layout/EditorLayout";
import MonacoEditor from "@monaco-editor/react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
export default function Dashboard() {
    const SQL_KEYWORDS = [
        'SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP',
        'ALTER', 'TABLE', 'DATABASE', 'INDEX', 'VIEW', 'PROCEDURE', 'FUNCTION',
        'TRIGGER', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'OUTER', 'FULL', 'CROSS',
        'ON', 'AS', 'AND', 'OR', 'NOT', 'IN', 'EXISTS', 'BETWEEN', 'LIKE',
        'IS', 'NULL', 'ORDER', 'BY', 'GROUP', 'HAVING', 'DISTINCT', 'LIMIT',
        'OFFSET', 'UNION', 'ALL', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
        'BEGIN', 'COMMIT', 'ROLLBACK', 'TRANSACTION', 'SET', 'VALUES', 'INTO'
    ];

    const SQL_FUNCTIONS = [
        'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'ROUND', 'FLOOR', 'CEILING',
        'UPPER', 'LOWER', 'TRIM', 'LTRIM', 'RTRIM', 'SUBSTRING', 'CONCAT',
        'LENGTH', 'REPLACE', 'CAST', 'CONVERT', 'COALESCE', 'ISNULL',
        'GETDATE', 'DATEADD', 'DATEDIFF', 'YEAR', 'MONTH', 'DAY',
        'NOW', 'CURRENT_TIMESTAMP', 'CURRENT_DATE', 'CURRENT_TIME'
    ];
    const [value, setValue] = useState("");
    const [results, setResults] = useState(null);
    const [history, setHistory] = useState([]);
    const completionProviderRef = useRef(null);

    const handleMount = (editor, monaco) => {
        console.log("Editor mounted");

        // Dispose provider cũ nếu có
        if (completionProviderRef.current) {
            completionProviderRef.current.dispose();
        }

        // Đăng ký completion provider cho SQL
        completionProviderRef.current = monaco.languages.registerCompletionItemProvider('sql', {
            provideCompletionItems: (model, position) => {
                const word = model.getWordUntilPosition(position);
                const range = {
                    startLineNumber: position.lineNumber,
                    endLineNumber: position.lineNumber,
                    startColumn: word.startColumn,
                    endColumn: word.endColumn
                };

                const suggestions = [];

                // SQL Keywords
                SQL_KEYWORDS.forEach(keyword => {
                    suggestions.push({
                        label: keyword,
                        kind: monaco.languages.CompletionItemKind.Keyword,
                        insertText: keyword,
                        range: range,
                        detail: 'SQL Keyword',
                        sortText: '1' + keyword
                    });
                });

                // SQL Functions
                SQL_FUNCTIONS.forEach(func => {
                    suggestions.push({
                        label: func,
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: func + '($1)',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        range: range,
                        detail: 'SQL Function',
                        sortText: '2' + func
                    });
                });
                return { suggestions };
            }
        });

        // Cấu hình SQL language
        monaco.languages.setLanguageConfiguration('sql', {
            comments: {
                lineComment: '--',
                blockComment: ['/*', '*/']
            },
            brackets: [
                ['(', ')'],
                ['[', ']']
            ],
            autoClosingPairs: [
                { open: '(', close: ')' },
                { open: '[', close: ']' },
                { open: "'", close: "'" },
                { open: '"', close: '"' }
            ],
            surroundingPairs: [
                { open: '(', close: ')' },
                { open: '[', close: ']' },
                { open: "'", close: "'" },
                { open: '"', close: '"' }
            ]
        });
    };

    const runQuery = async () => {
        try {
            const response = await axios.post('http://localhost:5001/api/query', { query: value });
            setResults(response.data);
            if (response.data && response.data.success) {
                setHistory(prev => {
                    const newHistory = [{ query: value, time: new Date().toLocaleTimeString() }, ...prev];
                    return newHistory.slice(0, 50); // keep last 50
                });
            }
        } catch (error) {
            console.error("Error executing query:", error);
            setResults({ success: false, error: error.response?.data?.error || 'Unknown error' });
        }
    };

    const exportToCSV = () => {
        if (!results || !results.success || !results.rows) return;
        const headers = results.columns.join(',');
        const csvRows = results.rows.map(row => {
            return results.columns.map(col => {
                const val = row[col];
                if (val === null || val === undefined) return '';
                const str = String(val).replace(/"/g, '""');
                return `"${str}"`;
            }).join(',');
        });
        const csvContent = [headers, ...csvRows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "sql_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <EditorLayout
            left={<Sidebar onTableSelect={(table) => setValue(`SELECT TOP 10 * FROM [${table}]`)} history={history} onHistorySelect={setValue} />}
            query={
                <div className="w-full h-full flex flex-col overflow-hidden bg-[#1E1E1E] rounded-md border border-[#3E3E42]">
                    <div className="flex-none border-b border-[#3E3E42] bg-[#252526] p-2 flex justify-between items-center">
                        <div className="text-sm font-semibold text-[#CCCCCC] ml-2 flex items-center gap-2">
                            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                            SQL Editor
                        </div>
                        <button
                            onClick={runQuery}
                            className="bg-[#0e639c] shadow-md hover:bg-[#1177bb] transition-all text-white text-sm px-4 py-1.5 rounded flex items-center gap-2 group"
                        >
                            <svg className="w-4 h-4 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Run Query
                        </button>
                    </div>
                    <div className="flex-1 min-h-0 relative">
                        <MonacoEditor
                            height="100%"
                            defaultLanguage="sql"
                            language="sql"
                            value={value}
                            onChange={(val) => setValue(val || "")}
                            onMount={handleMount}
                            theme="vs-dark"
                            options={{
                                minimap: { enabled: false },
                                wordWrap: "on",
                                fontSize: 14,
                                automaticLayout: true,
                                scrollBeyondLastLine: false,
                                padding: { top: 16, bottom: 16 },
                                lineNumbers: "on",
                                renderLineHighlight: "all",
                                suggestOnTriggerCharacters: true,
                                quickSuggestions: true,
                            }}
                        />
                    </div>
                </div>
            }
            results={
                <div className="w-full h-full flex flex-col overflow-hidden bg-[#1E1E1E] rounded-md border border-[#3E3E42]">
                    <div className="flex-none border-b border-[#3E3E42] bg-[#252526] p-2 flex justify-between items-center">
                        <div className="text-sm font-semibold text-[#CCCCCC] ml-2 flex items-center gap-2">
                            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                            Query Results
                        </div>
                        <div className="flex items-center gap-3">
                            {results && results.success && results.rowCount !== undefined && (
                                <span className="text-xs font-medium bg-[#3E3E42] px-2 py-1 rounded text-gray-300 shadow-inner">{results.rowCount} rows</span>
                            )}
                            {results && results.success && (
                                <button
                                    onClick={exportToCSV}
                                    className="text-gray-400 hover:text-white transition-colors bg-[#2D2D30] hover:bg-[#3E3E42] px-2 py-1 rounded border border-[#3E3E42] flex items-center gap-1 text-xs shadow-sm mr-2"
                                    title="Export to CSV"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                    Export CSV
                                </button>
                            )}
                        </div>
                    </div>
                    {results && results.success ? (
                        <div className="flex-1 overflow-auto custom-scrollbar">
                            <table className="min-w-full text-sm border-collapse">
                                <thead className="bg-[#252526] sticky top-0 z-10">
                                    <tr>
                                        {results.columns.map((col, i) => (
                                            <th key={i} className="px-4 py-2 text-left border-r border-b border-[#3E3E42] font-semibold text-[#E0E0E0] whitespace-nowrap bg-[#2D2D30] tracking-wide">{col}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-[#1E1E1E]">
                                    {results.rows.map((row, i) => (
                                        <tr key={i} className="hover:bg-[#2A2D2E] transition-colors">
                                            {results.columns.map((col, j) => (
                                                <td key={j} className="px-4 py-2 border-r border-b border-[#3E3E42] text-[#D4D4D4] whitespace-nowrap font-mono">{row[col]}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : results && !results.success ? (
                        <div className="flex-1 flex items-center justify-center bg-[#1E1E1E]">
                            <div className="text-red-400 px-6 py-4 bg-red-900/10 border border-red-800/30 rounded-lg max-w-2xl shadow-lg">
                                <div className="font-semibold text-lg flex items-center gap-2">
                                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    Error Executing Query
                                </div>
                                <div className="text-sm mt-3 font-mono bg-black/20 p-2 rounded text-red-300">{results.error}</div>
                                {results.details && <div className="text-xs mt-2 text-red-400/80 font-mono">{results.details}</div>}
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center opacity-50">
                            <svg className="w-16 h-16 text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                            <span className="text-gray-400 text-sm tracking-wide">Enter a query and click Run to see results</span>
                        </div>
                    )}
                </div>
            }
        />
    )
}