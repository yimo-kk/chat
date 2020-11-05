<template>
  <div class="chat">
    <div v-show = loading class='loading_box'>
      <van-loading size="45" class='loading' color='#02c0fe' />
    </div>
    <div class="chat_serve w" >
      <div class="chat_box">
        <!-- 消息展示-->
        <ChatInfo
          :chatUser="chatTitle"
          :messages="messages"
          :Pcrecord="Pcrecord"
          :isPrompt="false"
          :isPerson="true"
          :name="true"
          @stopRecorder="pcStopService"
          :groupNum="groupMember.num" 
          :announcement="announcement"
          @playRecord="playRecord"
        ></ChatInfo>
        <!-- 聊天输入框 -->
        <div class="input_tab">
          <div class="input_box">
            <div class="handle_other">
              <van-icon
                class="iconfont faceShow font_size"
                size="28px"
                class-prefix="icon"
                slot="right-icon"
                name="buoumaotubiao49"
                @click.stop="faceContent"
              ></van-icon>
              <van-uploader :after-read="uploadeFile" accept="*" v-if="on_file">
                <van-icon
                  class="iconfont font_size"
                  size="1.8rem"
                  class-prefix="icon"
                  name="wenjian1"
                ></van-icon>
              </van-uploader>
              <van-uploader
                :after-read="uploadeImg"
                accept="image/png, image/gif, image/jpg, image/webp, image/jpeg"
              >
                <van-icon
                  class="iconfont font_size"
                  size="1.8rem"
                  class-prefix="icon"
                  name="tupian"
                ></van-icon>
              </van-uploader>
              <!-- 由商家控制 -->
              <van-icon v-if="isIE && on_voice "
                class="iconfont font_size"
                size="1.8rem"
                class-prefix="icon"
                name="yuyin"
                @click="recordService"
              ></van-icon>
            </div>
            <div
              class="record flex_center"
              @touchstart="startRecordServic"
              @touchend="endRecordService" 
              v-if="isAudio"
            >
              {{ btnText }}
            </div>
            <div class="send_text" v-else>
              <textarea
                v-model.trim="sendText"
                :placeholder="$t('sendMsg')"
                rows="5"
                cols="100"
                class="textarea"
                @keydown="enter"
              />
              <div class="input_content">
                <van-field
                  size="large"
                  @focus="
                    () => {
                      faceShow = false;
                    }
                  "
                  @keydown="enter"
                  v-model.trim="sendText"
                  rows="1"
                  :autosize="{ maxHeight: 48, minHeight: 24 }"
                  type="textarea"
                  :placeholder="$t('sendMsg')"
                >
                  <van-icon
                    class="iconfont"
                    size="20px"
                    class-prefix="icon"
                    slot="right-icon"
                    name="buoumaotubiao49"
                    @click.stop="faceContent"
                  ></van-icon>
                </van-field>
              </div>
            </div>
            <!-- 按钮 -->
            <div class="buttom">
              <transition name="van-slide-right">
                <p
                  v-show="sendText.length || !isButtom"
                  :class="['btn', 'send_btn']"
                  @click="textSend"
                >
                  {{$t('send')}}
                </p>
              </transition>
            </div>
          </div>
          <!-- 表情区域 -->
          <div class="browBox" v-if="faceShow">
            <ul>
              <li
                v-for="(item, index) in faceList"
                :key="index"
                @click.stop="getBrow(index)"
              >
                {{ item.char }}
              </li>
            </ul>
          </div>
        </div>
      </div>
      <pcChatList
        v-if="!isButtom"
        :chatType="2"
        :groupMemberList="groupMember.data"
      ></pcChatList>
      <!-- 录音图像 -->
      <div class="record_mask" v-show="isMask">
        <div class="record_pic">
          <canvas id="canvas"></canvas>
          <p class="cancel">  {{$t('clsSend')}}</p>
        </div>
      </div>
      <!-- 播放录音 -->
      <audio ref="audio" @ended="playEnd" style="display: none;"></audio>
    </div>
      <!-- code 不存在 -->
    <div v-if="isGroupUser.state" class="is_group_user">
      <p class="is_group_user_msg">{{ isGroupUser.message ||isGroupUser.msg}}</p>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import pcChatList from "@/components/pcChatList/pcChatList.vue";
