import { useState, useRef } from "react";
import EditorLayout from "../layout/EditorLayout";
import MonacoEditor from "@monaco-editor/react";
import axios from "axios";
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
        } catch (error) {
        console.error("Error executing query:", error);
        setResults({ success: false, error: error.response?.data?.error || 'Unknown error' });
        }
    };
    
    const clearResults = () => {
        setResults(null);
    };
  return (
    <EditorLayout
      left={<div></div>}
    query={
        <div className="w-full h-full flex flex-col overflow-hidden">
            <div className="flex-none border-b border-gray-700 p-3">
                <button 
                    onClick={runQuery}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                >
                    Run
                </button>
            </div>
            <div className="flex-1 min-h-0">
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
        <div className="w-full h-full flex flex-col overflow-hidden bg-[#1E1E1E]">
            {results && results.success ? (
                <div className="w-full h-full overflow-auto">
                <table className="min-w-full text-sm border-collapse">
                    <thead className="bg-[#252526] sticky top-0 z-10">
                    <tr>
                        {results.columns.map((col, i) => (
                        <th key={i} className="px-4 py-2 text-left border border-[#3E3E42] font-semibold text-[#CCCCCC] whitespace-nowrap">{col}</th>
                        ))}
                    </tr>
                    </thead>
                    <tbody className="bg-[#1E1E1E]">
                    {results.rows.map((row, i) => (
                        <tr key={i} className="hover:bg-[#2A2D2E] transition-colors">
                        {results.columns.map((col, j) => (
                            <td key={j} className="px-4 py-2 border border-[#3E3E42] text-[#D4D4D4] whitespace-nowrap">{row[col]}</td>
                        ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            ) : results && !results.success ? (
                <div className="w-full h-full flex items-center justify-center">
                <div className="text-red-400 px-6">
                    <div className="font-semibold text-lg">Error:</div>
                    <div className="text-sm mt-2">{results.error}</div>
                    {results.details && <div className="text-xs mt-1 text-red-300">{results.details}</div>}
                </div>
                </div>
            ) : (
                <div className="w-full h-full flex items-center justify-center">
                <span className="text-gray-500">No results to display</span>
                </div>
            )}
        </div>
    }
    />
  )
}