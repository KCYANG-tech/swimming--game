<template>
  <view class="swimming-page">
    <!-- 页面头部 -->
    <view class="page-header">
      <view class="header-content">
        <button class="back-button" @click="goBack">
          ← 返回
        </button>
        <text class="page-title">游泳游戏</text>
        <view class="header-spacer"></view>
      </view>
    </view>

    <!-- 游戏组件 -->
    <SwimmingGameUI 
      ref="gameUI"
      @gameStart="handleGameStart"
      @gameEnd="handleGameEnd"
    />
    <view v-if="countdown>0 && gameStarted" class="countdown-overlay">
      <text class="count-text">{{ countdown }}</text>
    </view>
    <view class="best-score-box">
      <text class="best-score-text">最佳分数：{{ bestScore }}</text>
    </view>

  <!-- 游戏说明弹窗 -->
    <view v-if="showInstructions" class="instructions-modal">
      <view class="modal-content">
        <view class="modal-header">
          <text class="modal-title">游戏说明</text>
          <button class="close-button" @click="closeInstructions">×</button>
        </view>
        
        <view class="modal-body">
          <view class="instruction-section">
            <text class="section-title">🎮 游戏玩法</text>
            <text class="instruction-text">• 倾斜手机控制方向（左右/前后）</text>
            <text class="instruction-text">• 角色持续前进，方向受倾斜与摇杆影响</text>
            <text class="instruction-text">• 收集金币获取分数，避开障碍物</text>
          </view>
          
          <view class="instruction-section">
            <text class="section-title">📱 传感器与安全</text>
            <text class="instruction-text">• 需要方向传感器（DeviceOrientation）权限</text>
            <text class="instruction-text">• 请在安全环境下游玩，避免剧烈晃动</text>
            <text class="instruction-text">• 建议坐姿或站立轻微倾斜操作</text>
          </view>
          
          <view class="instruction-section">
            <text class="section-title">🏆 规则与时长</text>
            <text class="instruction-text">• 金币 +1 分；每连续吃 3 个金币 +1 命（上限 5）</text>
            <text class="instruction-text">• 碰撞障碍物会扣 1 命，并获得短暂无敌</text>
            <text class="instruction-text">• 初始 3 条命；总时长 60 秒</text>
          </view>
        </view>
        
        <view class="modal-footer">
          <button class="start-game-button" @click="startGame">
            开始游戏
          </button>
        </view>
      </view>
    </view>

  <!-- 规则浮动按钮 -->
  <button class="rules-fab" @click="openInstructions">规则</button>

    <!-- 传感器权限提示 -->
    <view v-if="showPermissionTip" class="permission-tip">
      <view class="tip-content">
        <text class="tip-text">需要传感器权限才能进行游戏</text>
        <button class="tip-button" @click="requestPermission">
          授权
        </button>
        <button class="tip-close" @click="closePermissionTip">
          ×
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import SwimmingGameUI from '@/components/SwimmingGameUI.vue'

export default {
  name: 'SwimmingPage',
  components: {
    SwimmingGameUI
  },
  data() {
    return {
      showInstructions: false,
      showPermissionTip: false,
      gameStarted: false,
      countdown: 0,
      bestScore: uni.getStorageSync('bestScore') || 0
    }
  },
  onLoad() {
    this.checkSensorSupport()
  },
  onShow() {
    // 页面显示时检查传感器状态
    this.checkSensorStatus()
  },
  methods: {
    /**
     * 返回上一页
     */
    goBack() {
      if (this.gameStarted) {
        uni.showModal({
          title: '确认退出',
          content: '游戏正在进行中，确定要退出吗？',
          success: (res) => {
            if (res.confirm) {
              uni.navigateBack()
            }
          }
        })
      } else {
        uni.navigateBack()
      }
    },

    /**
     * 检查传感器支持
     */
    checkSensorSupport() {
      const hasMotion = 'DeviceMotionEvent' in window
      const hasOrientation = 'DeviceOrientationEvent' in window
      
      if (!hasMotion && !hasOrientation) {
        uni.showModal({
          title: '设备不支持',
          content: '您的设备不支持传感器功能，无法进行游戏',
          showCancel: false,
          success: () => {
            uni.navigateBack()
          }
        })
        return false
      }
      return true
    },

    /**
     * 检查传感器状态
     */
    checkSensorStatus() {
      // 检查是否已授权传感器权限
      if (typeof DeviceMotionEvent !== 'undefined' && 
          typeof DeviceMotionEvent.requestPermission === 'function') {
        // 现代浏览器需要权限
        this.showPermissionTip = true
      }
    },

    /**
     * 请求传感器权限
     */
    async requestPermission() {
      try {
        if (typeof DeviceMotionEvent !== 'undefined' && 
            typeof DeviceMotionEvent.requestPermission === 'function') {
          const motionPermission = await DeviceMotionEvent.requestPermission()
          if (motionPermission !== 'granted') {
            throw new Error('运动传感器权限被拒绝')
          }
        }
        
        if (typeof DeviceOrientationEvent !== 'undefined' && 
            typeof DeviceOrientationEvent.requestPermission === 'function') {
          const orientationPermission = await DeviceOrientationEvent.requestPermission()
          if (orientationPermission !== 'granted') {
            throw new Error('方向传感器权限被拒绝')
          }
        }
        
        this.showPermissionTip = false
        uni.showToast({
          title: '权限获取成功',
          icon: 'success'
        })
      } catch (error) {
        console.error('权限获取失败:', error)
        uni.showModal({
          title: '权限获取失败',
          content: '无法获取传感器权限，请检查浏览器设置',
          showCancel: false
        })
      }
    },

    /**
     * 开始游戏
     */
    startGame() {
      this.showInstructions = false
      this.gameStarted = true
      this.countdown = 3
      const tick = () => {
        if (this.countdown <= 0) {
          this.countdown = 0
          this.$refs.gameUI.startGame()
        } else {
          this.countdown--
          setTimeout(tick, 1000)
        }
      }
      setTimeout(tick, 1000)
    },

    /**
     * 关闭说明弹窗
     */
    closeInstructions() {
      this.showInstructions = false
    },
    openInstructions(){
      this.showInstructions = true
    },

    /**
     * 关闭权限提示
     */
    closePermissionTip() {
      this.showPermissionTip = false
    },

    /**
     * 处理游戏开始
     */
    handleGameStart() {
      this.gameStarted = true
      console.log('游戏开始')
    },

    /**
     * 处理游戏结束
     */
    handleGameEnd(data) {
      this.gameStarted = false
      console.log('游戏结束:', data)
      
      // 显示游戏结果
      uni.showModal({
        title: '游戏结束',
        content: `最终分数：${data.score}\n游泳距离：${Math.round(data.distance)}m\n挥臂次数：${data.strokeCount}`,
        showCancel: false,
        confirmText: '再来一局',
        success: (res) => {
          if (res.confirm) {
            this.restartGame()
          }
        }
      })
      if (data && typeof data.score === 'number' && data.score > this.bestScore) {
        this.bestScore = data.score
        uni.setStorageSync('bestScore', this.bestScore)
        uni.showToast({ title:'新纪录!', icon:'success' })
      }
    },

    /**
     * 重新开始游戏
     */
    restartGame() {
      this.$refs.gameUI.restartGame()
    }
  }
}
</script>

