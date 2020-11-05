import Vue from "vue";
import Vuex from "vuex";
import { getChatListData, getUsersData } from "@/api/chat.js";
import { getStorage, setStorage } from "@/libs/utils.js";
import { Toast} from "vant";
Vue.use(Vuex).use(Toast);

export default new Vuex.Store({
  state: {
    messageList: [],
    userInfo:  {},
    username:  null,
    code: null,
    uid:  null,
    gid:  null,
    userIp: null,
    setPlaying:false, // 新消息声音提示 
    timeOut:null,
    kefu_code:'',
    tit:'你有新的消息',
    num:0
  },
  mutations: {
    setPlaying(state, bool){
      state.isPlaying = bool
    },
    setMessageList(state, list) {
      state.messageList = [
        {
          serviceId: true,
          group_name: "官方客服",
          create_time: "",
          seller_code: "",
        },
        ...list
      ];
    },
    addMessageList(state, data) {
      state.messageList.push(data);
    },
    setUserInfo(state, data) {
      state.userInfo = data;
    },
    setUsername(state, data) {
      state.username = data;
    },
    setCode(state, data) {
      state.code = data;
    },
    setUid(state, data) {
      state.uid = data;
    },
    setGroupId(state, data) {
      state.gid = data;
    },
    setUserIp(state, data) {
      state.userIp = data;
    },
    setKefu_code(state, data){
      state.kefu_code = data;
    },
    titleScrolling (state){
      let title= state.tit  // JSON.parse(JSON.stringify(state.tit))
      state.timeOut= setInterval(() => { //ES6箭头函数
         // 截取首字符串(第一个)
           var head = title.substring(0,1);
           // 截取除首字符串外所有字符串(除第一个所有)
           var foot = title.substring(1);
           // 头尾拼接后赋给data => tit属性
           title = foot + head;
           // 最后赋给最终显示的标题(标题)
           document.title = title;
       },400)
    },
    closeTitleScrolling(state,tit=''){
      clearInterval(state.timeOut)
      document.title =tit //'妮姬客服';
    },
    setTitle(state,num){
      state.tit = `你有${num}条新消息`
    },
    setNum(state,num){
      state.num = num
    }
  },
  actions: {
    // 获取 聊天列表
    getChatList({ state, commit }, data) {
      return new Promise((resolve, reject) => {
        getChatListData(data)
          .then(result => {
            commit("setMessageList", result.data.group);
            resolve(result.data.group);
          })
          .catch(err => {
            reject(err);
          });
      });
    },
    // 获取用户信息
    getUsersData({ state, commit }, data) {
      return new Promise(async (resolve, reject) => {
        await getUsersData(data)
          .then(result => {
            commit("setUserInfo", result.data);
            setStorage("userInfo", result.data);
            resolve(result.data);
          })
          .catch(err => {
            reject(err);
          });
      });
    },
    playPromptVuex({ state, commit }) {
      let lastRunTime = Date.now();
      let audio = document.querySelector("#audio");
      if (!state.isPlaying) {
        audio.play()
        commit('setPlaying',true )
      }
      let timeOut = setTimeout(() => {
        let currentTime = Date.now();
        if (currentTime - lastRunTime > 1000) {
          if (state.isPlaying) {
            audio.currentTime = 0;
            audio.pause();
            commit('setPlaying',false )
          }
        }
        clearTimeout(timeOut);
      }, 1000);
    },
  },
  modules: {}
});
