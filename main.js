import App from './App'
import store from '@/store/index.js'

// #ifndef VUE3
import Vue from 'vue'
Vue.config.productionTip = false
Vue.prototype.$store = store
Vue.prototype.$adpid = "1111111111"
Vue.prototype.$backgroundAudioData = {
	playing: false,
	playTime: 0,
	formatedPlayTime: '00:00:00'
}
App.mpType = 'app'
const app = new Vue({
	...App
})
app.$mount()
// #endif

// #ifdef VUE3
import {
	createSSRApp
} from 'vue'
import * as Pinia from 'pinia';
import Vuex from "vuex";
export function createApp() {
	const app = createSSRApp(App)
	app.use(Pinia.createPinia());
	// store 只是一个普通对象（模块描述），不是 Vue 插件或 Vuex/Pinia 实例，不能使用 app.use
	// 为保持与 Vue2 分支一致，这里直接挂载到 globalProperties，避免 "A plugin must either be a function or an object with an install function" 警告
	app.config.globalProperties.$store = store
	app.config.globalProperties.$adpid = "1111111111"
	app.config.globalProperties.$backgroundAudioData = {
		playing: false,
		playTime: 0,
		formatedPlayTime: '00:00:00'
	}
	return {
		app,
		Vuex, // 如果 nvue 使用 vuex 的各种map工具方法时，必须 return Vuex
		Pinia // 此处必须将 Pinia 返回
	}
}
// #endif
