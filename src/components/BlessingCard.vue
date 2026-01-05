<script setup lang="ts">
import { ref } from 'vue'
import type { Blessing } from '../types/blessing'

const props = defineProps<{
  blessing: Blessing
  index: number
}>()

const emit = defineEmits<{
  click: [id: string]
}>()

const isClicking = ref(false)
const showSuccess = ref(false)

async function handleClick() {
  if (isClicking.value) return
  
  isClicking.value = true
  showSuccess.value = true
  
  emit('click', props.blessing.id)
  
  // 重置状态
  setTimeout(() => {
    isClicking.value = false
  }, 500)
  
  setTimeout(() => {
    showSuccess.value = false
  }, 1500)
}
</script>

<template>
  <div 
    class="blessing-card"
    :class="{ 'is-clicking': isClicking, 'show-success': showSuccess }"
    :style="{ 
      '--card-gradient': blessing.gradient,
      '--delay': `${index * 0.1}s`
    }"
    @click="handleClick"
  >
    <div class="card-inner">
      <div class="emoji">{{ blessing.emoji }}</div>
      <div class="text">{{ blessing.text }}</div>
      <div class="click-hint">点击送出祝福</div>
    </div>
    
    <!-- 点击成功反馈 -->
    <div class="success-overlay" v-if="showSuccess">
      <span class="success-icon">✓</span>
      <span class="success-text">祝福已送出</span>
    </div>
    
    <!-- 涟漪效果 -->
    <div class="ripple" v-if="isClicking"></div>
  </div>
</template>

<style scoped>
.blessing-card {
  position: relative;
  border-radius: 20px;
  padding: 3px;
  background: var(--card-gradient);
  cursor: pointer;
  overflow: hidden;
  animation: fadeInUp 0.6s ease-out forwards;
  animation-delay: var(--delay);
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.blessing-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.3),
    0 0 60px rgba(255, 255, 255, 0.1);
}

.blessing-card.is-clicking {
  transform: scale(0.95);
}

.card-inner {
  background: rgba(15, 12, 41, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 17px;
  padding: 28px 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 160px;
  transition: all 0.3s ease;
}

.blessing-card:hover .card-inner {
  background: rgba(15, 12, 41, 0.75);
}

.emoji {
  font-size: 48px;
  line-height: 1;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
  transition: transform 0.3s ease;
}

.blessing-card:hover .emoji {
  transform: scale(1.2) rotate(-5deg);
  animation: bounce 0.6s ease infinite;
}

@keyframes bounce {
  0%, 100% { transform: scale(1.2) rotate(-5deg) translateY(0); }
  50% { transform: scale(1.2) rotate(-5deg) translateY(-8px); }
}

.text {
  font-family: 'Ma Shan Zheng', cursive;
  font-size: 22px;
  color: #fff;
  text-align: center;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
  letter-spacing: 2px;
}

.click-hint {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s ease;
}

.blessing-card:hover .click-hint {
  opacity: 1;
  transform: translateY(0);
}

/* 成功反馈覆盖层 */
.success-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(67, 233, 123, 0.95), rgba(56, 249, 215, 0.95));
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  animation: successFade 1.5s ease-out forwards;
}

@keyframes successFade {
  0% { opacity: 0; transform: scale(0.8); }
  20% { opacity: 1; transform: scale(1.05); }
  30% { transform: scale(1); }
  70% { opacity: 1; }
  100% { opacity: 0; }
}

.success-icon {
  font-size: 40px;
  color: #fff;
  animation: checkPop 0.4s ease-out;
}

@keyframes checkPop {
  0% { transform: scale(0) rotate(-45deg); }
  60% { transform: scale(1.2) rotate(10deg); }
  100% { transform: scale(1) rotate(0deg); }
}

.success-text {
  font-size: 16px;
  color: #fff;
  font-weight: 500;
}

/* 涟漪效果 */
.ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 10px;
  height: 10px;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: rippleEffect 0.6s ease-out;
  pointer-events: none;
}

@keyframes rippleEffect {
  0% {
    width: 10px;
    height: 10px;
    opacity: 1;
  }
  100% {
    width: 300px;
    height: 300px;
    opacity: 0;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

