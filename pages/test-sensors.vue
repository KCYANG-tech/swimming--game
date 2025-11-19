<template>
  <view class="sensor-page">
    <view class="topbar">
      <text class="title">传感器测试</text>
      <view class="badges">
        <text class="badge" :class="{ok:support.isSupported, warn:!support.isSupported}">{{ support.isSupported ? '已支持' : '不支持' }}</text>
        <text class="badge" :class="{ok:permGranted===true, warn:permGranted===false}">{{ permText }}</text>
        <text class="badge" :class="{ok:listening, warn:!listening}">{{ listening ? '监听中' : '未监听' }}</text>
      </view>
    </view>

    <view class="controls">
      <button class="btn primary" :disabled="initializing" @click="requestPermission">授权</button>
      <button class="btn" :disabled="!permGranted || initializing || listening" @click="start">开始</button>
      <button class="btn" :disabled="!listening" @click="stop">停止</button>
      <button class="btn" @click="resetCalib">校准零点</button>
      <button class="btn" @click="clearLogs">清除日志</button>
      <button class="btn" @click="copyLogs">复制日志</button>
    </view>

    <view class="section">
      <text class="sec-title">参数</text>
      <view class="kv">
        <text class="k">滤波α(0-1)</text>
        <input class="v-input" type="number" step="0.05" v-model.number="alpha" />
      </view>
      <view class="kv">
        <text class="k">采样窗口</text>
        <picker :range="[50,100,200,500]" @change="onWindowChange">
          <view class="v">{{ windowSize }} 条</view>
        </picker>
      </view>
    </view>

    <view class="grid">
      <view class="card">
        <text class="card-title">加速度 (m/s²)</text>
        <view class="rows">
          <view class="row" v-for="key in ['x','y','z']" :key="'acc-'+key">
            <text class="label">{{ key.toUpperCase() }}</text>
            <text class="val">{{ fmt(accFilt[key]) }}</text>
            <view class="bar"><view class="fill" :style="barStyle(accFilt[key], 30)"></view></view>
          </view>
          <view class="row">
            <text class="label">|a|</text>
            <text class="val">{{ fmt(accMag) }}</text>
          </view>
        </view>
      </view>

      <view class="card">
        <text class="card-title">旋转速率 (°/s)</text>
        <view class="rows">
          <view class="row" v-for="key in ['alpha','beta','gamma']" :key="'rot-'+key">
            <text class="label">{{ key }}</text>
            <text class="val">{{ fmt(rotFilt[key]) }}</text>
            <view class="bar"><view class="fill" :style="barStyle(rotFilt[key], 300)"></view></view>
          </view>
          <view class="row">
            <text class="label">|ω|</text>
            <text class="val">{{ fmt(rotMag) }}</text>
          </view>
        </view>
      </view>

      <view class="card">
        <text class="card-title">方向角 (°) - 零点校准</text>
        <view class="rows">
          <view class="row" v-for="key in ['alpha','beta','gamma']" :key="'ori-'+key">
            <text class="label">{{ key }}</text>
            <text class="val">{{ fmt(oriRel[key]) }}</text>
            <view class="bar"><view class="fill" :style="barStyle(oriRel[key], key==='alpha'?180:90)"></view></view>
          </view>
        </view>
      </view>
    </view>

    <view class="section">
      <text class="sec-title">统计</text>
      <view class="stats">
        <text>事件数：{{ samples }}</text>
        <text>采样率：{{ eps.toFixed(1) }} evt/s</text>
        <text>间隔均值：{{ Math.round(avgInterval) }} ms</text>
        <text>监听错误：{{ lastError || '无' }}</text>
      </view>
    </view>

    <view class="tiltbox-wrap">
      <text class="sec-title">倾斜可视化</text>
      <view class="tiltbox">
        <view class="cube" :style="cubeStyle"></view>
      </view>
    </view>
  </view>
  
</template>

<script>
import SensorManager from '@/common/sensorManager.js'
import SensorUtils from '@/common/sensorUtils.js'

