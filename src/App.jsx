import { useState, useCallback } from 'react';

const API_ENDPOINT = '/node-function-kv-demo';

// 操作类型配置
const OPERATIONS = {
  GET: { color: 'blue', label: 'GET' },
  PUT: { color: 'green', label: 'PUT' },
  DELETE: { color: 'red', label: 'DELETE' },
  LIST: { color: 'purple', label: 'LIST' },
};

// 通用按钮组件
const Button = ({ onClick, disabled, variant = 'primary', children, className = '' }) => {
  const variants = {
    primary: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-sm hover:shadow-md',
    success: 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-sm hover:shadow-md',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-sm hover:shadow-md',
    purple: 'bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white shadow-sm hover:shadow-md',
    ghost: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-gray-300 shadow-sm',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 
        disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 
        hover:-translate-y-0.5 disabled:hover:translate-y-0
        ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

// 输入框组件
const Input = ({ label, hint, error, ...props }) => (
  <div className="space-y-1">
    {label && (
      <label className="block text-sm font-medium text-gray-600">
        {label}
        {hint && <span className="text-gray-400 font-normal ml-1 text-xs">({hint})</span>}
      </label>
    )}
    <input
      {...props}
      className={`w-full px-3 py-2.5 border rounded-lg transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent
        placeholder:text-gray-300 text-sm
        ${error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white hover:border-violet-300'}`}
    />
    {error && <p className="text-red-500 text-xs flex items-center gap-1">
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      {error}
    </p>}
  </div>
);

// 选择框组件
const Select = ({ label, options, ...props }) => (
  <div className="space-y-1">
    {label && <label className="block text-sm font-medium text-gray-600">{label}</label>}
    <select
      {...props}
      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-sm
        hover:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-400 
        focus:border-transparent transition-all duration-200 cursor-pointer"
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

// 方法徽章组件
const MethodBadge = ({ method }) => {
  const colors = {
    GET: 'bg-blue-100 text-blue-700 border border-blue-200',
    POST: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    PUT: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    DELETE: 'bg-red-100 text-red-700 border border-red-200',
    LIST: 'bg-violet-100 text-violet-700 border border-violet-200',
  };
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono font-bold ${colors[method] || 'bg-gray-100 text-gray-600'}`}>
      {method}
    </span>
  );
};

// 结果显示组件
const ResultPanel = ({ result, error, loading }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="relative">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-violet-200" />
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-violet-600 border-t-transparent absolute inset-0" />
        </div>
        <p className="text-sm text-gray-400">请求中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <div className="flex items-center gap-2 text-red-700 font-semibold mb-2">
          <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
          请求失败
        </div>
        <p className="text-red-600 text-sm pl-7">{error}</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="text-center py-16 text-gray-300">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-50 rounded-2xl flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-sm text-gray-400">执行操作后结果将显示在此处</p>
      </div>
    );
  }

  const isSuccess = result.success || result.found !== false;

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400 opacity-80" />
            <div className="w-3 h-3 rounded-full bg-yellow-400 opacity-80" />
            <div className="w-3 h-3 rounded-full bg-green-400 opacity-80" />
          </div>
          <span className="text-xs font-mono text-slate-400 ml-1">Response</span>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
          isSuccess ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'
        }`}>
          {isSuccess ? '✓' : '!'} {result.action?.toUpperCase() || 'RESULT'}
        </span>
      </div>
      <pre className="p-4 text-sm text-slate-300 overflow-auto max-h-80 font-mono bg-slate-900 leading-relaxed">
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );
};

// 快速测试预设组件
const QuickTests = ({ onTest, disabled }) => {
  const presets = [
    { name: '写入文本', icon: '✏️', action: () => onTest('put', { key: 'demo_text', value: 'Hello EdgeKV!', dataType: 'text' }) },
    { name: '写入JSON', icon: '{}', action: () => onTest('put', { key: 'demo_json', value: JSON.stringify({ name: 'Alice', age: 25 }), dataType: 'json' }) },
    { name: '读取文本', icon: '📖', action: () => onTest('get', { key: 'demo_text', type: 'text' }) },
    { name: '读取JSON', icon: '📋', action: () => onTest('get', { key: 'demo_json', type: 'json' }) },
    { name: '列出所有', icon: '≡', action: () => onTest('list', { prefix: '', limit: 20 }) },
    { name: '删除测试', icon: '🗑', action: () => onTest('delete', { key: 'demo_text' }) },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {presets.map(preset => (
        <button
          key={preset.name}
          onClick={preset.action}
          disabled={disabled}
          className="px-3 py-1.5 text-xs font-medium bg-white hover:bg-violet-50
            text-gray-600 hover:text-violet-700 rounded-lg transition-all duration-150
            border border-gray-200 hover:border-violet-300 hover:shadow-sm
            disabled:opacity-40 disabled:cursor-not-allowed
            flex items-center gap-1.5"
        >
          <span className="text-xs">{preset.icon}</span>
          {preset.name}
        </button>
      ))}
    </div>
  );
};

// SSE 超时测试组件
const TimeoutTest = () => {
  const [duration, setDuration] = useState('15');
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const [sseError, setSseError] = useState(null);
  const abortRef = { current: null };

  const startTest = useCallback(() => {
    const sec = parseInt(duration, 10);
    if (!sec || sec < 1 || sec > 120) return;

    setRunning(true);
    setLogs([]);
    setSseError(null);

    const controller = new AbortController();
    abortRef.current = controller;

    fetch(`/test-timeout?duration=${sec}`, { signal: controller.signal })
      .then(async (res) => {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const parts = buffer.split('\n\n');
          buffer = parts.pop() || '';

          for (const part of parts) {
            const eventMatch = part.match(/^event:\s*(.+)$/m);
            const dataMatch = part.match(/^data:\s*(.+)$/m);
            if (!eventMatch || !dataMatch) continue;
            const event = eventMatch[1];
            const data = JSON.parse(dataMatch[1]);
            setLogs((prev) => [...prev, { event, ...data, time: new Date().toLocaleTimeString() }]);
          }
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setSseError(err.message);
          setLogs((prev) => [...prev, { event: 'error', message: err.message, time: new Date().toLocaleTimeString() }]);
        }
      })
      .finally(() => setRunning(false));
  }, [duration]);

  const stopTest = useCallback(() => {
    abortRef.current?.abort();
    setRunning(false);
  }, []);

  const eventStyles = {
    start: 'text-blue-400 border-l-2 border-blue-500 pl-2',
    tick: 'text-slate-400 border-l-2 border-slate-600 pl-2',
    done: 'text-emerald-400 border-l-2 border-emerald-500 pl-2',
    error: 'text-red-400 border-l-2 border-red-500 pl-2',
  };

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300 border-t-4 border-t-violet-400">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <span className="w-6 h-6 bg-violet-100 rounded-md flex items-center justify-center text-violet-600 text-xs">⏱</span>
            超时测试 (SSE)
          </h2>
          <p className="text-xs text-gray-400 mt-0.5 ml-8">测试云函数执行时长限制，每秒推送一条消息</p>
        </div>
      </div>

      <div className="flex items-end gap-3 mb-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            等待时长 <span className="text-gray-400 font-normal text-xs">(秒, 1-120)</span>
          </label>
          <input
            type="number"
            min="1"
            max="120"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            disabled={running}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-sm
              hover:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-400
              focus:border-transparent transition-all duration-200 disabled:opacity-50"
          />
        </div>
        {!running ? (
          <Button variant="success" onClick={startTest} disabled={!duration || parseInt(duration) < 1}>
            开始测试
          </Button>
        ) : (
          <Button variant="danger" onClick={stopTest}>
            停止
          </Button>
        )}
      </div>

      {/* 快捷按钮 */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[10, 15, 20, 30, 60].map((s) => (
          <button
            key={s}
            onClick={() => setDuration(String(s))}
            disabled={running}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all duration-150 disabled:opacity-40 border
              ${duration === String(s) 
                ? 'bg-violet-100 text-violet-700 border-violet-300 shadow-sm' 
                : 'bg-white text-gray-500 border-gray-200 hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50'}`}
          >
            {s}s
          </button>
        ))}
      </div>

      {sseError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-700 flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {sseError}
        </div>
      )}

      {/* 日志流 */}
      <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400 opacity-70" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 opacity-70" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400 opacity-70" />
            </div>
            <span className="text-xs text-slate-400 font-mono ml-1">Event Stream</span>
          </div>
          {running && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              LIVE
            </span>
          )}
          {logs.length > 0 && !running && (
            <span className="text-xs text-slate-500">{logs.length} events</span>
          )}
        </div>
        <div className="p-4 max-h-80 overflow-auto font-mono text-xs space-y-1.5">
          {logs.length === 0 ? (
            <p className="text-slate-600 italic">等待开始...</p>
          ) : (
            logs.map((log, i) => (
              <div key={i} className={`flex gap-3 py-0.5 ${eventStyles[log.event] || 'text-slate-500 border-l-2 border-slate-700 pl-2'}`}>
                <span className="text-slate-600 shrink-0 tabular-nums">{log.time}</span>
                <span className="font-bold shrink-0 w-14 uppercase">[{log.event}]</span>
                <span className="truncate">
                  {log.event === 'tick' && `${log.second}s elapsed=${log.elapsed} remaining=${log.remaining}s`}
                  {log.event === 'start' && `duration=${log.duration}s started=${log.startTime}`}
                  {log.event === 'done' && `completed in ${log.totalElapsed}`}
                  {log.event === 'error' && log.message}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

// 主面板组件
export default function App() {
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [prefix, setPrefix] = useState('');
  const [limit, setLimit] = useState('20');
  const [cursor, setCursor] = useState('');
  const [getType, setGetType] = useState('text');
  const [putDataType, setPutDataType] = useState('text');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // API 调用函数
  const apiCall = useCallback(async (method, params = {}) => {
    setLoading(true);
    setError(null);
    try {
      let url = API_ENDPOINT;
      let options = { method };

      if (method === 'GET' && params.key) {
        url += `?key=${encodeURIComponent(params.key)}&type=${encodeURIComponent(params.type || 'text')}`;
      } else if (method === 'GET' && params.list) {
        const searchParams = new URLSearchParams({ action: 'list' });
        if (params.prefix) searchParams.set('prefix', params.prefix);
        if (params.limit) searchParams.set('limit', params.limit);
        if (params.cursor) searchParams.set('cursor', params.cursor);
        url += `?${searchParams.toString()}`;
      } else if (method === 'POST') {
        options.headers = { 'Content-Type': 'application/json' };
        options.body = JSON.stringify(params);
      } else if (method === 'DELETE') {
        url += `?key=${encodeURIComponent(params.key)}`;
      }

      const res = await fetch(url, options);
      const data = await res.json();
      setResult(data);
      if (!res.ok) setError(data.error || 'Request failed');
    } catch (err) {
      setError(err.message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // 快速测试处理
  const handleQuickTest = useCallback((action, params) => {
    if (action === 'get') {
      apiCall('GET', params);
    } else if (action === 'put') {
      apiCall('POST', params);
    } else if (action === 'delete') {
      apiCall('DELETE', params);
    } else if (action === 'list') {
      apiCall('GET', { list: true, ...params });
    }
  }, [apiCall]);

  // Key 校验
  const isKeyValid = key && /^[a-zA-Z0-9_]+$/.test(key);
  const keyError = key && !isKeyValid ? '仅支持字母、数字、下划线' : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/50 to-indigo-50">
      {/* 背景网格纹理 */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm shadow-violet-200">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">EdgeOne KV Demo</span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-700">
                EdgeKV
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-emerald-600">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              <span className="hidden sm:inline">在线</span>
            </div>
            <a
              href="https://pages.edgeone.ai/zh/document/kv-storage"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-violet-600 hover:text-violet-700 flex items-center gap-1 transition-colors"
            >
              API 文档
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </header>

      <main className="relative max-w-5xl mx-auto px-4 py-8">
        {/* 超时测试 - 全宽 */}
        <div className="mb-6">
          <TimeoutTest />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* 左侧：操作面板 */}
          <div className="space-y-6">
            {/* GET/PUT/DELETE 操作 */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300 border-t-4 border-t-blue-400">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center text-blue-600 text-xs font-bold">K</span>
                <h2 className="text-base font-semibold text-gray-900">单键操作</h2>
              </div>
              
              <div className="space-y-4">
                <Input
                  label="Key"
                  hint="字母、数字、下划线，≤512字节"
                  placeholder="例如: user_123, config_main"
                  value={key}
                  onChange={e => setKey(e.target.value)}
                  error={keyError}
                />

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-600">
                    Value <span className="text-gray-400 font-normal text-xs">(≤25MB)</span>
                  </label>
                  <textarea
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    placeholder='例如: Hello World 或 {"name": "Alice"}'
                    rows={3}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-sm
                      hover:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-400 
                      focus:border-transparent transition-all duration-200 resize-none
                      placeholder:text-gray-300"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="GET 返回类型"
                    value={getType}
                    onChange={e => setGetType(e.target.value)}
                    options={[
                      { value: 'text', label: 'text (默认)' },
                      { value: 'json', label: 'json' },
                      { value: 'arrayBuffer', label: 'arrayBuffer' },
                      { value: 'stream', label: 'stream' },
                    ]}
                  />
                  <Select
                    label="PUT 数据类型"
                    value={putDataType}
                    onChange={e => setPutDataType(e.target.value)}
                    options={[
                      { value: 'text', label: 'text (字符串)' },
                      { value: 'json', label: 'json (序列化)' },
                      { value: 'base64', label: 'base64 (二进制)' },
                    ]}
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <Button
                    variant="primary"
                    onClick={() => apiCall('GET', { key, type: getType })}
                    disabled={loading || !isKeyValid}
                  >
                    GET
                  </Button>
                  <Button
                    variant="success"
                    onClick={() => apiCall('POST', { key, value, dataType: putDataType })}
                    disabled={loading || !isKeyValid || !value}
                  >
                    PUT
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => apiCall('DELETE', { key })}
                    disabled={loading || !isKeyValid}
                  >
                    DELETE
                  </Button>
                </div>
              </div>
            </section>

            {/* LIST 操作 */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300 border-t-4 border-t-violet-400">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 bg-violet-100 rounded-md flex items-center justify-center text-violet-600 text-xs font-bold">≡</span>
                <h2 className="text-base font-semibold text-gray-900">遍历键 (LIST)</h2>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <Input
                    label="前缀"
                    placeholder="可选"
                    value={prefix}
                    onChange={e => setPrefix(e.target.value)}
                  />
                  <Input
                    label="数量"
                    type="number"
                    placeholder="20"
                    value={limit}
                    onChange={e => setLimit(e.target.value)}
                  />
                  <Input
                    label="游标"
                    placeholder="分页用"
                    value={cursor}
                    onChange={e => setCursor(e.target.value)}
                  />
                </div>

                <Button
                  variant="purple"
                  onClick={() => apiCall('GET', { list: true, prefix, limit: parseInt(limit) || 20, cursor })}
                  disabled={loading}
                  className="w-full justify-center"
                >
                  LIST 所有键
                </Button>
              </div>
            </section>

            {/* 快速测试 */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 bg-emerald-100 rounded-md flex items-center justify-center text-emerald-600 text-xs">⚡</span>
                <h2 className="text-base font-semibold text-gray-900">快速测试</h2>
              </div>
              <QuickTests onTest={handleQuickTest} disabled={loading} />
            </section>
          </div>

          {/* 右侧：结果面板 */}
          <div className="lg:sticky lg:top-20 lg:self-start space-y-6">
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 bg-slate-100 rounded-md flex items-center justify-center text-slate-600 text-xs">{'>'}_</span>
                <h2 className="text-base font-semibold text-gray-900">执行结果</h2>
              </div>
              <ResultPanel result={result} error={error} loading={loading} />
            </section>

            {/* API 参考 */}
            <section className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-2xl border border-violet-100 p-6">
              <h3 className="font-semibold text-violet-900 mb-4 flex items-center gap-2">
                <span className="w-5 h-5 bg-violet-200 rounded flex items-center justify-center text-violet-700 text-xs">?</span>
                API 参考
              </h3>
              <div className="space-y-3 text-sm font-mono">
                <div className="flex items-start gap-2">
                  <MethodBadge method="GET" />
                  <code className="text-violet-800 text-xs leading-relaxed">get(key, type?)<br/><span className="text-violet-400">→ text | json | arrayBuffer | stream</span></code>
                </div>
                <div className="flex items-start gap-2">
                  <MethodBadge method="POST" />
                  <code className="text-violet-800 text-xs leading-relaxed">put(key, value)<br/><span className="text-violet-400">→ string | ArrayBuffer | Stream</span></code>
                </div>
                <div className="flex items-start gap-2">
                  <MethodBadge method="DELETE" />
                  <code className="text-violet-800 text-xs leading-relaxed">delete(key)</code>
                </div>
                <div className="flex items-start gap-2">
                  <MethodBadge method="LIST" />
                  <code className="text-violet-800 text-xs leading-relaxed">list({'{prefix?, limit?, cursor?}'})<br/><span className="text-violet-400">→ keys[], cursor, complete</span></code>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
