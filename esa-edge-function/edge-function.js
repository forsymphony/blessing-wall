/**
 * 阿里云 ESA 边缘函数 - 祝福墙计数服务
 * 
 * 部署步骤：
 * 1. 登录阿里云 ESA 控制台
 * 2. 进入「边缘计算」→「EdgeKV」，创建命名空间：blessing_wall
 * 3. 进入「边缘计算」→「函数和Pages」，创建新函数
 * 4. 将此代码粘贴到函数编辑器中
 * 5. 配置路由规则，绑定到您的站点
 */

import { EdgeKV } from 'edge-kv';

// EdgeKV 命名空间
const edgeKV = new EdgeKV({ namespace: 'blessing_wall' });

// 祝福ID列表
const BLESSING_IDS = [
  'blessing_1', 'blessing_2', 'blessing_3', 'blessing_4',
  'blessing_5', 'blessing_6', 'blessing_7', 'blessing_8'
];

// 获取今天的日期键
function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// CORS 响应头
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

// 处理 OPTIONS 预检请求
function handleOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}

// 发送祝福 - 增加计数
async function handleBless(request) {
  try {
    const body = await request.json();
    const { id } = body;

    // 验证祝福ID
    if (!id || !BLESSING_IDS.includes(id)) {
      return new Response(JSON.stringify({
        success: false,
        error: '无效的祝福ID'
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const today = getTodayKey();
    const totalKey = `${id}_total`;
    const todayKey = `${id}_${today}`;

    // 获取并更新总计数
    let totalCount = await edgeKV.get(totalKey, { type: 'json' }) || 0;
    totalCount += 1;
    await edgeKV.put(totalKey, totalCount);

    // 获取并更新今日计数
    let todayCount = await edgeKV.get(todayKey, { type: 'json' }) || 0;
    todayCount += 1;
    await edgeKV.put(todayKey, todayCount);

    return new Response(JSON.stringify({
      success: true,
      id,
      totalCount,
      todayCount
    }), {
      headers: corsHeaders
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
}

// 获取统计数据
async function handleStats(url) {
  try {
    const type = url.searchParams.get('type') || 'all';
    const today = getTodayKey();

    const stats = await Promise.all(BLESSING_IDS.map(async (id) => {
      const totalKey = `${id}_total`;
      const todayKey = `${id}_${today}`;

      const [totalCount, todayCount] = await Promise.all([
        edgeKV.get(totalKey, { type: 'json' }),
        edgeKV.get(todayKey, { type: 'json' })
      ]);

      return {
        id,
        totalCount: totalCount || 0,
        todayCount: todayCount || 0
      };
    }));

    return new Response(JSON.stringify({
      success: true,
      stats
    }), {
      headers: corsHeaders
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
}

// 主处理函数
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const method = request.method;
    const pathname = url.pathname;

    // 处理 CORS 预检
    if (method === 'OPTIONS') {
      return handleOptions();
    }

    // 路由处理
    if (pathname === '/bless' && method === 'POST') {
      return handleBless(request);
    }

    if (pathname === '/stats' && method === 'GET') {
      return handleStats(url);
    }

    // 404
    return new Response(JSON.stringify({
      success: false,
      error: '接口不存在'
    }), {
      status: 404,
      headers: corsHeaders
    });
  }
};

