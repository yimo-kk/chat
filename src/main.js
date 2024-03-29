import 'babel-polyfill';
import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
// scoketio
import SocketIO from "socket.io-client";
import VueSocketIO from "vue-socket.io";
import dayjs from "dayjs";
// 公共样式
import "@/assets/css/common.css";
import "./assets/iconfont/iconfont.css";
import "vant/lib/index.css";
import i18n from './i18n';
// 表情
import './assets/emjoy/emjoymethod.js'
import './assets/face/faceToHtml.js'
import './assets/emjoy/emjoy.css'
// 移动端调试
// import Vconsole from "vconsole";
// let vConsole = new Vconsole();
// 自定义组件
// import enterPopup from '@/components/popup/index.js'
// Vue.use(enterPopup) 
// vant
import {
  Field,
  Uploader,
  Icon,
  Toast,
  Dialog,
  ImagePreview,
  Sticky,
  PullRefresh,
  Rate,
  Button,
  NoticeBar,
  Form,
  Empty,
  CellGroup,
  Overlay,
  Loading,
  Collapse,
  CollapseItem
} from "vant";
Vue.use(Field)
  .use(Collapse)
  .use(CollapseItem)
  .use(Uploader)
  .use(Icon)
  .use(Toast)
  .use(Dialog)
  .use(ImagePreview)
  .use(PullRefresh)
  .use(Rate)
  .use(Button)
  .use(NoticeBar)
  .use(Loading)
  .use(Form)
  .use(Empty)
  .use(Overlay)
  .use(CellGroup)
  .use(Sticky);
// 全局过滤器
import filters from "./libs/filters.js";
//过滤器统一处理加载
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key]);
});
Vue.config.productionTip = false;
Vue.prototype.$toast = Toast;
Vue.prototype.$dialog = Dialog;
Vue.prototype.$SocketIO = SocketIO;
Vue.prototype.$dayjs = dayjs; //可以全局使用dayjs
Vue.use(
  new VueSocketIO({
    debug: true,
    connection: SocketIO.connect(`wss://${process.env.VUE_APP_BASE_URL_CONTENT}`,
      {
        transports: ['websocket', 'xhr-polling', 'jsonp-polling'],
      }
    ),
    vuex: {
      store,
      mutationPrefix: "SOCKET_",
      actionPrefix: "SOCKET_",
    },
  })
);
new Vue({
  router,
  i18n,
  store,
  render: h => h(App)
}).$mount("#app");



// if(location.href.split('?')[0].split('/')[location.href.split('?')[0].split('/').length-1] == 'message'){}else {
  // let u = getQueryString('u')
  // let code = getQueryString('code')
  // try {
  //   userDecode({u,code})
  //   .then((result) => {
  //     if(!result.data.data){
  //       Dialog.alert({
  //         message: '商家不存在或参数错误！',
  //         showConfirmButton:false,
  //         showCancelButton:false
  //       })
  //       return
  //     }
  //     let data = segmentation(result.data.data)
  //     let obj={}
  //     if(getStorage(code)){
  //       obj =JSON.parse(getStorage(code))
  //       if(!obj[data.username]){
  //         obj[data.username] = ''
  //       }
  //       setStorage(code, JSON.stringify(obj));
  //     }else {
  //       obj[data.username]=''
  //       setStorage(code, obj);
  //     }
  //     store.commit("setUsername", data.username);
  //     store.commit("setCode", code);
  //     data.group_id && 
  //     store.commit("setGroupId", data.group_id);
  //     let socket = {
  //       path: data.group_id ? `/socket.io/?username=${data.username}&code=${code}&group_id=${data.group_id}&`:`/socket.io/?username=${data.username}&code=${code}&`,
  //       transports: ['websocket', 'xhr-polling', 'jsonp-polling']
  //     }
  //     if (/Firefox\/\s/.test(navigator.userAgent)){ 
  //       socket.transports=['xhr-polling']
  //       } 
  //       else if (/MSIE (\d+.\d+);/.test(navigator.userAgent)){
  //         socket.transports=['jsonp-polling']
  //       }
  //     Vue.use(
  //       new VueSocketIO({
  //         debug: true,
  //         connection: SocketIO.connect(`wss://server.nikidigital.net`,socket ),
  //         store
  //       })
  //     );
  //     new Vue({
  //       router,
  //       i18n,
  //       store,
  //       render: h => h(App)
  //     }).$mount("#app");
  //   })
  // }catch{
  //   new Vue({
  //     router,
  //     i18n,
  //     store,
  //     render: h => h(App)
  //   }).$mount("#app");
  // }