import ChatInfo from "@/components/chatPage/chatInfo.vue";
import common from "@/mixins/common";
import {
  getGroupChatLog,
  sendGroupChatFile,
  getGroupList,
  uploadVoice
} from "@/api/chat.js";
import {
  compressImage,
  isImage,
  conversion,
  conversionFace,
  createUserName,
  getStorage,
  setStorage,
  isIE
} from "@/libs/utils.js";
export default {
  name: "groupChat",
  mixins: [common()],
  components: {
    pcChatList,
    ChatInfo
  },
  data() {
    return {
      loading:false,
      messages: [],
      Pcrecord: false,
      sendType: null,
      isMask: false, // 录音时的波浪
      chatTitle: "",
      groupMember: {},
      isGroupUser: {
        state: false,
        message: ""
      },
      on_file: 0, //上传文件和语音功能是否开启 0否1是  
      on_voice: 0,
      socket:''
    };
  },
  computed: {
    isIE(){
       return !isIE()
     }
  },
  sockets: {
    // connect:查看socket是否渲染成功
    connect() {
    },
    reconnect(data) {
      console.log('重连')
      this.$socket.emit("group", {
            username: this.username,
            group_id: this.gid,
            seller_code:this.code || this.userInfo.seller.seller_code
      });
    },
    // 收到群消息
    groupMsg(data) {
      if(this.username !== data.from_name) {
       let num = this.$store.state.num
      this.$store.commit('setNum',++num)
      this.$store.commit('setTitle',num)
      this.$store.commit('closeTitleScrolling')
      this.$store.dispatch('playPromptVuex')
      this.$store.commit('titleScrolling')
      };
      data.type === 3&&(data.message.play = false)
      data.type === 0 &&
        (data.message = conversionFace(data.content || data.message));
      this.messages.push(data);
    },
    // 拉黑全局
    groupBlack(data) {
      data.kefu_name = "kefu";
      this.messages.push(data);
    },
    // 拉黑个人
    userBlack(data) {
      if (data.from_name == this.$store.state.userInfo.data.username) {
        data.kefu_name = "kefu";
        this.messages.push(data);
      }
    },
    removeblack(data) {
      if (data.username == this.$store.state.userInfo.data.username) {
        data.kefu_name = "kefu";
        this.messages.push(data);
      }
    },
    // 禁言全局
    groupForbid(data) {
      data.kefu_name = "kefu";
      this.messages.push(data);
    },
    //禁言个人
    userForbid(data) {
      if (data.from_name == this.$store.state.userInfo.data.username) {
        data.kefu_name = "kefu";
        this.messages.push(data);
      }
    },
    //解禁个人
    removeforbid(data) {
      data.kefu_name = "kefu";
      this.messages.push(data);
    },
    // 加入聊天室
    userJoin(data){
      this.groupAddOrLeave(data,'add')
    },
    // 离开聊天室
    userLeave(data){
        this.groupAddOrLeave(data,'leave')
    }
  },
  methods: {
    // 发送消息
    send(data) {
      if (!this.sendText.length && this.sendType === 0) return;
      let my_send = {
        cmd: "user-group",
        message: data,
        from_id: this.userInfo.data.uid,
        from_name: this.username,
        from_avatar: this.userInfo.data.headimg,
        group_id: this.gid,
        seller_code: this.userInfo.seller.seller_code,
        state: 0,
        type: this.sendType,
        from_ip: this.userIp.ip
      };
      let sendMessage = JSON.parse(JSON.stringify(my_send));
      this.sendType === 0 &&
        (sendMessage.message = conversion(my_send.message));
      this.$socket.emit("message", sendMessage);
      this.sendText = "";
      this.faceShow = false;
    },
    // 获取图片
    uploadeImg(file) {
      this.sendType = 1;
      if (!isImage(file.file.type)) {
        this.$toast({
          message: "请正确选择图片！",
          position: "top"
        });
      } else {
        compressImage(
          file.file,
          imgData => {
            this.send(imgData);
          },
          error => {
            // 压缩出错
            this.$toast('发送失败！')
          }
        );
      }
    },
    // 获取群聊记录
    getGroupChatLog() {
      getGroupChatLog({
        group_id: this.gid,
        seller_code: this.userInfo.seller.seller_code,
        uid: this.userInfo.data.uid
      })
        .then(result => {
          this.loading = false
          this.on_file = result.data.on_file
          this.on_voice = result.data.on_voice
          if (result.data.code == 1 || result.data.code == -1 ) {
            this.isGroupUser.state = true
            this.isGroupUser.message = result.data.msg
            return;
          } else {
            this.getNewsData(this.userInfo.seller.seller_code);
            this.getGroupList(this.$route.query.group_id);
            this.chatTitle = result.data.group_name;
            this.messages = result.data.data.map(item => {
              item.type == 3 && (item.play = false);
              if (item.type == 0) {
                item.content
                  ? (item.content = conversionFace(item.content))
                  : (item.message = conversionFace(item.message));
              }
              return item;
            });
          }
        })
        .catch(err => {
          this.loading = false
          this.$toast(err.msg);
        });
    },
    // 获取群成员
    getGroupList(group_id) {
      getGroupList({ group_id }) 
        .then(result => {
          result.data.data = Object.values( result.data.data)
          this.groupMember = result.data
        })
        .catch(err => {
          this.$toast(this.$t('timeOut'));
        });
    },
    groupAddOrLeave(data,opt){
      if(Object.keys(this.groupMember).length && data.group_id == this.gid){
       if( opt=== 'add' ){
          this.groupMember.num += 1
          this.groupMember.data.push(data.username)
       }else if(opt=== 'leave' ){
         this.groupMember.num -= 1
         var index = this.groupMember.data.indexOf(data.username); 
          if (index > -1) { 
          this.groupMember.data.splice(index, 1); 
          } 
       }
           
      }
    },
    pcStopService(){
      this.stopRecorder(this.uploadeVoice)
    },
    recordService(){
      this.record(this.uploadeVoice)
    },
    startRecordServic(e){
      this.startRecord(e,this.uploadeVoice)
    },
    endRecordService(e){
      this.endRecord(e,this.uploadeVoice)
    },
    uploadeVoice(formdata){
      uploadVoice({
          params: formdata,
          seller_code: this.userInfo.seller.seller_code
        })
        .then(result => {
          this.loading=false
          let data = result.data.data;
          data.duration = Math.round(this.recorder.duration);
          this.send(data);
        })
        .catch(err => {
          this.loading=false
        });
    },
  },
  created() {
    // let userName = "";
    // if (this.$route.query.username) {
    //   userName = this.$route.query.username;
    // } else if (getStorage("username")) {
    //   userName = getStorage("username");
    // } else {
    //   userName = createUserName();
    // }
    // this.$store.commit("setUsername", userName);

  },
  mounted() {
    this.getUserInfo(()=>{
      this.$socket.emit("group", {
        username: this.username,
        group_id: this.gid,
        seller_code:this.userInfo.seller.seller_code
      });
      this.getGroupChatLog();
    });
   
  }
};
</script>
<style lang='less' scoped>
.chat {
  height: 100%;
}
.is_group_user {
  position: fixed;
  background: rgba(0, 0, 0, 0.6);
  top: 0;
  left: 0;
  z-index: 5555;
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  .is_group_user_msg {
    background-color: #fff;
    width: 180px;
    height: 55px;
    border-radius: 10px;
    text-align: center;
    line-height: 55px;
  }
}
</style>