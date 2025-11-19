<![CDATA[<template>
  <view class="error-page">
    <view class="error-content">
      <text class="error-code">404</text>
      <text class="error-text">页面不存在</text>
      <button class="back-button" @click="goBack">返回首页</button>
    </view>
  </view>
</template>

<script>
export default {
  name: 'Error404',
  methods: {
    goBack() {
      uni.reLaunch({
        url: '/pages/swimming/demo'
      })
    }
  }
}
</script>

<style lang="scss">
.error-page {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f8f8;

  .error-content {
    text-align: center;
    padding: 40rpx;

    .error-code {
      font-size: 120rpx;
      color: #007AFF;
      font-weight: bold;
      display: block;
      margin-bottom: 20rpx;
    }

    .error-text {
      font-size: 32rpx;
      color: #666;
      display: block;
      margin-bottom: 60rpx;
    }

    .back-button {
      background-color: #007AFF;
      color: #fff;
      border: none;
      padding: 20rpx 60rpx;
      border-radius: 8rpx;
      font-size: 28rpx;

      &:active {
        opacity: 0.8;
      }
    }
  }
}
</style>]]>