<style scoped>
.swimming-page {
.countdown-overlay { position:fixed; inset:0; display:flex; align-items:center; justify-content:center; z-index:3000; pointer-events:none }
.count-text { font-size:120rpx; font-weight:700; color:rgba(255,255,255,.95); text-shadow:0 8rpx 20rpx rgba(0,0,0,.4); animation:pop .9s ease }
.best-score-box { position:fixed; top:90rpx; right:20rpx; background:rgba(0,0,0,.35); padding:16rpx 26rpx; border-radius:30rpx; z-index:1200 }
.best-score-text { font-size:24rpx; color:#fff }
@keyframes pop { 0%{transform:scale(.2);opacity:0}60%{transform:scale(1.05);opacity:1}100%{transform:scale(1);opacity:1} }
  width: 100%;
  height: 100vh;
  background: linear-gradient(180deg, #87CEEB 0%, #4682B4 100%);
  position: relative;
}

.page-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10rpx);
  padding: 20rpx;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 750rpx;
  margin: 0 auto;
}

.back-button {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2rpx solid rgba(255, 255, 255, 0.3);
  padding: 12rpx 24rpx;
  border-radius: 24rpx;
  font-size: 24rpx;
}

.page-title {
  color: white;
  font-size: 32rpx;
  font-weight: bold;
}

.header-spacer {
  width: 100rpx;
}

/* 说明弹窗 */
.instructions-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 40rpx;
}

.modal-content {
  background: white;
  border-radius: 32rpx;
  width: 100%;
  max-width: 600rpx;
  max-height: 80vh;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 40rpx 40rpx 20rpx;
  border-bottom: 2rpx solid #f0f0f0;
}

.modal-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.close-button {
  background: none;
  border: none;
  font-size: 48rpx;
  color: #999;
  color: #999;
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: 40rpx;
  max-height: 60vh;
  overflow-y: auto;
}

.instruction-section {
  margin-bottom: 40rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 20rpx;
}

.instruction-text {
  font-size: 24rpx;
  color: #666;
  line-height: 1.6;
  display: block;
  margin-bottom: 12rpx;
}

.modal-footer {
  padding: 20rpx 40rpx 40rpx;
  text-align: center;
}

.start-game-button {
  background: linear-gradient(45deg, #FF6B6B, #4ECDC4);
  color: white;
  border: none;
  padding: 24rpx 60rpx;
  border-radius: 48rpx;
  font-size: 32rpx;
  font-weight: bold;
  width: 100%;
}

/* 权限提示 */
.permission-tip {
  position: fixed;
  bottom: 40rpx;
  left: 40rpx;
  right: 40rpx;
  z-index: 1500;
}

.tip-content {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 24rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tip-text {
  font-size: 24rpx;
  flex: 1;
  margin-right: 20rpx;
}

.tip-button {
  background: #4ECDC4;
  color: white;
  border: none;
  padding: 12rpx 24rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  margin-right: 12rpx;
}

.tip-close {
  background: none;
  border: none;
  color: white;
  font-size: 32rpx;
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 规则浮动按钮 */
.rules-fab{
  position: fixed;
  right: 20rpx;
  bottom: 20rpx;
  z-index: 1800;
  background: rgba(0,0,0,.45);
  color: #fff;
  border: none;
  border-radius: 22rpx;
  padding: 16rpx 24rpx;
  font-size: 26rpx;
  backdrop-filter: blur(6rpx);
}
</style>
