import Vue from 'vue'
import Vuex from 'vuex'
import state from './state'
import mutations from './mutations'
import actions from './actions'
import getters from './getters'
import createLogger from 'vuex/dist/logger'

Vue.use(Vuex) // 注册插件

const debug = process.env.NODE_ENV !== 'production' 

export default new Vuex.Store({
  state,
  mutations,
  // modules,
  actions,
  getters,
  strict: debug,  // 开发时，开启严格模式
  plugins: debug? [createLogger()]: []
})
