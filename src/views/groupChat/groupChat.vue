<template>
  <div class="chat">
    <div v-show = loading class='loading_box'>
      <van-loading size="45" class='loading' color='#02c0fe' />
    </div>
    <div class="chat_serve w" @click="allClick">
      <div class="chat_box">
        <!-- 消息展示  11111 -->
        <ChatInfo
          :chatUser="chatTitle"
          :messages="messages"
          :Pcrecord="Pcrecord"
          :isPrompt="false"
          :isPerson="true"
          :name="true"
          :groupNum="groupMember.num"
          :announcement="announcement"
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
              <!-- 暂时不展示群发文件 -->
              <!-- <van-uploader :after-read="uploadeFile" accept="application/*">
                <van-icon
                  class="iconfont font_size"
                  size="30px"
                  class-prefix="icon"
                  name="wenjian1"
                ></van-icon>
              </van-uploader>-->
              <van-uploader
                :after-read="uploadeImg"
                accept="image/png, image/gif, image/jpg, image/webp, image/jpeg"
              >
                <van-icon
                  class="iconfont font_size"
                  size="30px"
                  class-prefix="icon"
                  name="tupian"
                ></van-icon>
              </van-uploader>
              <!-- 群聊暂时不展示语音功能 -->
              <!-- <van-icon
                class="iconfont font_size"
                size="30px"
                class-prefix="icon"
                name="yuyin"
                @click="record"
              ></van-icon>-->
            </div>
            <div
              class="record flex_center"
              @touchstart="startRecord"
              @touchmove="slideRecord"
              @touchend="endRecord"
              v-if="isAudio"
            >
              {{ btnText }}
            </div>
            <div class="send_text" v-else>
              <textarea
                v-model.trim="sendText"
                placeholder="请输入内容..."
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
                  :autosize="{ maxHeight: 25, minHeight: 20 }"
                  type="textarea"
                  placeholder="请输入内容..."
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
                  发送
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
                {{ item }}
              </li>
            </ul>
          </div>
        </div>
      </div>
      <pcChatList
        v-if="!isButtom"
        @activtTab="activtTab"
        :chatType="2"
        :groupMemberList="groupMember.data"
      ></pcChatList>
      <!-- 录音图像 -->
      <div class="record_mask" v-show="isMask">
        <div class="record_pic">
          <canvas id="canvas"></canvas>
          <p class="cancel">上滑 取消发送</p>
        </div>
      </div>
      <!-- 播放录音 -->
      <audio ref="audio" @ended="playEnd" style="display: none;"></audio>
    </div>
    <div v-if="isGroupUser.state" class="is_group_user">
      <p class="is_group_user_msg">{{ isGroupUser.message }}</p>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import pcChatList from "@/components/pcChatList/pcChatList.vue";
