<template>
  <view class="swimming-game-container">
    <text>SwimmingGameUI (临时简化版本)</text>
  </view>
</template>

<script>
export default {
  name: 'SwimmingGameUIClean',
  methods: {
    startGame() { this.$emit('gameStart') },
    restartGame() { this.$emit('gameEnd', { score: 0, distance: 0, strokeCount: 0 }) }
  }
}
</script>

<style scoped>
.swimming-game-container { min-height:100vh; display:flex; align-items:center; justify-content:center; background:#E8F4FF; padding:40rpx }
</style>
