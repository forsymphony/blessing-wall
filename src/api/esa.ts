import axios from 'axios'
import type { BlessResponse, StatsResponse, BlessingStats } from '../types/blessing'

// ESA 配置
const ESA_CONFIG = {
  // ESA 边缘函数地址
  baseUrl: import.meta.env.VITE_ESA_BASE_URL || ''
}

// ESA API 实例
const esaApi = axios.create({
  baseURL: ESA_CONFIG.baseUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 发送祝福 API
export async function sendBlessing(id: string): Promise<BlessResponse> {
  try {
    const response = await esaApi.post('/bless', { id })
    return response.data
  } catch (error) {
    console.error('发送祝福失败:', error)
    throw error
  }
}

// 获取统计数据 API
export async function getStats(type: 'total' | 'today'): Promise<StatsResponse> {
  try {
    const response = await esaApi.get('/stats', { params: { type } })
    return response.data
  } catch (error) {
    console.error('获取统计失败:', error)
    throw error
  }
}

// 获取所有统计数据（包含总数和今日）
export async function getAllStats(): Promise<BlessingStats[]> {
  try {
    const response = await esaApi.get('/stats', { params: { type: 'all' } })
    return response.data.stats
  } catch (error) {
    console.error('获取全部统计失败:', error)
    throw error
  }
}

