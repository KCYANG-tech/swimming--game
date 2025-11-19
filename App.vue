<script>
export default {
	onLaunch() {
		console.log('游泳游戏启动')
	},
	onShow() {
		console.log('游泳游戏显示')
	},
	onHide() {
		console.log('游泳游戏隐藏')
	},
	globalData: {
		gameVersion: '1.0.0'
	}
}
</script>

<style>
/* 每个页面公共css */
@import '@/common/uni.css';

/* 基础样式 */
page {
	background-color: #ffffff;
	min-height: 100vh;
	font-size: 28rpx;
	color: #333333;
}

/* uni-app兼容性样式 */
uni-page-body,
uni-page-head,
uni-page-wrapper {
	display: block;
	width: 100%;
	min-height: 100vh;
}
</style>
