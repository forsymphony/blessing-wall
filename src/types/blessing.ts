// 单条祝福定义
export interface Blessing {
  id: string
  text: string
  emoji: string
  gradient: string
}

// 祝福统计数据
export interface BlessingStats {
  id: string
  totalCount: number
  todayCount: number
}

// API 响应类型
export interface BlessResponse {
  success: boolean
  id: string
  totalCount: number
  todayCount: number
}

export interface StatsResponse {
  success: boolean
  stats: BlessingStats[]
}

// ESA API 配置
export interface ESAConfig {
  baseUrl: string
  useMock: boolean
}