export default {
  name: 'TestSensorsPage',
  data(){
    return {
      sm: null,
      initializing: false,
      listening: false,
      permGranted: null,
      support: { isSupported:false, needsPermission:false, apis:{} },
      alpha: 0.8,
      windowSize: 100,
      // 原始与滤波数据
      accRaw: {x:0,y:0,z:0},
      rotRaw: {alpha:0,beta:0,gamma:0},
      oriRaw: {alpha:0,beta:0,gamma:0},
      accFilt: {x:0,y:0,z:0},
      rotFilt: {alpha:0,beta:0,gamma:0},
      oriZero: {alpha:0,beta:0,gamma:0},
      oriRel: {alpha:0,beta:0,gamma:0},
      // 统计
      samples: 0,
      lastTick: 0,
      avgInterval: 0,
      eps: 0,
      lastError: '' ,
      // 日志
      logs: []
    }
  },
  computed:{
    permText(){
      if (this.permGranted===true) return '已授权'
      if (this.permGranted===false) return '未授权'
      return this.support.needsPermission ? '需授权' : '无需授权'
    },
    accMag(){
      return Math.sqrt(this.accFilt.x**2 + this.accFilt.y**2 + this.accFilt.z**2)
    },
    rotMag(){
      return Math.sqrt(this.rotFilt.alpha**2 + this.rotFilt.beta**2 + this.rotFilt.gamma**2)
    },
    cubeStyle(){
      const rX = this.oriRel.beta
      const rY = this.oriRel.gamma
      const rZ = this.oriRel.alpha
      return { transform: `rotateX(${rX}deg) rotateY(${rY}deg) rotateZ(${rZ}deg)` }
    }
  },
  mounted(){
    // 平台支持检查
    try {
      const info = SensorUtils.checkPlatformSupport()
      this.support = info
    } catch(e){}
    this.sm = new SensorManager()
    this.sm.onMotion(this.onMotion)
    this.sm.onOrientation(this.onOrientation)
    this.sm.onError(err=>{ this.lastError = err && err.message ? err.message : String(err) })
  },
  methods:{
    async requestPermission(){
      this.initializing = true
      try{
        await this.sm.initialize()
        this.permGranted = true
        uni.showToast({ title:'已授权', icon:'success' })
      }catch(e){
        this.permGranted = false
        uni.showModal({ title:'授权失败', content: e.message||'无法获取权限' })
      } finally{
        this.initializing = false
      }
    },
    start(){
      try{ this.sm.startListening(); this.listening = true; this.resetStats() }catch(e){ this.lastError=e.message }
    },
    stop(){ this.sm.stopListening(); this.listening = false },
    resetCalib(){ this.oriZero = { ...this.oriRaw } },
    onWindowChange(e){ const opts = [50,100,200,500]; this.windowSize = opts[e.detail.value] || 100 },
    fmt(v){ return (Number(v)||0).toFixed(2) },
    barStyle(v, vmax=100){ const w = Math.min(100, Math.abs(v)/vmax*100); return { width: w+'%' } },
    resetStats(){ this.samples=0; this.avgInterval=0; this.eps=0; this.lastTick=0; this.logs=[] },
    onMotion(data){
      const now = performance.now?performance.now():Date.now()
      // 原始
      const a = data.acceleration||{x:0,y:0,z:0}
      const r = data.rotationRate||{alpha:0,beta:0,gamma:0}
      this.accRaw = a; this.rotRaw = r
      // 滤波
      const t = this.alpha
      this.accFilt = {
        x: this.accFilt.x*t + a.x*(1-t),
        y: this.accFilt.y*t + a.y*(1-t),
        z: this.accFilt.z*t + a.z*(1-t)
      }
      this.rotFilt = {
        alpha: this.rotFilt.alpha*t + r.alpha*(1-t),
        beta: this.rotFilt.beta*t + r.beta*(1-t),
        gamma: this.rotFilt.gamma*t + r.gamma*(1-t)
      }
      // 统计
      if (this.lastTick){
        const dt = now - this.lastTick
        this.avgInterval = this.avgInterval===0 ? dt : (this.avgInterval*0.9 + dt*0.1)
        this.eps = this.avgInterval>0 ? 1000/this.avgInterval : 0
      }
      this.lastTick = now; this.samples++
      // 日志（限长）
      this.logs.push({t:now,a:this.accRaw,r:this.rotRaw,o:this.oriRaw})
      if (this.logs.length>this.windowSize) this.logs.shift()
    },
    onOrientation(data){
      const o = data.orientation||{alpha:0,beta:0,gamma:0}
      this.oriRaw = o
      // 相对零点
      this.oriRel = {
        alpha: this.wrapDeg(o.alpha - this.oriZero.alpha, 180),
        beta:  this.clamp(o.beta - this.oriZero.beta, -180, 180),
        gamma: this.clamp(o.gamma - this.oriZero.gamma, -90, 90)
      }
    },
    wrapDeg(v, range=180){
      // 把 -∞..∞ 映射到 [-range, range]
      let x = v
      while (x> range) x -= 2*range
      while (x<-range) x += 2*range
      return x
    },
    clamp(v,min,max){ return Math.max(min, Math.min(max, v)) },
    clearLogs(){ this.logs=[]; uni.showToast({title:'已清除', icon:'none'}) },
    copyLogs(){
      try{
        const text = JSON.stringify(this.logs)
        uni.setClipboardData({ data:text, success:()=>uni.showToast({title:'已复制', icon:'success'}) })
      }catch(e){ uni.showToast({ title:'复制失败', icon:'none' }) }
    }
  }
}
</script>

