import Vue from 'vue'
import VueConfetti from 'vue-confetti'
import App from './App'

Vue.config.productionTip = false
Vue.use(VueConfetti)

App.mpType = 'app'

const app = new Vue({
    ...App
})
app.$mount()
