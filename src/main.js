import 'babel-polyfill';
import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
// scoketio
import SocketIO from "socket.io-client";
import VueSocketIO from "vue-socket.io";
import { createUserName, setSession, getSession } from "@/libs/utils";
let path = "";
router.beforeEach((to, from, next) => {
  let userName = "";
  if (to.query.username) {
    userName = to.query.username;
  } else if (getSession("username")) {
    userName = getSession("username");
  } else {
    userName = createUserName();
  }
  setSession("username", userName);
  store.commit("setUsername", userName);
  // 群聊地址
  if (to.query.group_id) {
    path = `/socket.io/?username=${userName}&code=${to.query.code}&group_id=${to.query.group_id}&`;
  } else if (to.query.uid) {
    path = `/socket.io/?username=${
      // 私聊
      userName
    }&code=${to.query.code}&group_id=${to.query.uid}&`;
    setSession("username", userName);
    store.commit("setUsername", userName);
  } else if (!(to.query.uid || to.query.group_id)) {
    // 客服地址
    path = `/socket.io/?username=${userName}&`;
    setSession("username", userName);
    store.commit("setUsername", userName);
  }
  Vue.use(
    new VueSocketIO({
      debug: true,
      connection: SocketIO.connect(`wss://server.nikidigital.net`, {
        path: path,
        //  path: '/socket.io/?username=' + store.state.username
        transports: ["websocket"]
      }),
      store
    })
  );
  next();
});

import dayjs from "dayjs";
// 公共样式
import "@/assets/css/common.css";
import "./assets/iconfont/iconfont.css";
import "vant/lib/index.css";
// 移动端调试
// import Vconsole from "vconsole";
// let vConsole = new Vconsole();
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
Vue.prototype.$dayjs = dayjs; //可以全局使用dayjs
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
