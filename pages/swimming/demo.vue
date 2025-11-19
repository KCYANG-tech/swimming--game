<template>
  <view class="wrapper">
    <text class="title">游泳游戏演示页</text>
    <view class="buttons">
      <view class="btn primary" @click="goIndex">进入正式游戏</view>
      <view class="btn" @click="goSensors">传感器测试</view>
    </view>
    <text class="info">平台：{{ platform }} | 加载：{{ loaded ? '已完成' : '未完成' }}</text>
  </view>
</template>

<script>
export default {
  name: 'SwimmingDemoPage',
  data() {
    return { loaded: false, platform: '' }
  },
  onLoad() {
    this.loaded = true;
    let info = {};
    try { info = uni.getSystemInfoSync() } catch(e) {}
    this.platform = info.platform || 'unknown';
  },
  methods: {
    goIndex() { uni.navigateTo({ url: '/pages/swimming/index' }) },
    goSensors() { uni.navigateTo({ url: '/pages/test-sensors' }) }
  }
}
</script>

<style scoped>
.wrapper { padding:40rpx; }
.title { font-size:48rpx; font-weight:600; margin-bottom:30rpx; display:block; }
.buttons { display:flex; gap:30rpx; margin-bottom:40rpx; }
.btn { padding:20rpx 30rpx; background:#eee; border-radius:12rpx; font-size:30rpx; }
.btn.primary { background:#007AFF; color:#fff; }
.info { font-size:26rpx; color:#666; margin-top:10rpx; display:block; }
</style>