import ChatInfo from "@/components/chatPage/chatInfo.vue";
// import common from "@/mixins/common";
import {
  getGroupChatLog,
  sendGroupChatFile,
  getGroupList,
  getNews
} from "@/api/chat.js";
import {
  compressImage,
  isImage,
  conversion,
  conversionFace
} from "@/libs/utils.js";
const lamejs = require("lamejs");
const appData = require("@/assets/emojis.json");
// import Recorder from "js-audio-recorder";
// const recorder = new Recorder({
//   sampleBits: 8, // 采样位数，支持 8 或 16，默认是16
//   sampleRate: 11025, // 采样率，支持 11025、16000、22050、24000、44100、48000，根据浏览器默认值，我的chrome是48000
//   numChannels: 1 // 声道，支持 1 或 2， 默认是1e
// });
export default {
  name: "groupChat",
  // mixins: [common()],
  components: {
    pcChatList,
    ChatInfo
  },
  data() {
    return {
      loading:false,
      sendText: "",
      faceShow: false,
      messages: [],
      Pcrecord: false,
      sendType: null,
      isAudio: false,
      isMask: false, // 录音时的波浪
      faceList: [],
      drawRecordId: null,
      oCanvas: null,
      ctx: null,
      currentIndex: null, //当前播放的
      btnText: "按住 说话",
      posStart: 0, //初始化起点坐标
      posEnd: 0, //初始化终点坐标
      posMove: 0, //初始化滑动坐标
      chatTitle: "",
      groupMember: {},
      screenWidth: document.body.offsetWidth,
      isButtom: document.body.offsetWidth < 540,
      announcement: {},
      isGroupUser: {
        state: false,
        message: ""
      },
    };
  },
  computed: {
    ...mapState(["userInfo", "code", "gid", "username", "userIp"])
  },
  watch: {
    screenWidth(val) {
      val < 540 ? (this.isButtom = true) : (this.isButtom = false);
    }
  },
  sockets: {
    // connect:查看socket是否渲染成功
    connect() {},
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
      if (data.type === 3) {
        data.message.play = false;
      }
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
    }
  },
  methods: {
    enter(event) {
      if (event.keyCode === 13) {
        this.sendType = 0;
        event.preventDefault(); // 阻止浏览器默认换行操作
        this.send(this.sendText);
      }
    },
    textSend() {
      this.sendType = 0;
      this.send(this.sendText);
    },
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
    allClick() {
      this.faceShow = false;
    },
    // 上传文件
    uploadeFile(file) {
      this.sendType = 2;
      const formdata = new FormData();
      formdata.append("filedata", file.file);
      formdata.append("filename", file.file.name);
      formdata.append("group_id", this.gid);
      formdata.append("from_id", this.userInfo.data.uid);
      sendGroupChatFile(formdata)
        .then(result => {
          if (result.data.code === 0) {
            this.send(result.data.data);
          } else {
            this.$toast(esult.data.msg);
          }
        })
        .catch(err => {
          console.log(err);
          this.$toast(err.msg);
        });
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
            console.log(error);
          }
        );
      }
    },
    /**
     * 群聊暂时不展示语音
     */
    // 点击录音图标
    record() {
      this.sendType = 3;
      Recorder.getPermission()
        .then(
          () => {
            if (this.isButtom) {
              this.isAudio = !this.isAudio;
            } else {
              this.Pcrecord = !this.Pcrecord;
              this.startRecorder();
            }
          },
          error => {
            this.$toast("暂不录音！");
          }
        )
        .catch(err => {
          console.log(err);
          this.$toast(err.msg);
        });
      // if (!this.isButtom) {
      //   this.isAudio = !this.isAudio;
      // } else {
      //   this.Pcrecord = !this.Pcrecord;
      //   this.startRecorder();
      // }
    },
    // 录音
    startRecord(event) {
      event.preventDefault(); //阻止浏览器默认行为
      this.posStart = 0;
      this.posStart = event.touches[0].pageY; //获取起点坐标
      this.btnText = "松开 结束";
      this.isMask = true;
      this.startRecorder();
    },
    // 上滑取消
    slideRecord(event) {
      event.preventDefault(); //阻止浏览器默认行为
      this.posMove = 0;
      this.posMove = event.targetTouches[0].pageY; //获取滑动实时坐标
      if (this.posStart - this.posMove < 100) {
        this.btnText = "松开 结束";
      } else {
        this.btnText = "松开手指，取消发送";
      }
    },
    // 结束录音
    endRecord(event) {
      event.preventDefault();
      this.posEnd = 0;
      this.posEnd = event.changedTouches[0].pageY; //获取终点坐标
      this.btnText = "按住 说话";
      if (this.posStart - this.posEnd < 100) {
        this.stopRecorder();
      } else {
        recorder.stop();
      }
      this.isMask = false;
    },
    // 开始录音
    startRecorder() {
      recorder
        .start()
        .then(
          () => {
            this.drawRecord(); //开始绘制图片
          },
          error => {
            // 出错了
            this.isMask = false;
            this.$toast("当前环境不支持语音");
          }
        )
        .catch(err => {
          console.log(err);
          this.$toast(err.msg);
        });
    },
    // 结束录音
    stopRecorder() {
      this.Pcrecord = false;
      recorder.stop();
      this.drawRecordId && cancelAnimationFrame(this.drawRecordId);
      this.drawRecordId = null;
      if (recorder.duration < 1) {
        this.$toast("说话时间太短了");
        return;
      }
      let dataMp3 = recorder.getWAVBlob();
      var fileName = new Date().valueOf() + "." + "wav";
      const formdata = new FormData();
      formdata.append("name", fileName);
      formdata.append("file", dataMp3);
      uploadVoice({
        params: formdata,
        seller_code: this.userInfo.seller.seller_code
      })
        .then(result => {
          let data = result.data.data;
          data.duration = Math.round(recorder.duration);
          this.send(data);
        })
        .catch(err => {
          this.$toast("发送失败");
        });
    },
    playEnd() {
      this.messages.forEach(item => {
        if (item.type == 3) {
          item.message ? (item.message.play = false) : (item.play = false);
        }
      });
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
    // 判断本地是否有用户信息
    getUserInfo() {
      if (
        Object.keys(this.userInfo) <= 0 ||
        this.$route.query.username !== this.username
      ) {
        this.loading = true
        this.$store
          .dispatch("getUsersData", {
            code: this.$route.query.code,
            login_ip: this.userIp.ip,
            area: this.userIp.adress,
            username: this.$route.query.username
              ? this.$route.query.username
              : this.username,
            is_tourist: this.$route.query.username ? 2 : 0
          })
          .then(() => {
            this.$socket.emit("group", {
              username: this.username,
              group_id: this.gid
            });
            this.getGroupChatLog();
          })
          .catch(err => {
              this.loading = false
            this.$toast(err.msg);
          });
      } else {
        this.$socket.emit("group", {
          username: this.username,
          group_id: this.gid
        });
        this.getGroupChatLog();
      }
    },
    faceContent() {
      this.faceShow = !this.faceShow;
      if (this.faceShow == true) {
        for (let i in appData) {
          this.faceList.push(appData[i].char);
        }
      } else {
        this.faceList = [];
      }
    },
    // 获取用户点击之后的表情标签 ，存放到输入框内
    getBrow(index) {
      for (let i in this.faceList) {
        if (index == i) {
          this.getBrowString = this.faceList[index];
          this.sendText += this.getBrowString;
        }
      }
    },
    // pc端右边tab点击
    activtTab() {},
    // 获取群成员
    getGroupList(group_id) {
      getGroupList({ group_id })
        .then(result => {
          this.groupMember = result.data;
        })
        .catch(err => {
          this.$toast("请求超时！");
        });
    },

    getNewsData(seller_code) {
      getNews({ seller_code })
        .then(result => {
          if (result.data.code === 0) {
            if(!Array.isArray(result.data.data)){
              this.announcement = result.data.data;
            }
            
          }
        })
        .catch(err => {
          this.$toast("请求超时！");
        });
    }
  },
  created() {
    this.gid != this.$route.query.group_id &&
      this.$store.commit("setGroupId", this.$route.query.group_id);
    this.code != this.$route.query.code &&
      this.$store.commit("setCode", this.$route.query.code);
  },
  mounted() {
    this.$socket.emit("connect");
    let that = this;
    window.addEventListener("resize", function() {
      that.screenWidth = document.body.offsetWidth;
    });
    this.getUserInfo();
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