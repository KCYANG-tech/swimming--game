<template>
  <view class="swimming-game-container">
    <!-- 权限失败覆盖层 -->
    <view v-if="permissionError" class="overlay">
      <view class="overlay-box">
        <text class="ov-title">传感器不可用</text>
        <text class="ov-msg">
          {{ permissionError }}
          <block v-if="!sensorReady">如果多次授权失败，仍可使用“摇杆模式”体验游戏。</block>
        </text>
        <view style="display:flex; gap:24rpx; flex-wrap:wrap; justify-content:center">
          <button class="btn primary" @click="retryPermission" @tap="retryPermission">重试授权</button>
          <button class="btn" @click="enableJoystickMode" @tap="enableJoystickMode">仅摇杆模式</button>
        </view>
      </view>
    </view>
    <!-- Ready Screen -->
    <view v-if="gameState==='ready'" class="panel start">
      <text class="title">游泳游戏</text>
      <text class="subtitle">倾斜手机来控制方向，收集金币并躲避障碍</text>
      <button class="btn primary" :disabled="!sensorReady" @click="startGame" @tap="startGame" @touchstart="startGame">
        {{ sensorReady ? '开始游戏' : '等待传感器权限' }}
      </button>
      <button class="btn" @click="enableJoystickAndStart" @tap="enableJoystickAndStart" @touchstart="enableJoystickAndStart">改用摇杆开始</button>
      <view class="tips">
        <text>📱 倾斜手机：左右/前后控制方向</text>
        <text>🎯 收集金币，避开障碍物</text>
        <text>⏰ 游戏时长：60秒</text>
      </view>
    </view>

    <!-- Playing Screen -->
    <view v-else-if="gameState==='playing'" class="panel playing">
      <view class="hud">
        <view class="hud-item"><text class="label">分数</text><text class="val">{{ gameData.score }}</text></view>
        <view class="hud-item"><text class="label">距离</text><text class="val">{{ distanceDisplay }}m</text></view>
        <view class="hud-item"><text class="label">速度</text><text class="val">{{ speedDisplay }}km/h</text></view>
        <view class="hud-item"><text class="label">剩余</text><text class="val">{{ timeDisplay }}</text></view>
        <view class="hud-item"><text class="label">生命</text><text class="val">{{ livesHearts }}</text></view>
        <!-- 已改为倾斜控制，移除挥臂统计 -->
        <view class="hud-item"><text class="label">最高速</text><text class="val">{{ maxSpeedDisplay }}km/h</text></view>
      </view>
      <!-- 大号生命徽章 -->
      <view class="life-badge" aria-label="生命">{{ livesHearts }}</view>
  <view class="game-area">
        <!-- Player -->
        <view class="player" :class="{swimming:isSwimming}" :style="playerStyle">🏊‍♂️</view>
        <!-- Obstacles -->
        <view v-for="(o,i) in gameData.obstacles" :key="'ob-'+i" class="obj obstacle" :style="objectStyle(o)">🪨</view>
        <!-- Coins -->
        <view v-for="(c,i) in gameData.coins" :key="'coin-'+i" class="obj coin" :style="objectStyle(c)">🪙</view>
        <!-- Particles -->
        <view v-for="(p,i) in gameData.particles" :key="'p-'+i" class="obj particle" :style="particleStyle(p)">✨</view>
      </view>
      <!-- 底部工具条 -->
      <view class="bottom-toolbar">
        <button class="tb-btn" @click="togglePause" :aria-label="gameState==='playing' ? '暂停' : '继续'">{{ gameState==='playing' ? '⏸️' : '▶️' }}</button>
        <button class="tb-btn" @click="restartGame" aria-label="重开">🔄</button>
        <button class="tb-btn danger" @click="endGame" aria-label="结束">⏹</button>
      </view>
      <!-- 调试轮盘开关 -->
      <view class="debug-toggle" @click="toggleDebugWheel">🛠️</view>
      <!-- 调试轮盘 -->
  <view v-if="showDebugWheel" class="debug-wheel" :class="{dragging:wheelDragging}" :style="{left: wheelPos.x + 'px', top: wheelPos.y + 'px'}" @mousedown.prevent="startWheelDrag" @touchstart.prevent="startWheelDrag">
        <view class="joystick" ref="joystick" @mousedown.stop.prevent="startStick" @touchstart.stop.prevent="startStick" @mousemove.stop.prevent="onStickMove" @touchmove.stop.prevent="onStickMove">
          <view class="stick" :style="stickStyle"></view>
        </view>
        <view class="dbg-row">
          <button class="dbg-small" @click="wheelAction('obstacle')">障碍+</button>
          <button class="dbg-small" @click="wheelAction('coin')">金币+</button>
          <button class="dbg-small" @click="wheelAction('speed+')">速度+</button>
          <button class="dbg-small" @click="wheelAction('speed-')">速度-</button>
        </view>
        <view class="dbg-row">
          <button class="dbg-small" @click="wheelAction('stroke')">粒子</button>
          <button class="dbg-small" @click="wheelAction(swimmingGame && swimmingGame.gameState==='playing' ? 'pause':'resume')">{{ swimmingGame && swimmingGame.gameState==='playing' ? '暂停':'继续' }}</button>
          <button class="dbg-small" @click="wheelAction('end')">结束</button>
          <button class="dbg-small" @click="restartGame">重开</button>
        </view>
      </view>
    </view>

    <!-- Paused Screen -->
    <view v-else-if="gameState==='paused'" class="panel paused">
      <text class="title">已暂停</text>
      <button class="btn primary" @click="resumeGame">继续</button>
      <button class="btn" @click="endGame">结束</button>
    </view>

    <!-- Ended Screen -->
    <view v-else class="panel ended">
      <text class="title">游戏结束</text>
      <text class="subtitle" v-if="endReason">{{ endMessage }}</text>
      <view class="summary">
        <text>分数：{{ gameData.score }}</text>
        <text>距离：{{ distanceDisplay }}m</text>
        <text>最高速度：{{ maxSpeedDisplay }}km/h</text>
        <text>剩余生命：{{ livesHearts }}</text>
      </view>
      <button class="btn primary" @click="restartGame">再玩一次</button>
    </view>
  </view>
