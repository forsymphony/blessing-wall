<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElTabs, ElTabPane, ElMessage } from 'element-plus'
import BlessingCard from '../components/BlessingCard.vue'
import StatsPanel from '../components/StatsPanel.vue'
import { blessings } from '../data/blessings'
import type { BlessingStats } from '../types/blessing'

// 当前 Tab
const activeTab = ref('total')

// 统计数据
const stats = ref<BlessingStats[]>([])

// 加载状态
const loading = ref(false)

// 点击冷却记录（3秒内同一祝福只能点击一次）
const lastClickTime = ref<Record<string, number>>({})
const CLICK_COOLDOWN = 3000 // 3秒

// 获取统计数据
async function fetchStats() {
  try {
    const results = await Promise.all(
      [1, 2, 3, 4, 5, 6, 7, 8].map(async (num) => {
        const [totalRes, todayRes] = await Promise.all([
          fetch(`/total${num}`),
          fetch(`/today${num}`)
        ])
        const totalCount = parseInt(await totalRes.text()) || 0
        const todayCount = parseInt(await todayRes.text()) || 0
        return {
          id: `blessing_${num}`,
          totalCount,
          todayCount
        }
      })
    )
    stats.value = results
  } catch (error) {
    console.error('获取统计失败:', error)
  }
}

// 处理祝福点击
async function handleBless(id: string) {
  // 检查冷却时间
  const now = Date.now()
  const lastTime = lastClickTime.value[id] || 0
  if (now - lastTime < CLICK_COOLDOWN) {
    ElMessage({
      message: `祝福冷却中，请稍后再试`,
      type: 'warning',
      duration: 1500
    })
    return
  }
  
  // 记录点击时间
  lastClickTime.value[id] = now
  
  try {
    // 从 blessing_1 提取序号 1
    const num = id.replace('blessing_', '')
    
    // 同时增加总计和今日计数
    const [totalRes, todayRes] = await Promise.all([
      fetch(`/total${num}`, { method: 'POST' }),
      fetch(`/today${num}`, { method: 'POST' })
    ])
    
    const totalCount = parseInt(await totalRes.text()) || 0
    const todayCount = parseInt(await todayRes.text()) || 0
    
    // 更新本地统计数据
    const statIndex = stats.value.findIndex(s => s.id === id)
    if (statIndex !== -1) {
      stats.value[statIndex].totalCount = totalCount
      stats.value[statIndex].todayCount = todayCount
    }
    
    // 找到祝福文本
    const blessing = blessings.find(b => b.id === id)
    
    ElMessage({
      message: `已送出祝福：${blessing?.text}`,
      type: 'success',
      duration: 2000,
      showClose: true
    })
  } catch (error) {
    ElMessage({
      message: '祝福发送失败，请稍后重试',
      type: 'error',
      duration: 2000
    })
  }
}

// 初始化
onMounted(async () => {
  loading.value = true
  await fetchStats()
  loading.value = false
})
</script>

<template>
  <div class="home-page">
    <!-- 头部区域 -->
    <header class="header">
      <div class="header-bg"></div>
      <h1 class="title">
        <span class="title-icon">🏮</span>
        <span class="title-text">祝福墙</span>
        <span class="title-icon">🏮</span>
      </h1>
      <p class="subtitle">选择一条祝福，送出您的心意</p>
    </header>

    <!-- 祝福卡片区域 -->
    <section class="blessing-section">
      <div class="blessing-grid">
        <BlessingCard
          v-for="(blessing, index) in blessings"
          :key="blessing.id"
          :blessing="blessing"
          :index="index"
          @click="handleBless"
        />
      </div>
    </section>

    <!-- 统计区域 -->
    <section class="stats-section">
      <div class="stats-container">
        <h2 class="section-title">
          <span class="section-icon">📊</span>
          祝福统计
        </h2>
        
        <ElTabs v-model="activeTab" class="stats-tabs">
          <ElTabPane label="🏆 总祝福次数" name="total">
            <StatsPanel :stats="stats" type="total" />
          </ElTabPane>
          <ElTabPane label="📅 今日祝福" name="today">
            <StatsPanel :stats="stats" type="today" />
          </ElTabPane>
        </ElTabs>
      </div>
    </section>

    <!-- 页脚 -->
    <footer class="footer">
      <p>用心传递祝福 · 让爱温暖世界</p>
      <p class="footer-tech">Powered by Vue 3 + Element Plus + Aliyun ESA</p>
    </footer>

    <!-- 装饰元素 -->
    <div class="decorations">
      <div class="decoration decoration-1">✨</div>
      <div class="decoration decoration-2">🌟</div>
      <div class="decoration decoration-3">💫</div>
      <div class="decoration decoration-4">⭐</div>
    </div>
  </div>
