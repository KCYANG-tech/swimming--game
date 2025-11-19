// uni-app内置了vuex

// 导出一个简单的 Vuex 模块描述（注意：如果你想使用 Vuex 实例，可在 main.js 中按需包装）
export default {
  state: {
    // 游戏相关状态
    gameState: {
      isPlaying: false,
      score: 0,
      level: 1
    },
    // 传感器相关状态
    sensorState: {
      isEnabled: false,
      acceleration: {
        x: 0,
        y: 0,
        z: 0
      }
    }
  },
  mutations: {
    // 更新游戏状态
    UPDATE_GAME_STATE(state, payload) {
      state.gameState = { ...state.gameState, ...payload }
    },
    // 更新传感器状态
    UPDATE_SENSOR_STATE(state, payload) {
      state.sensorState = { ...state.sensorState, ...payload }
    }
  },
  actions: {
    // 开始游戏
    startGame({ commit }) {
      commit('UPDATE_GAME_STATE', { isPlaying: true, score: 0 })
    },
    // 结束游戏
    endGame({ commit }) {
      commit('UPDATE_GAME_STATE', { isPlaying: false })
    },
    // 更新分数
    updateScore({ commit }, score) {
      commit('UPDATE_GAME_STATE', { score })
    },
    // 更新加速度数据
    updateAcceleration({ commit }, acceleration) {
      commit('UPDATE_SENSOR_STATE', { acceleration })
    }
  },
  getters: {
    isGamePlaying: state => state.gameState.isPlaying,
    currentScore: state => state.gameState.score,
    currentLevel: state => state.gameState.level,
    accelerationData: state => state.sensorState.acceleration
  }
};