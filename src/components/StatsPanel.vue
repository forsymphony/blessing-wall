<script setup lang="ts">
import { computed } from 'vue'
import type { BlessingStats } from '../types/blessing'
import { blessings } from '../data/blessings'

const props = defineProps<{
  stats: BlessingStats[]
  type: 'total' | 'today'
}>()

// 获取祝福信息
function getBlessingInfo(id: string) {
  return blessings.find(b => b.id === id)
}

// 计算最大值用于进度条
const maxCount = computed(() => {
  if (!props.stats.length) return 100
  const counts = props.stats.map(s => 
    props.type === 'total' ? s.totalCount : s.todayCount
  )
  return Math.max(...counts, 1)
})

// 计算进度百分比
function getPercentage(stat: BlessingStats): number {
  const count = props.type === 'total' ? stat.totalCount : stat.todayCount
  return Math.round((count / maxCount.value) * 100)
}

// 获取计数
function getCount(stat: BlessingStats): number {
  return props.type === 'total' ? stat.totalCount : stat.todayCount
}

// 计算总数
const totalSum = computed(() => {
  return props.stats.reduce((sum, s) => {
    return sum + (props.type === 'total' ? s.totalCount : s.todayCount)
  }, 0)
})

// 根据排名获取渐变色
function getProgressColor(index: number): string {
  const colors = [
    '#f093fb, #f5576c',  // 第1名 - 粉红
    '#4facfe, #00f2fe',  // 第2名 - 蓝色
    '#43e97b, #38f9d7',  // 第3名 - 绿色
    '#fa709a, #fee140',  // 第4名 - 橙粉
    '#a8edea, #fed6e3',  // 第5名 - 浅粉
    '#d299c2, #fef9d7',  // 第6名 - 浅紫
    '#89f7fe, #66a6ff',  // 第7名 - 天蓝
    '#fddb92, #d1fdff',  // 第8名 - 浅黄
  ]
  return colors[index % colors.length]
}

// 按计数排序的统计数据
const sortedStats = computed(() => {
  return [...props.stats].sort((a, b) => {
    const countA = props.type === 'total' ? a.totalCount : a.todayCount
    const countB = props.type === 'total' ? b.totalCount : b.todayCount
    return countB - countA
  })
})
</script>

<template>
  <div class="stats-panel">
    <!-- 总计数 -->
    <div class="total-summary">
      <span class="summary-label">{{ type === 'total' ? '累计祝福' : '今日祝福' }}</span>
      <span class="summary-count">{{ totalSum.toLocaleString() }}</span>
      <span class="summary-unit">次</span>
    </div>

    <!-- 统计列表 -->
    <div class="stats-list">
      <div 
        v-for="(stat, index) in sortedStats" 
        :key="stat.id"
        class="stat-item"
        :style="{ '--delay': `${index * 0.08}s` }"
      >
        <div class="stat-rank" :class="{ 'top-three': index < 3 }">
          {{ index + 1 }}
        </div>
        
        <div class="stat-info">
          <div class="stat-header">
            <span class="stat-emoji">{{ getBlessingInfo(stat.id)?.emoji }}</span>
            <span class="stat-text">{{ getBlessingInfo(stat.id)?.text }}</span>
          </div>
          
          <div class="stat-progress">
            <div class="progress-bar">
              <div 
                class="progress-fill"
                :style="{ 
                  width: `${getPercentage(stat)}%`,
                  background: `linear-gradient(90deg, ${getProgressColor(index)})`
                }"
              ></div>
            </div>
            <span class="stat-count">{{ getCount(stat).toLocaleString() }} 次</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-panel {
  padding: 20px 0;
}

.total-summary {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 8px;
  margin-bottom: 30px;
  padding: 20px;
  background: var(--glass-bg);
  border-radius: 16px;
  border: 1px solid var(--glass-border);
}

.summary-label {
  font-size: 16px;
  color: var(--text-muted);
}

.summary-count {
  font-size: 48px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea, #764ba2, #f093fb);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradientFlow 3s ease infinite;
}

@keyframes gradientFlow {
  0%, 100% { background-position: 0% center; }
  50% { background-position: 100% center; }
}

.summary-unit {
  font-size: 18px;
  color: var(--text-muted);
}

.stats-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: var(--glass-bg);
  border-radius: 16px;
  border: 1px solid var(--glass-border);
  animation: slideIn 0.5s ease-out forwards;
  animation-delay: var(--delay);
  opacity: 0;
  transform: translateX(-20px);
  transition: all 0.3s ease;
}

.stat-item:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateX(5px);
}

@keyframes slideIn {
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.stat-rank {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  font-size: 16px;
  font-weight: 600;
  color: var(--text-muted);
  flex-shrink: 0;
}

.stat-rank.top-three {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.stat-info {
  flex: 1;
  min-width: 0;
}

.stat-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.stat-emoji {
  font-size: 24px;
}

.stat-text {
  font-family: 'Ma Shan Zheng', cursive;
  font-size: 18px;
  color: var(--text-light);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stat-progress {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}

.stat-count {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-light);
  min-width: 80px;
  text-align: right;
}

/* 响应式 */
@media (max-width: 640px) {
  .stat-item {
    padding: 12px 16px;
  }
  
  .stat-text {
    font-size: 16px;
  }
  
  .summary-count {
    font-size: 36px;
  }
}
</style>

