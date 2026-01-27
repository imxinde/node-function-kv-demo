/**
 * Node Function KV 能力测试
 * 
 * 演示 Node Function 如何访问 EdgeKV 存储
 * 官方文档：https://pages.edgeone.ai/zh/document/kv-storage
 */

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

// 响应辅助函数
const jsonResponse = (data, status = 200) => 
  new Response(JSON.stringify(data), { status, headers: CORS_HEADERS });

const errorResponse = (message, details = {}, status = 400) => 
  jsonResponse({ error: message, ...details }, status);

// Key 格式校验
const isValidKey = (key) => /^[a-zA-Z0-9_]+$/.test(key);

export default async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const method = request.method;

  // CORS preflight
  if (method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        ...CORS_HEADERS,
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  // 检查 KV 是否已注入
  if (typeof my_kv === 'undefined') {
    return errorResponse('KV not available', {
      hint: 'Configure KV bindings in dev config or use --kv-bindings flag',
    }, 500);
  }

  try {
    switch (method) {
      case 'GET':
        return handleGet(url);
      case 'POST':
        return handlePut(request);
      case 'DELETE':
        return handleDelete(url);
      default:
        return errorResponse('Method not allowed', { allowed: ['GET', 'POST', 'DELETE'] }, 405);
    }
  } catch (err) {
    return errorResponse(err.message, { stack: err.stack }, 500);
  }
}

// GET 处理：获取值或列出键
async function handleGet(url) {
  const action = url.searchParams.get('action');
  const key = url.searchParams.get('key');
  const type = url.searchParams.get('type') || 'text';

  // LIST 操作
  if (action === 'list') {
    const prefix = url.searchParams.get('prefix') || '';
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 256);
    const cursor = url.searchParams.get('cursor') || undefined;

    const result = await my_kv.list({ prefix, limit, cursor });
    return jsonResponse({
      action: 'list',
      params: { prefix, limit, cursor },
      result,
    });
  }

  // GET 单键
  if (key) {
    const { value, meta } = await getValue(key, type);
    return jsonResponse({
      action: 'get',
      key,
      value,
      found: value !== null,
      meta,
    });
  }

  // 默认返回 API 说明
  return jsonResponse({
    service: 'EdgeOne KV Demo',
    status: 'ready',
    endpoints: {
      get: 'GET ?key=xxx&type=text|json|arrayBuffer|stream',
      put: 'POST { key, value, dataType? }',
      delete: 'DELETE ?key=xxx',
      list: 'GET ?action=list&prefix=&limit=20&cursor=',
    },
  });
}

// 根据类型获取值
async function getValue(key, type) {
  let value, meta = { requestedType: type };

  switch (type) {
    case 'json':
      value = await my_kv.get(key, 'json');
      meta.parsedType = typeof value;
      break;

    case 'arrayBuffer': {
      const buffer = await my_kv.get(key, { type: 'arrayBuffer' });
      if (buffer) {
        const bytes = new Uint8Array(buffer);
        value = btoa(String.fromCharCode(...bytes));
        meta.encoding = 'base64';
        meta.byteLength = buffer.byteLength;
      } else {
        value = null;
      }
      break;
    }

    case 'stream': {
      const stream = await my_kv.get(key, { type: 'stream' });
      if (stream) {
        const reader = stream.getReader();
        const chunks = [];
        let done, chunk;
        while (!done) {
          ({ done, value: chunk } = await reader.read());
          if (chunk) chunks.push(chunk);
        }
        const totalLength = chunks.reduce((acc, c) => acc + c.length, 0);
        const combined = new Uint8Array(totalLength);
        let offset = 0;
        for (const c of chunks) {
          combined.set(c, offset);
          offset += c.length;
        }
        value = new TextDecoder().decode(combined);
        meta.byteLength = totalLength;
        meta.streamConsumed = true;
      } else {
        value = null;
      }
      break;
    }

    default:
      value = await my_kv.get(key);
  }

  return { value, meta };
}

// PUT 处理：写入值
async function handlePut(request) {
  const body = await request.json();
  const { key, value, dataType = 'text' } = body;

  if (!key || value === undefined) {
    return errorResponse('Missing key or value', { received: Object.keys(body) });
  }

  if (!isValidKey(key)) {
    return errorResponse('Invalid key format', {
      hint: 'Key can only contain letters, numbers, and underscores',
      received: key,
    });
  }

  const { putValue, meta } = prepareValue(value, dataType);
  if (meta.error) {
    return errorResponse(meta.error, { dataType });
  }

  await my_kv.put(key, putValue);

  return jsonResponse({
    action: 'put',
    key,
    success: true,
    meta,
  });
}

// 准备写入值
function prepareValue(value, dataType) {
  let putValue, meta = { dataType };

  switch (dataType) {
    case 'json':
      putValue = typeof value === 'string' ? value : JSON.stringify(value);
      meta.storedAs = 'string (JSON)';
      break;

    case 'base64':
      try {
        const binary = atob(value);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        putValue = bytes.buffer;
        meta.storedAs = 'ArrayBuffer';
        meta.byteLength = bytes.length;
      } catch (e) {
        return { putValue: null, meta: { error: 'Invalid base64 encoding' } };
      }
      break;

    default:
      putValue = String(value);
      meta.storedAs = 'string';
  }

  return { putValue, meta };
}

// DELETE 处理：删除键
async function handleDelete(url) {
  const key = url.searchParams.get('key');

  if (!key) {
    return errorResponse('Missing key parameter');
  }

  await my_kv.delete(key);

  return jsonResponse({
    action: 'delete',
    key,
    success: true,
  });
}
