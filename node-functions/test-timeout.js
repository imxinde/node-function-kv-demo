// SSE 超时测试：通过 ?duration=N 指定等待秒数，每秒推送一条消息
export default async function onRequest({ request }) {
  const url = new URL(request.url);
  const duration = Math.min(Math.max(parseInt(url.searchParams.get('duration') || '10', 10), 1), 120);

  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  const write = (event, data) =>
    writer.write(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));

  (async () => {
    const start = Date.now();
    await write('start', { duration, startTime: new Date().toISOString() });

    for (let i = 1; i <= duration; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      const elapsed = ((Date.now() - start) / 1000).toFixed(1);
      await write('tick', { second: i, elapsed: `${elapsed}s`, remaining: duration - i });
    }

    const total = ((Date.now() - start) / 1000).toFixed(1);
    await write('done', { totalElapsed: `${total}s`, success: true });
    await writer.close();
  })();

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
