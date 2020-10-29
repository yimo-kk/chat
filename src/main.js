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
// 移动端调试
import Vconsole from "vconsole";
let vConsole = new Vconsole();
import { userDecode } from "@/api/chat.js";
import { createUserName, setSession, getSession,getQueryString,segmentation } from "@/libs/utils";

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
  Loading 
} from "vant";
Vue.use(Field)
  .use(Uploader)
  .use(Icon)
  .use(Toast)
  .use(Dialog)
  .use(ImagePreview)
  .use(PullRefresh)
  .use(Rate)
  .use(Button)
  .use(NoticeBar)
  .use(Loading )
  .use(Sticky);
// 全局过滤器
import filters from "./libs/filters.js";
//过滤器统一处理加载
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key]);
});
Vue.config.productionTip = false;
Vue.prototype.$toast = Toast;
Vue.prototype.$SocketIO = SocketIO;
Vue.prototype.$dayjs = dayjs; //可以全局使用dayjs
let u = getQueryString('u')
let code = getQueryString('code')
try {
  userDecode({u,code})
  .then((result) => {
    let data = segmentation(result.data.data)
    setSession("username", data.username);
    store.commit("setUsername", data.username);
    store.commit("setCode", code); 
    data.group_id && 
    store.commit("setGroupId", data.group_id);
    Vue.use(
      new VueSocketIO({
        debug: true,
        connection: SocketIO.connect(`wss://server.nikidigital.net`, {
          path: data.group_id ? `/socket.io/?username=${data.username}&code=${data.code}&group_id=${data.group_id}&`:`/socket.io/?username=${data.username}&code=${data.code}&`,
          transports: ['websocket', 'xhr-polling', 'jsonp-polling']
        }),
        store
      })
    );
    new Vue({
      router,
      store,
      render: h => h(App)
    }).$mount("#app");
  })
} catch (error) {
  new Vue({
    router,
    store,
    render: h => h(App)
  }).$mount("#app");
}

 
