<template>
  <view class="auth-page">
    <view class="card">
      <text class="title">登录</text>
      <input class="ipt" v-model="name" placeholder="用户名" />
      <input class="ipt" v-model="password" placeholder="密码" password />
      <button class="btn primary" :disabled="loading" @click="doLogin">{{ loading ? '登录中...' : '登录' }}</button>
      <button class="btn" @click="goRegister">去注册</button>
      <text v-if="error" class="err">{{ error }}</text>
    </view>
  </view>
</template>

<script>
import { login, getCurrentUser } from '@/common/api/auth.js'
export default {
  data(){
    return { name:'', password:'', loading:false, error:'' }
  },
  mounted(){
    const user = getCurrentUser()
    if(user){
      // 已登录直接进主页
      uni.switchTab({ url:'/pages/swimming/index' })
    }
  },
  methods:{
    async doLogin(){
      this.error = ''
      if(!this.name || !this.password){ this.error='请输入用户名和密码'; return }
      this.loading = true
      try{
        await login(this.name, this.password)
        // 登录后进主页
        uni.switchTab({ url:'/pages/swimming/index' })
      }catch(e){
        this.error = e.message || '登录失败'
      }finally{
        this.loading = false
      }
    },
    goRegister(){
      uni.navigateTo({ url:'/pages/auth/register' })
    }
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
</style>