<style scoped>
.sensor-page{ min-height:100vh; padding:24rpx; box-sizing:border-box; background:linear-gradient(180deg,#eef6fb,#d9e7f1); color:#263238 }
.topbar{ display:flex; align-items:center; justify-content:space-between; margin-bottom:16rpx }
.title{ font-size:40rpx; font-weight:700 }
.badges{ display:flex; gap:10rpx }
.badge{ font-size:22rpx; padding:6rpx 12rpx; border-radius:14rpx; background:#eceff1; color:#455a64 }
.badge.ok{ background:#e3f2fd; color:#1976d2 }
.badge.warn{ background:#ffebee; color:#c62828 }
.controls{ display:flex; flex-wrap:wrap; gap:12rpx; margin-bottom:16rpx }
.btn{ background:#90a4ae; color:#fff; border:none; border-radius:14rpx; padding:14rpx 18rpx; font-size:26rpx }
.btn.primary{ background:#4fc3f7 }
.section{ background:#fff; border-radius:18rpx; padding:16rpx; margin-bottom:16rpx; box-shadow:0 6rpx 18rpx rgba(0,0,0,.05) }
.sec-title{ font-size:28rpx; font-weight:600; display:block; margin-bottom:12rpx }
.kv{ display:flex; align-items:center; justify-content:space-between; padding:8rpx 0 }
.k{ color:#607d8b }
.v, .v-input{ color:#37474f; font-size:26rpx }
.v-input{ border:1rpx solid #cfd8dc; border-radius:10rpx; padding:6rpx 12rpx; min-width:140rpx }
.grid{ display:grid; grid-template-columns:1fr; gap:12rpx }
@media (min-width:700px){ .grid{ grid-template-columns:1fr 1fr } }
.card{ background:#fff; border-radius:18rpx; padding:14rpx 16rpx; box-shadow:0 6rpx 18rpx rgba(0,0,0,.05) }
.card-title{ font-size:26rpx; color:#455a64; margin-bottom:10rpx; display:block }
.rows{ display:flex; flex-direction:column; gap:8rpx }
.row{ display:flex; align-items:center; gap:10rpx }
.label{ width:80rpx; color:#607d8b }
.val{ width:140rpx; font-family:mono; color:#263238 }
.bar{ flex:1; background:#eceff1; height:12rpx; border-radius:8rpx; overflow:hidden }
.fill{ height:100%; background:linear-gradient(90deg,#4fc3f7,#1976d2) }
.stats text{ display:block; margin-bottom:6rpx }
.tiltbox-wrap{ background:#fff; border-radius:18rpx; padding:16rpx; box-shadow:0 6rpx 18rpx rgba(0,0,0,.05) }
.tiltbox{ height:200rpx; display:flex; align-items:center; justify-content:center; perspective:800px; background:#fafafa; border-radius:12rpx }
.cube{ width:80rpx; height:80rpx; background:linear-gradient(45deg,#4fc3f7,#81c784); border-radius:10rpx; transition:transform .08s linear }
</style>
