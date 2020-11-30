import Vue from 'vue'
import enterPopup from './enterPopup.vue'

let enterPopupConstructor = Vue.extend(enterPopup)

let enterPopupComponent = function () {
  return new Promise((res, rej) => {
    let enterPopupDom = new enterPopupConstructor({
      el: document.createElement('div'),
      data () {
        return {}
      }
    })
    //在body中动态创建一个div元素，后面自动会把它替换成整个vue文件内的内容
    document.body.appendChild(enterPopupDom.$el)
    enterPopupDom.onSubmit = () => {
      enterPopupDom.isShow = false
      res(enterPopupDom.password)
    }
  })
}
function register () {
  Vue.prototype.$enterPopup = enterPopupComponent
}
export default register