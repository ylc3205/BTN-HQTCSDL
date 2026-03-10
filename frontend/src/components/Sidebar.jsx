import { useEffect, useState } from "react";
import axios from "axios";

export default function Sidebar({ onTableSelect, history = [], onHistorySelect }) {
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('schema');

    useEffect(() => {
        if (activeTab === 'schema') {
            fetchTables();
        }
    }, [activeTab]);

    const fetchTables = async () => {
        if (tables.length > 0) return; // cache
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post("http://localhost:5001/api/query", {
                query: "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'",
            });
            if (response.data && response.data.success) {
                setTables(response.data.rows.map(row => row.TABLE_NAME));
            } else {
                setError(response.data.error || "Failed to fetch tables");
            }
        } catch (err) {
            console.error(err);
            setError("Failed to connect to the server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full h-full flex flex-col bg-[#1E1E1E] text-[#CCCCCC] rounded-md overflow-hidden">
            <div className="flex-none p-1 border-b border-[#3E3E42] bg-[#252526] flex items-center justify-between gap-1">
                <div className="flex flex-1 gap-1">
                    <button
                        onClick={() => setActiveTab('schema')}
                        className={`flex-1 py-1.5 px-2 text-xs font-medium rounded transition-colors ${activeTab === 'schema' ? 'bg-[#3E3E42] text-white shadow-sm' : 'text-gray-400 hover:bg-[#2D2D30] hover:text-gray-300'}`}
                    >
                        Schema
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`flex-1 py-1.5 px-2 text-xs font-medium rounded transition-colors ${activeTab === 'history' ? 'bg-[#3E3E42] text-white shadow-sm' : 'text-gray-400 hover:bg-[#2D2D30] hover:text-gray-300'}`}
                    >
                        History
                    </button>
                </div>
                {activeTab === 'schema' && (
                    <button
                        onClick={() => { setTables([]); fetchTables(); }}
                        className="p-1 px-2 text-gray-400 hover:text-white transition-colors"
                        title="Refresh"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-auto p-2 min-h-0 custom-scrollbar relative">
                {activeTab === 'schema' && (
                    <>
                        {loading && (
                            <div className="flex items-center justify-center p-4">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                            </div>
                        )}
                        {error && <div className="text-red-400 text-xs p-2 bg-red-900/20 rounded border border-red-800/50 m-2">{error}</div>}
                        {!loading && !error && tables.length === 0 && (
                            <div className="text-gray-500 text-xs p-2 text-center mt-4">No tables found.</div>
                        )}
                        <ul className="space-y-[2px]">
                            {tables.map(table => (
                                <li
                                    key={table}
                                    className="px-3 py-1.5 hover:bg-[#2A2D2E] rounded cursor-pointer transition-colors text-sm flex items-center gap-2 group"
                                    onClick={() => onTableSelect && onTableSelect(table)}
                                    title={`Preview top rows of ${table}`}
                                >
                                    <svg className="w-4 h-4 flex-none text-blue-400 group-hover:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                                    </svg>
                                    <span className="truncate flex-1">{table}</span>
                                </li>
                            ))}
                        </ul>
                    </>
                )}

                {activeTab === 'history' && (
                    <>
                        {history.length === 0 ? (
                            <div className="text-gray-500 text-xs p-2 text-center mt-4">No query history yet.</div>
                        ) : (
                            <ul className="space-y-2">
                                {history.map((item, idx) => (
                                    <li
                                        key={idx}
                                        className="bg-[#2A2D2E] border border-[#3E3E42] rounded-md p-2 hover:border-gray-500 cursor-pointer transition-colors group"
                                        onClick={() => onHistorySelect && onHistorySelect(item.query)}
                                    >
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Success</span>
                                            <span className="text-xs text-gray-500">{item.time}</span>
                                        </div>
                                        <div className="text-xs font-mono text-gray-300 line-clamp-2 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                                            {item.query}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
