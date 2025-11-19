<template>
  <view class="my-page">
    <view class="header">
      <text class="title">我的</text>
      <text class="subtitle">账户与数据</text>
    </view>
    <view class="card" v-if="user">
      <text class="row"><text class="label">用户名：</text>{{ user.name }}</text>
      <text class="row" v-if="session"><text class="label">登录有效期：</text>{{ expiresDisplay }}</text>
      <text class="row" v-if="session"><text class="label">令牌：</text>{{ session.token }}</text>
    </view>
    <view class="card" v-else>
      <text>未登录，请前往登录页。</text>
      <button class="btn" @click="goLogin">去登录</button>
    </view>
    <view class="section">
      <text class="sec-title">游戏概要（示例）</text>
      <view class="stats">
        <text>最近分数：{{ recentScore }}</text>
        <text>最佳分数：{{ bestScore }}</text>
        <text>累计对局：{{ totalGames }}</text>
        <text>累计金币：{{ totalCoins }}</text>
        <text>最长一局：{{ longestGameDisplay }}</text>
      </view>
    </view>
    <view class="footer" v-if="user">
      <button class="btn danger" @click="doLogout">退出登录</button>
    </view>
  </view>
</template>

<script>
import { getSession, getCurrentUser, logout } from '@/common/api/auth.js'
export default {
  data(){
    return {
      session: null,
      user: null,
      bestScore: 0,
      recentScore: 0,
      totalGames: 0,
      totalCoins: 0,
      longestGameMs: 0
    }
  },
  computed:{
    expiresDisplay(){
      if(!this.session) return ''
      const d = new Date(this.session.expiresAt)
      const pad = n => String(n).padStart(2,'0')
      return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
    },
    longestGameDisplay(){
      const ms = Number(this.longestGameMs||0)
      if (!ms || isNaN(ms)) return '0:00'
      const totalSec = Math.round(ms/1000)
      const m = Math.floor(totalSec/60)
      const s = String(totalSec%60).padStart(2,'0')
      return `${m}:${s}`
    }
  },
  mounted(){
    this.session = getSession()
    this.user = getCurrentUser()
    // 示例：可从 localStorage/后端获取真实数据
    try {
      const best = uni.getStorageSync('bestScore')
      if (typeof best === 'number') this.bestScore = best
      const recent = uni.getStorageSync('recentScore')
      if (typeof recent === 'number') this.recentScore = recent
      const tGames = uni.getStorageSync('totalGames')
      if (typeof tGames === 'number') this.totalGames = tGames
      const tCoins = uni.getStorageSync('totalCoins')
      if (typeof tCoins === 'number') this.totalCoins = tCoins
      const lg = uni.getStorageSync('longestGameMs')
      if (typeof lg === 'number') this.longestGameMs = lg
    } catch(e){}
  },
  methods:{
    goLogin(){ uni.reLaunch({ url:'/pages/auth/login' }) },
    doLogout(){ logout(); uni.reLaunch({ url:'/pages/auth/login' }) }
  }
}
</script>

<style scoped>
.my-page{min-height:100vh;display:flex;flex-direction:column;background:linear-gradient(180deg,#eef2f7,#d9e7f1);padding:32rpx;box-sizing:border-box;font-size:26rpx;color:#2c3e50}
.header{margin-bottom:20rpx}
.title{font-size:42rpx;font-weight:600}
.subtitle{display:block;font-size:24rpx;color:#607d8b;margin-top:6rpx}
.card{background:#fff;border-radius:20rpx;padding:28rpx;box-shadow:0 6rpx 20rpx rgba(0,0,0,.06);display:flex;flex-direction:column;gap:16rpx;margin-bottom:30rpx}
.row{font-size:26rpx;word-break:break-all}
.label{color:#607d8b}
.section{background:#fff;border-radius:20rpx;padding:24rpx;box-shadow:0 6rpx 20rpx rgba(0,0,0,.05);margin-bottom:30rpx}
.sec-title{font-size:30rpx;font-weight:600;margin-bottom:16rpx;display:block}
.stats text{display:block;margin-bottom:10rpx}
.footer{margin-top:auto;padding:10rpx 0}
.btn{background:linear-gradient(45deg,#4ECDC4,#556270);color:#fff;border:none;border-radius:18rpx;padding:20rpx;font-size:28rpx}
.btn.danger{background:linear-gradient(45deg,#ff6b6b,#c44536)}
</style>
