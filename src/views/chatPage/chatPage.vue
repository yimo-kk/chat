<template>
  <div id="click_head_portrait" class="chat_serve w" >
    <div v-show = loading class='loading_box'>
      <van-loading size="45" class='loading' color='#02c0fe' />
    </div>
    <div class="chat_box">
      <!-- 消息展示 -->
      <ChatInfo
        :chatUser="chatUser"
        :messages="messages"
        :Pcrecord="Pcrecord"
        @playRecord="playRecord"
        @stopRecorder="stopRecorder"
        @submit="submit"
        @pcCancel="pcCancel"
        @getApicontent="getApicontent"
        :name="false"
        :isPrompt="isPrompt"
      ></ChatInfo>
      <!-- 聊天输入框 -->
      <div class="input_tab">
        <div class="input_box">
          <div class="handle_other">
            <van-icon
              class="iconfont faceShow font_size"
              size="1.6rem"
              class-prefix="icon"
              slot="right-icon"
              name="buoumaotubiao49"
              @click.stop="faceContent"
            ></van-icon>
            <van-uploader :after-read="uploadeFile" accept="application/*">
              <van-icon class="iconfont font_size" size="1.8rem" class-prefix="icon" name="wenjian1"></van-icon>
            </van-uploader>
            <van-uploader
              :after-read="uploadeImg"
              accept="image/png, image/gif, image/jpg, image/webp, image/jpeg"
            >
              <van-icon class="iconfont font_size" size="1.8rem" class-prefix="icon" name="tupian"></van-icon>
            </van-uploader>
            <van-icon v-if="isIE"
              class="iconfont font_size"
              size="1.8rem"
              class-prefix="icon"
              name="yuyin"
              @click="record"
            ></van-icon>
            <!-- <van-icon v-else
              class="iconfont font_size"
              size="1.8rem"
              class-prefix="icon"
              name="icon-jianpan"
              @click="record"
            ></van-icon> -->
            
          </div>
        
          <div
            class="record flex_center"
            @touchstart="startRecord"
            @touchend="endRecord" 
             @touchmove="slideRecord"
            v-if="isAudio"
          >{{btnText}}</div>
          <div class="send_text" v-else>
            <textarea
            ref="textarea"
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
                @focus="()=>{
                faceShow= false
              }"
                @keydown="enter"
                v-model.trim="sendText"
                rows="1"
                :autosize=" { maxHeight: 25, minHeight: 20 }"
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
                :class="['btn','send_btn']"
                @click="textSend"
              >发送</p>
            </transition>
          </div>
        </div>
        <!-- 表情区域 -->
        <div class="browBox" v-if="faceShow">
          <ul>
            <li
              v-for="(item,index) in faceList"
              :key="index"
              @click.stop="getBrow(index)"
            >{{item.char}}</li>
          </ul>
        </div>
      </div>
    </div>
    <PcChatList v-if="!isButtom" @activtTab="activtTab" :chatType="1" :questionList="questionList"></PcChatList>
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
</template>
<script>
import { mapState } from "vuex";
import {
  getServiceChatLog,
  serviceSendChatFile,
  uploadVoice,
  praise,
  getApiList,
  getApiById,
  getQuestionList
} from "@/api/chat.js";
import { ImagePreview } from "vant";
import PcChatList from "@/components/pcChatList/pcChatList.vue";
import ChatInfo from "@/components/chatPage/chatInfo.vue";
import common from "@/mixins/common";
import {
  compressImage,
  isImage,
  base64ToBlob,
  setSession,
  getSession,
  conversion,
  conversionFace,
  isIE
} from "@/libs/utils.js";
import Recorder from "js-audio-recorder";
let recorder
if(!isIE()){
    recorder = new Recorder({
    sampleBits: 8, // 采样位数，支持 8 或 16，默认是16
    sampleRate: 22050, // 采样率，支持 11025、16000、22050、24000、44100、48000，根据浏览器默认值，我的chrome是48000
    numChannels: 1 // 声道，支持 1 或 2， 默认是1e
  });
}
export default {
  name: "ChatPage",
  mixins: [common()],
  components: {
    PcChatList,
    ChatInfo
  },
  data() {
    return {
      loading:false,
      messages: [],
      activateId: 1,
      list: [],
      isAudio: false, // 录音时的波浪
      drawRecordId: null,
      oCanvas: null,
      ctx: null,
      isMask: false,
      currentIndex: null, //当前播放的
      sendType: 0,
      Pcrecord: false,
      posStart: 0, //初始化起点坐标
      posEnd: 0, //初始化终点坐标
      posMove: 0, //初始化滑动坐标
      btnText: "安住 说话",
      isLoading: false,
      chatUser: "官方客服",
      isPrompt: true,
      profilePhoto: 'https://service.nikidigital.net/static/common/images/kefu.png',
      questionList: [],
      outTime:false
    };
  },
  watch: {
    isButtom(newVal){
      !newVal &&  this.getQuestion(this.userInfo.seller.seller_code);
    }
  },
  sockets: {
    // connect:查看socket是否渲染成功
    connect() {},
    // disconnect:检测socket断开连接
    disconnect(data) {
      console.log('断开')
    },
    reconnect(data) {console.log('重连')},
    //有客服接待通知
    prompt(data) {
      data.kefu_name = "kefu";
      this.messages.push(data);
      setSession("kefu_code", data.kefu_code);
    },
    // 客服给用户发送消息
    serviceMsg(data) {
      let num = this.$store.state.num
      this.$store.commit('setNum',++num)
      this.$store.commit('setTitle',num)
      this.$store.commit('closeTitleScrolling')
      this.$store.dispatch('playPromptVuex')
      this.$store.commit('titleScrolling')
      data.type === 3 && (data.message.play = false);
      data.type === 0 &&
        (data.message = conversionFace(data.content || data.message));
      this.messages.push(data);
    },
    // 客服关闭会话,提示评分
    score(data) {
      data.endChat = true;
      data.isScore = false;
      data.scoreNum = 0; //评分
      data.scoreMessage = ""; //评分内容
      this.messages.push(data);
    }
  },
  computed: {
    ...mapState(["userInfo", "username", "code", "username",'userIp']),
     isIE(){
       return !isIE()
     }
  },
  methods: { 
    // 发送消息 
    send(data) { 
      if (!this.sendText.length && this.sendType === 0) return;
      let my_send = {
        cmd: "user-service",
        kefu_code: getSession("kefu_code"),
        from_avatar: this.userInfo.data.headimg,
        message: data,
        from_id: this.userInfo.data.uid ? this.userInfo.data.uid : "",
        from_name: this.userInfo.data.username,
        seller_code: this.userInfo.seller.seller_code,
        type: this.sendType,
      };
      let sendMessage = JSON.parse(JSON.stringify(my_send));
      this.sendType === 3 && (my_send.message.play = false);
      this.sendType === 0 &&
        (sendMessage.message = conversion(my_send.message));
      this.messages.push(my_send);
      this.$socket.emit("message", sendMessage);
      this.sendText = "";
      this.faceShow = false;
    },
    // 上传文件
    uploadeFile(file) {
      this.sendType = 2;
      this.loading = true
      const formdata = new FormData();
      formdata.append("filedata", file.file);
      formdata.append("filename", file.file.name);
      serviceSendChatFile(formdata)
        .then(result => {
          if(result.data.code == 0){
            this.send(result.data.data);
            this.loading = false
          }else {
            this.$toast(result.data.msg)
              this.loading=false
          }
        })
        .catch(err => {
          this.loading=false
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
    // 点击录音图标
    record() {
      this.sendType = 3;
      this.getPermission();
    },
    // 提前获取录音权限
    getPermission() {
      Recorder.getPermission().then(
        () => {
          if (this.isButtom) {
            this.isAudio = !this.isAudio;
          } else {
            this.Pcrecord = !this.Pcrecord;
            this.startRecorder();
          }
        },
        error => {
          this.$toast("暂无录音权限！请重新授权");
        }
      );
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
      if(this.outTime)return
      event.preventDefault();
      this.posEnd = 0;
      this.posEnd = event.changedTouches[0].pageY; //获取终点坐标
      this.btnText = "按住 说话";
      this.isMask = false;
      if (this.posStart - this.posEnd < 100) {
        this.stopRecorder()
      } else {
        recorder.stop();
      }
 
    },
    // 录音时的波浪
    startCanvas() {
      //录音波浪
      this.oCanvas = document.getElementById("canvas");
      this.oCanvas.style.width = 70+'vw'
      this.oCanvas.style.borderRadius = 6+'px'
      this.ctx = this.oCanvas.getContext("2d");
    },
    // 开始录音
    startRecorder() {
      let that = this
      recorder.start().then(
        () => {
          this.drawRecord(); //开始绘制图片
        },
        error => {
          // 出错了
          this.$toast("当前环境不支持语音");
          recorder.isServe = true;
          this.isMask = false;
          this.Pcrecord = false;
        }
      );
      recorder.onprogress = function(params) {
        if(params.duration>=5){
          that.stopRecorder()
          that.btnText = "按住 说话";
          that.isMask = false;
          that.outTime=true
        }
    } 
    },
    // 结束录音
    stopRecorder() {
      this.Pcrecord = false;
      if (recorder.isServe) return;
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
      this.loading=true
      this.outTime =false
      uploadVoice({
        params: formdata,
        seller_code: this.userInfo.seller.seller_code
      })
        .then(result => {
          this.loading=false
          let data = result.data.data;
          data.duration = Math.round(recorder.duration);
          this.send(data);
        })
        .catch(err => {
          this.loading=false
        });
    },
    /**
     * 绘制波浪图-录音
     * */
    drawRecord() {
      // 用requestAnimationFrame稳定60fps绘制
      this.drawRecordId = requestAnimationFrame(this.drawRecord);
      // 实时获取音频大小数据
      let dataArray = recorder.getRecordAnalyseData(),
        bufferLength = dataArray.length;
      // 填充背景色
      this.ctx.fillStyle = "#9eea6a";
      this.ctx.fillRect(0, 0, this.oCanvas.width, this.oCanvas.height);
      // 设定波形绘制颜色
      this.ctx.lineWidth = 2;
      this.ctx.strokeStyle = "rgb(0, 0, 0)";
      this.ctx.beginPath();
      var sliceWidth = (this.oCanvas.width * 1.0) / bufferLength, // 一个点占多少位置，共有bufferLength个点要绘制
        x = 0; // 绘制点的x轴位置
      for (var i = 0; i < bufferLength; i++) {
        var v = dataArray[i] / 128.0;
        var y = (v * this.oCanvas.height) / 2;
        if (i === 0) {
          // 第一个点
          this.ctx.moveTo(x, y);
        } else {
          // 剩余的点
          this.ctx.lineTo(x, y);
        }
        // 依次平移，绘制所有点
        x += sliceWidth;
      }

      this.ctx.lineTo(this.oCanvas.width, this.oCanvas.height / 2);
      this.ctx.stroke();
    },
    // 播放语音
    playRecord(stream, index,bool) {
      this.currentIndex = index;
       let audio =  this.$refs.audio
      if(bool){
        audio.src = '';
        this.messages.forEach((item) => {
          if (item.type == 3) {
            item.message ? (item.message.play = false) : (item.play = false);
          }
      })}else {
        this.recordOne(index);
        if (window.URL) {
          audio.src = stream;
        } else {
          audio.src = event;
        }
        audio.autoplay = true;    
      }
     
      // this.currentIndex = index;
      // this.recordOne(index);
      // let audio = this.$refs.audio;
      // if (window.URL) {
      //   audio.src = stream;
      // } else {
      //   audio.src = event;
      // }
      // audio.autoplay = true;
    },
    playEnd() {
      this.messages.forEach(item => {
        if (item.type == 3) {
          item.message ? (item.message.play = false) : (item.play = false);
        }
      });
    },
    // 只能播放一个其他全为flase
    recordOne(value) {
      this.messages.forEach((item, index) => {
        if (index === value && item.type == 3) {
          item.message ? (item.message.play = true) : (item.play = true);
        } else if (item.type == 3) {
          item.message ? (item.message.play = false) : (item.play = false);
        }
      });
    },
    // pc取消发送语音需要暂停处理
    pcCancel() {
      this.Pcrecord = false;
      recorder.stop();
    },
    // 获取和客服的聊天记录
    getServiceChatMessage() {
      getServiceChatLog({
        username: this.userInfo.data.username,
        seller_code: this.userInfo.seller.seller_code
      })
        .then(result => {
          this.loading = false
          this.messages = result.data.data.map(item => {
            item.type == 3 && (item.play = false);
            if (item.type == 0) {
              item.content
                ? (item.content = conversionFace(item.content))
                : (item.message = conversionFace(item.message));
            }
            return item;
          });
          this.getServiceSendData(this.$route.query.code || this.code);
        })
        .catch(err => {
           this.loading = false
           this.$toast(err.msg)
        });
    },
    // 发送接待
    reception() {
      let params = {
        customer_id: this.userInfo.data ? this.userInfo.data.uid : "",
        customer_ip: this.userInfo.data.ip,
        customer_name: this.username,
        seller_code: this.userInfo.seller.seller_code,
        customer_avatar: this.userInfo.data.headimg,
        is_tourist: this.userInfo.data.is_tourist,
         customer_area:this.userIp.adress,
      };
      this.$socket.emit("enter", params);
    },
    submit(index, val) {
      if (val) return;
      praise({
        uid: this.userInfo.data.uid,
        kefu_code: getSession("kefu_code"),
        code: this.userInfo.seller.seller_code,
        content: this.messages[index].scoreMessage,
        star: this.messages[index].scoreNum
      })
        .then(result => {
          this.messages[index].isScore = true;
          if (result.data.code === 0) {
            this.messages.push({
              kefu_name: "kefu",
              message: "感谢你的评价"
            });
          }
        })
        .catch(err => {
          console.log(err);
        });
    },
    // pc 右边切换tab
    activtTab(id) {},
    // 获取进入客服主动发送消息
    getServiceSendData() {
      getApiList({
        seller_code: this.code
      })
        .then(result => {
          if (result.data.code === 0) {
            result.data.data.length &&
              this.messages.push({
                isApi: true,
                apiList: result.data.data,
                from_name: "官方客服",
                from_avatar: this.profilePhoto
              });
          } else {
            this.$toast("请求超时");
          }
        })
        .catch(err => {
          this.$toast("请求超时");
        });
    },
    getApicontent(id) {
      getApiById({
        api_id: id
      })
        .then(result => {
          if (result.data.code === 0) {
            this.messages.push({
              isApi: true,
              content: result.data.data,
              from_name: "官方客服",
              from_avatar: this.profilePhoto
            });
          }
        })
        .catch(err => {
          this.$toast("请求超时");
        });
    },
    // 获取常见问题
    getQuestion(seller_code) {
      getQuestionList({ seller_code })
        .then(result => {
          if (result.data.code === 0) {
            this.questionList = result.data.data.map(item => {
              item.isShow = false;
              return item;
            });
          }
        })
        .catch(err => {});
    },
    
  },
  mounted() {
    // this.$socket.emit('connect')
     this.getUserInfo(() => {
        this.reception();
        this.getServiceChatMessage();
        // Pc端获取列表
        if (!this.isButtom) {
          this.getQuestion(this.userInfo.seller.seller_code);
        }
      });
    this.startCanvas();
  },
  created() {
  }
};
</script>
<style lang="less" scoped>
.textarea {
  border: 1px solid #222;
  height: 100px;
}
</style>