</template>

<style scoped>
.home-page {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
}

/* 头部样式 */
.header {
  text-align: center;
  padding: 40px 20px 60px;
  position: relative;
}

.header-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, rgba(102, 126, 234, 0.2) 0%, transparent 70%);
  pointer-events: none;
}

.title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 16px;
  position: relative;
}

.title-icon {
  font-size: 48px;
  animation: swing 2s ease-in-out infinite;
}

.title-icon:last-child {
  animation-delay: 0.5s;
}

@keyframes swing {
  0%, 100% { transform: rotate(-10deg); }
  50% { transform: rotate(10deg); }
}

.title-text {
  font-family: 'Ma Shan Zheng', cursive;
  font-size: 64px;
  background: linear-gradient(135deg, #fff 0%, #f0e6ff 50%, #ffd6e0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 40px rgba(255, 255, 255, 0.3);
  letter-spacing: 8px;
}

.subtitle {
  font-size: 18px;
  color: var(--text-muted);
  letter-spacing: 4px;
}

/* 祝福卡片区域 */
.blessing-section {
  padding: 0 20px 60px;
}

.blessing-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

@media (max-width: 1024px) {
  .blessing-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .blessing-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .title-text {
    font-size: 48px;
  }
  
  .title-icon {
    font-size: 36px;
  }
}

@media (max-width: 480px) {
  .blessing-grid {
    grid-template-columns: 1fr;
  }
  
  .title-text {
    font-size: 36px;
  }
}

/* 统计区域 */
.stats-section {
  padding: 0 20px 60px;
}

.stats-container {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid var(--glass-border);
  padding: 30px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-family: 'Ma Shan Zheng', cursive;
  font-size: 32px;
  color: var(--text-light);
  margin-bottom: 24px;
  letter-spacing: 4px;
}

.section-icon {
  font-size: 32px;
}

.stats-tabs {
  --el-tabs-header-height: 50px;
}

.stats-tabs :deep(.el-tabs__header) {
  margin-bottom: 20px;
}

.stats-tabs :deep(.el-tabs__nav-wrap) {
  display: flex;
  justify-content: center;
}

.stats-tabs :deep(.el-tabs__item) {
  font-size: 16px;
  padding: 0 30px;
}

/* 页脚 */
.footer {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-muted);
}

.footer p {
  margin: 8px 0;
}

.footer-tech {
  font-size: 12px;
  opacity: 0.6;
}

/* 装饰元素 */
.decorations {
  position: fixed;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
}

.decoration {
  position: absolute;
  font-size: 24px;
  opacity: 0.3;
  animation: float 6s ease-in-out infinite;
}

.decoration-1 {
  top: 10%;
  left: 5%;
  animation-delay: 0s;
}

.decoration-2 {
  top: 20%;
  right: 8%;
  animation-delay: 1.5s;
}

.decoration-3 {
  bottom: 30%;
  left: 10%;
  animation-delay: 3s;
}

.decoration-4 {
  bottom: 15%;
  right: 5%;
  animation-delay: 4.5s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(10deg);
  }
}
</style>
