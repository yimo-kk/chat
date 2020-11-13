import Vue from "vue";
import VueRouter from "vue-router";


Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "ChatPage",
    component: () =>
        import(/* webpackChunkName: "serviceChat" */ "../views/chatPage/chatPage.vue")
  },
  // {
  //   path: "/chatList",
  //   name: "ChatList",
  //   component: () =>
  //     import(/* webpackChunkName: "chatList" */ "../views/chatList/chatList.vue")
  // },
  {
    path: "/groupChat",
    name: "GroupChat",
    component: () =>
      import(/* webpackChunkName: "groupChat" */ "../views/groupChat/groupChat.vue")
  },
  {
    path: "/privateChat",
    name: "PrivateChat",
    component: () =>
      import(/* webpackChunkName: "privateChat" */ "../views/privateChat/privateChat.vue")
  },
  {
    path: "/message",
    name: "Message",
    component: () =>
      import(/* webpackChunkName: "Message" */ "../views/message/index.vue")
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

export default router;
