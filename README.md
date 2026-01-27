# EdgeOne Node Function KV Demo

这是一个独立的 Node Function KV 存储能力测试项目，用于演示 EdgeOne Node Function 如何访问 EdgeKV 存储。

## 官方 API

参考文档：https://pages.edgeone.ai/zh/document/kv-storage

### GET - 读取数据

```typescript
get(key: string, options?: { type: string } | string): Promise<string | object | ArrayBuffer | ReadableStream | null>
```

- `type` 可选值: `text` (默认), `json`, `arrayBuffer`, `stream`
- 支持两种写法: `get(key, "json")` 或 `get(key, { type: "json" })`

### PUT - 写入数据

```typescript
put(key: string, value: string | ArrayBuffer | ArrayBufferView | ReadableStream): Promise<void>
```

- `key`: ≤512 字节，仅支持字母、数字、下划线
- `value`: ≤25 MB

### DELETE - 删除数据

```typescript
delete(key: string): Promise<void>
```

### LIST - 遍历键

```typescript
list(options?: { prefix?: string; limit?: number; cursor?: string }): Promise<ListResult>
```

返回值:
```typescript
{
  keys: Array<{ key: string }>,
  cursor?: string,
  complete: boolean
}
```

- `limit`: 默认 256，上限 256

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

### 3. 配置 KV 绑定

确保在 EdgeOne Pages 开发工具中配置了 KV 绑定（变量名 `my_kv`）。

## 项目结构

```
node-function-kv-demo/
├── node-functions/
│   └── node-function-kv-demo.js    # Node Function 后端处理逻辑
├── src/
│   ├── App.jsx                      # React 主组件
│   ├── main.jsx                     # 入口文件
│   └── index.css                    # 样式文件
├── index.html                       # HTML 模板
├── package.json                     # 依赖配置
├── vite.config.js                   # Vite 配置
└── edgeone.json                     # EdgeOne 配置
```

## API 测试端点

### GET - 获取值
```
GET /node-function-kv-demo?key=user_123&type=text|json|arrayBuffer|stream
```

### POST - 设置值
```
POST /node-function-kv-demo
Content-Type: application/json

{
  "key": "user_123",
  "value": "hello world",
  "dataType": "text"
}
```

`dataType` 可选值:
- `text`: 字符串存储
- `json`: JSON 序列化存储
- `base64`: Base64 解码为 ArrayBuffer 存储

### DELETE - 删除值
```
DELETE /node-function-kv-demo?key=user_123
```

### LIST - 列出 keys
```
GET /node-function-kv-demo?action=list&prefix=user_&limit=10
```

## 使用示例

```javascript
// Node Function 中访问 KV
export async function onRequest(context) {
  // my_kv 已通过 KV 绑定注入到 globalThis

  // 写入字符串
  await my_kv.put('user_123', JSON.stringify({ name: 'Alice' }));
  
  // 写入 ArrayBuffer
  const buffer = new TextEncoder().encode('binary data').buffer;
  await my_kv.put('binary_123', buffer);

  // 读取文本（默认）
  const text = await my_kv.get('user_123');

  // 读取 JSON（两种写法）
  const user = await my_kv.get('user_123', { type: 'json' });
  const user2 = await my_kv.get('user_123', 'json');

  // 读取 ArrayBuffer
  const arrayBuffer = await my_kv.get('binary_123', { type: 'arrayBuffer' });

  // 读取 Stream
  const stream = await my_kv.get('binary_123', { type: 'stream' });

  // 列出 keys
  const list = await my_kv.list({ prefix: 'user_', limit: 10 });
  // list.keys = [{ key: 'user_123' }, ...]
  // list.complete = true/false
  // list.cursor = 'next_key' (用于分页)

  // 删除
  await my_kv.delete('user_123');

  return new Response(JSON.stringify(user));
}
```

## 部署

```bash
npm run build
```

使用 EdgeOne Pages CLI 或控制台部署即可。

## 技术栈

- **前端**: React 19, Vite 7, Tailwind CSS 4
- **后端**: EdgeOne Node Functions
- **存储**: EdgeOne KV Storage

## License

MIT
