<![CDATA[<template>
  <view class="left-window">
    <view class="menu-list">
      <view class="menu-item" v-for="(item, index) in menuList" :key="index" @click="handleMenuClick(item)">
        <text class="menu-text">{{ item.text }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'LeftWindow',
  data() {
    return {
      menuList: [
        { text: '游戏说明', path: '/pages/swimming/demo' },
        { text: '开始游戏', path: '/pages/swimming/index' },
        { text: '传感器测试', path: '/pages/test-sensors' }
      ]
    }
  },
  methods: {
    handleMenuClick(item) {
      uni.navigateTo({
        url: item.path
      })
    }
  }
}
</script>

<style lang="scss">
.left-window {
  width: 100%;
  height: 100%;
  background-color: #F8F8F8;
  padding: 20rpx;
  
  .menu-list {
    .menu-item {
      padding: 20rpx;
      margin-bottom: 10rpx;
      background-color: #FFFFFF;
      border-radius: 8rpx;
      
      &:hover {
        background-color: #F1F1F1;
      }
      
      .menu-text {
        font-size: 28rpx;
        color: #333;
      }
    }
  }
}
</style>]]>