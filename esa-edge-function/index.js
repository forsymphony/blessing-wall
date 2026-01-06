/**
 * 阿里云 ESA 边缘函数 - 祝福墙计数服务
 * 
 * 路径设计：
 * GET  /total1 ~ /total8     - 获取总计数
 * POST /total1 ~ /total8     - 总计数 +1
 * GET  /today1 ~ /today8     - 获取今日计数
 * POST /today1 ~ /today8     - 今日计数 +1
 */

// 获取今天的中文日期
function getTodayDateStr() {
  const now = new Date();
  const beijingTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  const year = beijingTime.getUTCFullYear();
  const month = beijingTime.getUTCMonth() + 1;
  const day = beijingTime.getUTCDate();
  return `${year}年${month}月${day}日`;
}

// CORS 响应头
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'text/plain;charset=UTF-8'
};

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const method = request.method;
    const pathname = url.pathname;

    // 处理 CORS 预检
    if (method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const edgeKV = new EdgeKV({ namespace: 'blessing-wall' });

    // 处理 /total1 ~ /total8
    const totalMatch = pathname.match(/^\/total([1-8])$/);
    if (totalMatch) {
      const key = `total${totalMatch[1]}`;
      try {
        if (method === 'GET') {
          let value = await edgeKV.get(key, { type: 'text' });
          if (value === undefined) {
            await edgeKV.put(key, '0');
            value = '0';
          }
          return new Response(value, { headers: corsHeaders });
        }
        if (method === 'POST') {
          let value = await edgeKV.get(key, { type: 'text' });
          let count = value ? parseInt(value, 10) : 0;
          count += 1;
          await edgeKV.put(key, count.toString());
          return new Response(count.toString(), { headers: corsHeaders });
        }
      } catch (e) {
        return new Response('EdgeKV Error: ' + e.message, { status: 500, headers: corsHeaders });
      }
    }

    // 处理 /today1 ~ /today8
    const todayMatch = pathname.match(/^\/today([1-8])$/);
    if (todayMatch) {
      const num = todayMatch[1];
      const dateStr = getTodayDateStr();
      const key = `${dateStr}${num}`;
      try {
        if (method === 'GET') {
          let value = await edgeKV.get(key, { type: 'text' });
          if (value === undefined) {
            await edgeKV.put(key, '0');
            value = '0';
          }
          return new Response(value, { headers: corsHeaders });
        }
        if (method === 'POST') {
          let value = await edgeKV.get(key, { type: 'text' });
          let count = value ? parseInt(value, 10) : 0;
          count += 1;
          await edgeKV.put(key, count.toString());
          return new Response(count.toString(), { headers: corsHeaders });
        }
      } catch (e) {
        return new Response('EdgeKV Error: ' + e.message, { status: 500, headers: corsHeaders });
      }
    }

    // 404
    return new Response('Not Found', { status: 404, headers: corsHeaders });
  }
};
