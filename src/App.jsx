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
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    purple: 'bg-violet-600 hover:bg-violet-700 text-white',
    ghost: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 
        disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

// 输入框组件
const Input = ({ label, hint, error, ...props }) => (
  <div className="space-y-1">
    {label && (
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {hint && <span className="text-gray-400 font-normal ml-1">({hint})</span>}
      </label>
    )}
    <input
      {...props}
      className={`w-full px-3 py-2.5 border rounded-lg transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent
        ${error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
    />
    {error && <p className="text-red-500 text-xs">{error}</p>}
  </div>
);

// 选择框组件
const Select = ({ label, options, ...props }) => (
  <div className="space-y-1">
    {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
    <select
      {...props}
      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white
        hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 
        focus:border-transparent transition-all duration-200 cursor-pointer"
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

// 结果显示组件
const ResultPanel = ({ result, error, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-violet-600 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-700 font-medium mb-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          Error
        </div>
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="text-center py-12 text-gray-400">
        <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-sm">执行操作后结果将显示在此处</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 border-b border-gray-200">
        <span className="text-sm font-medium text-gray-600">Response</span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          result.success || result.found !== false 
            ? 'bg-green-100 text-green-700' 
            : 'bg-yellow-100 text-yellow-700'
        }`}>
          {result.action?.toUpperCase() || 'RESULT'}
        </span>
      </div>
      <pre className="p-4 text-sm text-gray-700 overflow-auto max-h-80 font-mono">
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );
};

// 快速测试预设组件
const QuickTests = ({ onTest, disabled }) => {
  const presets = [
    { name: '写入文本', action: () => onTest('put', { key: 'demo_text', value: 'Hello EdgeKV!', dataType: 'text' }) },
    { name: '写入JSON', action: () => onTest('put', { key: 'demo_json', value: JSON.stringify({ name: 'Alice', age: 25 }), dataType: 'json' }) },
    { name: '读取文本', action: () => onTest('get', { key: 'demo_text', type: 'text' }) },
    { name: '读取JSON', action: () => onTest('get', { key: 'demo_json', type: 'json' }) },
    { name: '列出所有', action: () => onTest('list', { prefix: '', limit: 20 }) },
    { name: '删除测试', action: () => onTest('delete', { key: 'demo_text' }) },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {presets.map(preset => (
        <button
          key={preset.name}
          onClick={preset.action}
          disabled={disabled}
          className="px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 
            text-gray-600 rounded-md transition-colors disabled:opacity-40"
        >
          {preset.name}
        </button>
      ))}
    </div>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-indigo-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            </div>
            <span className="font-semibold text-gray-900">EdgeOne KV Demo</span>
          </div>
          <a
            href="https://pages.edgeone.ai/zh/document/kv-storage"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-violet-600 hover:text-violet-700 flex items-center gap-1"
          >
            API 文档
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* 左侧：操作面板 */}
          <div className="space-y-6">
            {/* GET/PUT/DELETE 操作 */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">单键操作</h2>
              
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
                  <label className="block text-sm font-medium text-gray-700">
                    Value <span className="text-gray-400 font-normal">(≤25MB)</span>
                  </label>
                  <textarea
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    placeholder='例如: Hello World 或 {"name": "Alice"}'
                    rows={3}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white
                      hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 
                      focus:border-transparent transition-all duration-200 resize-none"
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

                <div className="flex gap-2 pt-2">
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
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">遍历键 (LIST)</h2>
              
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
                  className="w-full"
                >
                  LIST
                </Button>
              </div>
            </section>

            {/* 快速测试 */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">快速测试</h2>
              <QuickTests onTest={handleQuickTest} disabled={loading} />
            </section>
          </div>

          {/* 右侧：结果面板 */}
          <div className="lg:sticky lg:top-20 lg:self-start">
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">执行结果</h2>
              <ResultPanel result={result} error={error} loading={loading} />
            </section>

            {/* API 参考 */}
            <section className="mt-6 bg-gradient-to-br from-violet-50 to-indigo-50 rounded-xl border border-violet-200 p-6">
              <h3 className="font-semibold text-violet-900 mb-3">API 参考</h3>
              <div className="space-y-2 text-sm font-mono text-violet-800">
                <p><code className="bg-violet-100 px-1.5 py-0.5 rounded">get(key, type?)</code> → text | json | arrayBuffer | stream</p>
                <p><code className="bg-violet-100 px-1.5 py-0.5 rounded">put(key, value)</code> → string | ArrayBuffer | Stream</p>
                <p><code className="bg-violet-100 px-1.5 py-0.5 rounded">delete(key)</code></p>
                <p><code className="bg-violet-100 px-1.5 py-0.5 rounded">list({'{prefix?, limit?, cursor?}'})</code> → keys[], cursor, complete</p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
