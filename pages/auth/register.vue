<template>
  <view class="auth-page">
    <view class="card">
      <text class="title">注册</text>
      <input class="ipt" v-model="name" placeholder="用户名" />
      <input class="ipt" v-model="password" placeholder="密码" password />
      <button class="btn primary" :disabled="loading" @click="doRegister">{{ loading ? '注册中...' : '注册' }}</button>
      <button class="btn" @click="goLogin">返回登录</button>
      <text v-if="error" class="err">{{ error }}</text>
      <text v-if="ok" class="ok">注册成功，已自动保存到本地（演示模式）</text>
    </view>
  </view>
</template>

<script>
import { register } from '@/common/api/auth.js'
export default {
  data(){
    return { name:'', password:'', loading:false, error:'', ok:false }
  },
  methods:{
    async doRegister(){
      this.error=''; this.ok=false
      if(!this.name || !this.password){ this.error='请输入用户名和密码'; return }
      this.loading = true
      try{
        await register(this.name, this.password)
        this.ok = true
        // 注册后返回登录
        setTimeout(()=> uni.redirectTo({ url:'/pages/auth/login' }), 800)
      }catch(e){
        this.error = e.message || '注册失败'
      }finally{
        this.loading = false
      }
    },
    goLogin(){ uni.navigateTo({ url:'/pages/auth/login' }) }
  }
}
</script>

<style scoped>
.auth-page{min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(180deg,#87CEEB,#4682B4)}
.card{width:80%;max-width:520rpx;background:rgba(0,0,0,.35);padding:40rpx;border-radius:24rpx;color:#fff;display:flex;flex-direction:column;gap:20rpx}
.title{font-size:38rpx;font-weight:600;margin-bottom:10rpx}
.ipt{background:rgba(255,255,255,.15);border:none;border-radius:16rpx;padding:20rpx;color:#fff}
.btn{background:rgba(255,255,255,.2);color:#fff;border:none;border-radius:20rpx;padding:18rpx}
.btn.primary{background:linear-gradient(45deg,#4ECDC4,#556270)}
.err{color:#ffd2d2}
.ok{color:#d2ffd8}
</style>