</template>

<script>
import SensorManager from '@/common/sensorManager.js'
import SwimmingGame from '@/common/swimmingGame.js'
import { logout } from '@/common/api/auth.js'

export default {
  name: 'SwimmingGameUI',
  data() {
    return {
      sensorManager: null,
      swimmingGame: null,
      sensorReady: false,
      permissionError: '',
      isSwimming: false,
      gameData: {
        score: 0,
        distance: 0,
        speed: 0,
        strokeCount: 0,
        lives: 3,
        maxSpeed: 0,
        player: { x:50, y:50, size:20 },
        obstacles: [],
        coins: [],
        particles: [],
        time: 0,
        maxTime: 60000
      },
      gameState: 'ready',
    endReason: null,
  waveOffset: 0,
  _lastSync: 0,
      _syncInterval: 1000/30 // UI刷新目标 ~30fps
      , showDebugWheel: false
      , wheelPos: { x: 100, y: 220 } // 初始位置 (px)
      , wheelDragging: false
      , wheelDragOffset: { x:0, y:0 }
      , stickX: 0
      , stickY: 0
      , stickActive: false
      , _stickMoveHandler: null
      , _stickEndHandler: null
      , _autoStartAttempted: false
      , _joystickRect: null
    }
  },
  computed: {
    livesHearts(){
      const lives = Math.max(0, this.gameData && typeof this.gameData.lives==='number' ? this.gameData.lives : 0)
      const cap = this.gameData && typeof this.gameData.maxLives==='number' ? this.gameData.maxLives : Math.max(lives, 3)
      const n = Math.min(lives, cap)
      const filled = '❤️'.repeat(n)
      const empty = '🤍'.repeat(Math.max(0, cap - n))
      return filled + empty
    },
    endMessage(){
      if(!this.endReason) return ''
      if(this.endReason === 'time') return '时间到，挑战结束'
      if(this.endReason === 'lives') return '生命耗尽，挑战结束'
      return '挑战结束'
    },
    timeDisplay() {
      const ms = Math.max(0, this.gameData.maxTime - this.gameData.time)
      const s = Math.ceil(ms/1000)
      const m = Math.floor(s/60)
      const sec = (s%60).toString().padStart(2,'0')
      return `${m}:${sec}`
    },
    distanceDisplay() { return Math.round(this.gameData.distance) },
    speedDisplay() { return (this.gameData.speed*10).toFixed(1) },
    maxSpeedDisplay() { return (this.gameData.maxSpeed*10).toFixed(1) },
    playerStyle() {
      return {
        left: this.gameData.player.x + '%',
        top: this.gameData.player.y + '%'
      }
    }
    , stickStyle() {
      const r = 40; // 最大偏移（px）
      return {
        transform: `translate(-50%,-50%) translate(${this.stickX * r}px, ${this.stickY * r}px)`
      }
    }
  },
  mounted() {
    this.initGame()
  },
  beforeUnmount() {
    this.cleanup()
  },
  methods: {
    _getEventHost(){
      const w = (typeof window !== 'undefined' && window && typeof window.addEventListener === 'function') ? window : null
      if (w) return w
      const d = (typeof document !== 'undefined' && document && typeof document.addEventListener === 'function') ? document : null
      return d
    },
    _getViewportSize(){
      const sys = (typeof uni !== 'undefined' && uni && uni.getSystemInfoSync) ? uni.getSystemInfoSync() : null
      const width = (typeof window !== 'undefined' && window && typeof window.innerWidth === 'number') ? window.innerWidth : (sys ? sys.windowWidth : 750)
      const height = (typeof window !== 'undefined' && window && typeof window.innerHeight === 'number') ? window.innerHeight : (sys ? sys.windowHeight : 1334)
      return { width, height }
    },
    _measureJoystick(cb){
      try {
        const q = (typeof uni !== 'undefined' && uni && uni.createSelectorQuery) ? uni.createSelectorQuery().in(this) : null
        if (!q) { if (cb) cb(null); return }
        q.select('.joystick').boundingClientRect(rect => {
          if (rect) this._joystickRect = rect
          if (cb) cb(rect)
        }).exec(()=>{})
      } catch(e){ if (cb) cb(null) }
    },
    _extractPoint(e){
      const t = (e && (e.touches && e.touches[0])) || (e && (e.changedTouches && e.changedTouches[0])) || e || {}
      const x = t.clientX ?? t.pageX ?? (e && e.detail && e.detail.x) ?? 0
      const y = t.clientY ?? t.pageY ?? (e && e.detail && e.detail.y) ?? 0
      const target = t.target || (e && e.target) || null
      return { x, y, target }
    },
    async initGame() {
      // 延迟到 plusready 后再初始化（原生 APP 内确保 plus.* 可用）
      const setup = async () => {
        this.sensorManager = new SensorManager()
        this.sensorManager.onMotion(this.handleMotion)
        this.sensorManager.onError(err => console.error('传感器错误', err))

        this.swimmingGame = new SwimmingGame()
        this.swimmingGame.onStateChange(state => { this.gameState = state })
        this.swimmingGame.onScoreUpdate(score => { this.gameData.score = score })
        this.swimmingGame.onGameOver(data => { console.log('GameOver', data) })
        this.swimmingGame.onGameOver(data => {
          try {
            const prevBest = uni.getStorageSync('bestScore')
            if (!prevBest || data.score > prevBest) {
              uni.setStorageSync('bestScore', data.score)
            }
            uni.setStorageSync('recentScore', data.score)
            this.endReason = data && data.endReason ? data.endReason : null
            if (data && typeof data.lives === 'number') {
              this.gameData.lives = data.lives
            }
            const prevLongest = Number(uni.getStorageSync('longestGameMs') || 0)
            const nowTime = Number(data && data.time ? data.time : 0)
            if (!isNaN(nowTime) && nowTime > prevLongest) {
              uni.setStorageSync('longestGameMs', nowTime)
            }
            const prevGames = Number(uni.getStorageSync('totalGames') || 0)
            uni.setStorageSync('totalGames', prevGames + 1)
            const prevCoins = Number(uni.getStorageSync('totalCoins') || 0)
            const addCoins = (typeof data.score === 'number' && data.score > 0) ? data.score : 0
            uni.setStorageSync('totalCoins', prevCoins + addCoins)
          } catch(e) { console.warn('保存分数失败', e) }
        })
        this.swimmingGame.init()

        try {
          await this.sensorManager.initialize()
          this.sensorManager.startListening()
          this.sensorReady = true
          this.permissionError = ''
          console.log('[Sensor] 初始化成功 sensorReady=true')
          uni.showToast({ title: '传感器就绪', icon: 'none' })
        } catch(e) {
          console.warn('传感器未就绪:', e.message)
          this.permissionError = e.message || '无法获取传感器'
          console.log('[Sensor] 初始化失败 permissionError=', this.permissionError)
          uni.showToast({ title: '传感器失败', icon: 'none' })
        }
        // 5 秒后如果仍未开始且传感器未就绪，自动摇杆启动一次（只尝试一次）
        setTimeout(()=>{
          if(!this._autoStartAttempted && this.gameState==='ready' && !this.sensorReady) {
            this._autoStartAttempted = true
            console.log('[AutoStart] 传感器未就绪，自动切换摇杆启动')
            this.enableJoystickAndStart()
          }
        },5000)
      }
      // H5 环境没有 plus: 直接初始化；APP-PLUS 需等待 plusready
      if (typeof plus === 'undefined') {
        // 浏览器或非 APP-PLUS 平台
        await setup()
      } else if (typeof plus === 'object') {
        // APP 里尝试直接调用，如果失败再监听 plusready
        try {
          await setup()
        } catch(e) {
          console.log('[Init] 直接 setup 失败，等待 plusready', e.message)
          document.addEventListener('plusready', setup, { once: true })
        }
      } else {
        document.addEventListener('plusready', setup, { once: true })
      }
    },
    async retryPermission() {
      this.permissionError = ''
      this.sensorReady = false
      try {
        await this.sensorManager.initialize()
        this.sensorManager.startListening()
        this.sensorReady = true
      } catch(e) {
        this.permissionError = e.message || '授权失败'
      }
    },
    enableJoystickMode(){
      // 启用纯摇杆模式：不再尝试传感器，允许开始游戏
      this.joystickOnly = true
      this.sensorReady = true
      this.permissionError = ''
      this.showDebugWheel = true // 默认展示摇杆面板
      if(!this.swimmingGame){
        // 兜底实例化
        this.swimmingGame = new SwimmingGame()
        this.swimmingGame.onStateChange(state => { this.gameState = state })
        this.swimmingGame.onScoreUpdate(score => { this.gameData.score = score })
        this.swimmingGame.onGameOver(data => { console.log('GameOver', data) })
        this.swimmingGame.init()
      }
    },
    enableJoystickAndStart(){
      this.enableJoystickMode()
      this.startGame()
    },
    startGame() {
      console.log('[UI] startGame 被触发 sensorReady=', this.sensorReady)
      if(!this.sensorReady) {
        console.log('[UI] 传感器未就绪，尝试自动启用摇杆模式')
        this.enableJoystickMode()
      }
      if(!this.swimmingGame){
        console.log('[UI] swimmingGame 实例不存在，兜底创建')
        this.swimmingGame = new SwimmingGame()
        this.swimmingGame.onStateChange(state => { this.gameState = state })
        this.swimmingGame.onScoreUpdate(score => { this.gameData.score = score })
        this.swimmingGame.onGameOver(data => { console.log('GameOver', data) })
        this.swimmingGame.init()
      }
      this.swimmingGame.startGame()
      this.tickSync()
    },
    pauseGame() { this.swimmingGame.pauseGame() },
    resumeGame() { this.swimmingGame.resumeGame(); this.tickSync() },
    endGame() { this.swimmingGame.endGame() },
  togglePause(){ if(this.gameState==='playing') this.pauseGame(); else if(this.gameState==='paused') this.resumeGame() },
  restartGame() { this.endReason = null; this.swimmingGame.resetGame(); this.swimmingGame.startGame(); this.tickSync() },
    toggleDebugWheel() { this.showDebugWheel = !this.showDebugWheel },
    doLogout() {
      try { logout() } catch (e) {}
      // 退出后回到登录页
      uni.reLaunch({ url: '/pages/auth/login' })
    },
    wheelAction(action) {
      switch(action) {
        case 'up': this.swimmingGame.nudge(0, -3); break;
        case 'down': this.swimmingGame.nudge(0, 3); break;
        case 'left': this.swimmingGame.nudge(-3, 0); break;
        case 'right': this.swimmingGame.nudge(3, 0); break;
        case 'obstacle': this.swimmingGame.spawnObstacle(); break;
        case 'coin': this.swimmingGame.spawnCoin(); break;
        case 'speed+': this.swimmingGame.boostSpeed(0.5); break;
        case 'speed-': this.swimmingGame.player.speed = Math.max(0, this.swimmingGame.player.speed - 0.5); break;
        case 'stroke': this.swimmingGame.simulateStroke(1.2); break;
        case 'pause': this.pauseGame(); break;
        case 'resume': this.resumeGame(); break;
        case 'end': this.endGame(); break;
      }
    },
    startStick(e) {
      const point = this._extractPoint(e)
      this.stickActive = true
      if (!this._joystickRect) {
        this._measureJoystick(() => { this.updateStick(point) })
      } else {
        this.updateStick(point)
      }
      // 绑定已绑定到组件实例的监听器，避免 this 丢失
      if (!this._stickMoveHandler) this._stickMoveHandler = (ev)=>this.onStickMove(ev)
      if (!this._stickEndHandler) this._stickEndHandler = ()=>this.endStick()
      const host = this._getEventHost()
      if (host) {
        host.addEventListener('touchmove', this._stickMoveHandler, { passive:false })
        host.addEventListener('mousemove', this._stickMoveHandler)
        host.addEventListener('touchend', this._stickEndHandler)
        host.addEventListener('mouseup', this._stickEndHandler)
      }
    },
    onStickMove(e) {
      if(!this.stickActive) return
      const point = this._extractPoint(e)
      this.updateStick(point)
      if(e.cancelable) e.preventDefault()
    },
    endStick() {
      this.stickActive = false
      this.stickX = 0
      this.stickY = 0
      if (this.swimmingGame) this.swimmingGame.setDirection(0,0)
      const host = this._getEventHost()
      if (host) {
        if (this._stickMoveHandler) {
          host.removeEventListener('touchmove', this._stickMoveHandler)
          host.removeEventListener('mousemove', this._stickMoveHandler)
        }
        if (this._stickEndHandler) {
          host.removeEventListener('touchend', this._stickEndHandler)
          host.removeEventListener('mouseup', this._stickEndHandler)
        }
      }
    },
    updateStick(point) {
      // 优先使用已测量的矩形；若缺失则尝试测量后再计算
      let rect = this._joystickRect
      if(!rect) { this._measureJoystick(() => this.updateStick(point)); return }
      const cx = rect.left + rect.width/2
      const cy = rect.top + rect.height/2
      const dx = point.x - cx
      const dy = point.y - cy
      const maxR = rect.width/2 - 20
      const dist = Math.sqrt(dx*dx + dy*dy)
      const clamped = Math.min(dist, maxR)
      const ratio = clamped / maxR
      const nx = ((dx/dist) * ratio) || 0
      const ny = ((dy/dist) * ratio) || 0
      this.stickX = nx
      this.stickY = ny
      if (this.swimmingGame) this.swimmingGame.setDirection(nx, ny)
    },
    startWheelDrag(e) {
      // 支持 touch 与 mouse
      const point = this._extractPoint(e);
      // 如果在摇杆区域按下，则不启动轮盘拖拽，避免与摇杆冲突
      const target = e.target || (e.touches && e.touches[0] && e.touches[0].target)
      if (this.stickActive || (target && target.closest && target.closest('.joystick'))) {
        return
      }
      this.wheelDragging = true;
      this.wheelDragOffset.x = point.x - this.wheelPos.x;
      this.wheelDragOffset.y = point.y - this.wheelPos.y;
      // 绑定移动和结束监听
      const host = this._getEventHost()
      if (host) {
        host.addEventListener('touchmove', this.onWheelDrag, { passive:false });
        host.addEventListener('mousemove', this.onWheelDrag);
        host.addEventListener('touchend', this.endWheelDrag);
        host.addEventListener('mouseup', this.endWheelDrag);
      }
    },
    onWheelDrag(e) {
      if(!this.wheelDragging) return;
      const point = this._extractPoint(e);
      const nx = point.x - this.wheelDragOffset.x;
      const ny = point.y - this.wheelDragOffset.y;
      // 边界限制（视口内）
      const { width: vw, height: vh } = this._getViewportSize();
      this.wheelPos.x = Math.max(20, Math.min(vw - 260, nx));
      this.wheelPos.y = Math.max(80, Math.min(vh - 260, ny));
      if(e.cancelable) e.preventDefault();
    },
    endWheelDrag() {
      this.wheelDragging = false;
      const host = this._getEventHost()
      if (host) {
        host.removeEventListener('touchmove', this.onWheelDrag);
        host.removeEventListener('mousemove', this.onWheelDrag);
        host.removeEventListener('touchend', this.endWheelDrag);
        host.removeEventListener('mouseup', this.endWheelDrag);
      }
    },
    handleMotion(data) {
      // 使用 orientation.gamma (左右) 与 orientation.beta (前后/上下) 转换为 tilt
      const ori = data.orientation || {}
      // gamma: -90(左)~90(右)  -> 归一化 -1..1
      const tiltX = (ori.gamma || 0) / 90
      // beta: -180~180，通常设备竖直放置时 0，前后倾斜控制上下，限制范围 -90..90
      const cappedBeta = Math.max(-90, Math.min(90, ori.beta || 0))
      const tiltY = cappedBeta / 90
      this.swimmingGame.setTilt(tiltX, tiltY)
    },
    tickSync() {
      const raf = (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function')
        ? window.requestAnimationFrame.bind(window)
        : (cb) => setTimeout(() => cb((typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now())), 16)
      const sync = (ts) => {
        if (this.gameState === 'playing') {
          if (!this._lastSync || ts - this._lastSync >= this._syncInterval) {
            const data = this.swimmingGame.getGameData()
            // 维护最高速度
            if (data.speed > data.maxSpeed) data.maxSpeed = data.speed
            this.gameData = data
            this._lastSync = ts
          }
          raf(sync)
        }
      }
      raf(sync)
    },
    objectStyle(obj) {
      return { left: obj.x + '%', top: obj.y + '%', width: obj.size+'px', height: obj.size+'px' }
    },
    particleStyle(p) {
      return { left: p.x + '%', top: p.y + '%', opacity: (p.life/1000).toFixed(2) }
    },
    cleanup() {
      if (this.sensorManager) this.sensorManager.stopListening()
      if (this.swimmingGame) this.swimmingGame.stopGameLoop()
    }
  }
}
</script>

<style scoped>
.swimming-game-container { position:relative; min-height:100vh; background:linear-gradient(180deg,#87CEEB 0%,#4682B4 100%); color:#fff; font-size:26rpx; overflow:hidden }
/* 水波背景层（轻微动画） */
.swimming-game-container::before, .swimming-game-container::after { content:""; position:absolute; left:-20%; right:-20%; bottom:-30%; height:60%; background:radial-gradient(ellipse at 50% 0%, rgba(255,255,255,.18), rgba(255,255,255,0) 60%); filter:blur(10px); animation:waveMove 8s ease-in-out infinite alternate; pointer-events:none }
.swimming-game-container::after { bottom:-35%; animation-duration: 11s; opacity:.7 }
@keyframes waveMove { 0%{ transform:translateY(0) skewX(-6deg) } 100%{ transform:translateY(20px) skewX(6deg) } }
.panel { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:40rpx; gap:30rpx; min-height:100vh; box-sizing:border-box }
.title { font-size:48rpx; font-weight:700 }
.subtitle { font-size:28rpx; color:#E0F6FF }
.tips text { display:block; font-size:24rpx; color:#E0F6FF; margin-bottom:8rpx }
.btn { background:rgba(255,255,255,0.25); color:#fff; border:none; padding:20rpx 40rpx; border-radius:40rpx; font-size:30rpx }
.btn.primary { background:linear-gradient(45deg,#FF6B6B,#4ECDC4) }
.btn:disabled { opacity:.5 }
.hud { position:fixed; top:140rpx; left:0; right:0; display:flex; justify-content:space-around; padding:16rpx 0; background:rgba(0,0,0,0.25); backdrop-filter:blur(6px); z-index:1200 }
.life-badge { position:fixed; top:80rpx; left:16rpx; font-size:40rpx; text-shadow:0 6rpx 12rpx rgba(0,0,0,.35); z-index:1200 }
.float-btn { position:fixed; right:24rpx; bottom:120rpx; width:80rpx; height:80rpx; background:rgba(0,0,0,.4); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:40rpx; color:#fff; backdrop-filter:blur(4px) }
.overlay { position:fixed; inset:0; background:rgba(0,0,0,.55); display:flex; align-items:center; justify-content:center; z-index:10 }
.overlay-box { background:#1e2f46; padding:50rpx 40rpx; border-radius:32rpx; width:80%; max-width:600rpx; box-shadow:0 12rpx 30rpx rgba(0,0,0,.4); display:flex; flex-direction:column; gap:30rpx; }
.ov-title { font-size:40rpx; font-weight:600; color:#fff }
.ov-msg { font-size:26rpx; color:#cfd8dc; line-height:1.6 }
.hud-item { text-align:center }
.label { display:block; font-size:20rpx; opacity:.8 }
.val { display:block; font-size:26rpx; font-weight:600 }
 .game-area { position:relative; width:100%; height:calc(100vh - 140rpx); }
.player { position:absolute; font-size:50rpx; transform:translate(-50%,-50%); }
.player.swimming { animation:swim .4s ease-in-out 2 }
.obj { position:absolute; transform:translate(-50%,-50%); font-size:32rpx }
.obstacle { font-size:36rpx }
.coin { animation:spin 1.2s linear infinite }
.particle { font-size:24rpx; pointer-events:none }
.bottom-toolbar { position:fixed; left:16rpx; right:16rpx; bottom:24rpx; display:flex; gap:18rpx; justify-content:center; z-index:1400 }
.tb-btn { width:90rpx; height:90rpx; border:none; border-radius:24rpx; background:rgba(0,0,0,.4); color:#fff; font-size:40rpx; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(6px) }
.tb-btn.danger{ background:linear-gradient(180deg, rgba(255,99,71,.9), rgba(199,58,38,.9)) }
.debug-toggle { position:fixed; left:24rpx; bottom:120rpx; width:90rpx; height:90rpx; background:rgba(0,0,0,.45); border-radius:50%; display:flex; align-items:center; justify-content:center; color:#fff; font-size:34rpx; z-index:20 }
.debug-wheel { position:fixed; width:240rpx; height:240rpx; border-radius:50%; background:rgba(0,0,0,.55); backdrop-filter:blur(6px); display:flex; flex-wrap:wrap; padding:20rpx; z-index:30; box-shadow:0 8rpx 18rpx rgba(0,0,0,.4); touch-action:none }
.debug-wheel.dragging { box-shadow:0 12rpx 28rpx rgba(0,0,0,.6); }
.joystick { position:relative; width:120rpx; height:120rpx; margin:0 auto 14rpx; border:2rpx solid rgba(255,255,255,.35); border-radius:50%; box-sizing:border-box; }
.stick { position:absolute; left:50%; top:50%; width:44rpx; height:44rpx; background:rgba(255,255,255,.4); border-radius:50%; transform:translate(-50%,-50%); backdrop-filter:blur(4px); transition:transform .05s linear; }
.dbg-row { display:flex; width:100%; justify-content:space-between; gap:8rpx; }
.dbg-small { flex:1; background:rgba(255,255,255,.18); color:#fff; border:none; padding:10rpx 0; border-radius:18rpx; font-size:20rpx }
.dbg-small:active { background:rgba(255,255,255,.35) }
.ended .summary text { display:block; margin-bottom:10rpx }
@keyframes spin { 0%{transform:translate(-50%,-50%) rotateY(0)}100%{transform:translate(-50%,-50%) rotateY(360deg)} }
@keyframes swim { 0%{transform:translate(-50%,-50%) scale(1)}50%{transform:translate(-50%,-50%) scale(1.2)}100%{transform:translate(-50%,-50%) scale(1)} }
</style>
