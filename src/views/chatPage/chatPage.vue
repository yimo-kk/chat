<template>
  <div id="click_head_portrait" class="chat_serve w">
    <div v-show="loading" class="loading_box">
      <van-loading size="45" class="loading" color="#02c0fe" />
    </div>
    <div class="chat_box">
      <!-- 消息展示  -->
      <ChatInfo
        ref="ChatInfo"
        :chatUser="chatUser"
        :messages="messages"
        :Pcrecord="Pcrecord"
        @playRecord="playRecord"
        @stopRecorder="pcStopService"
        @submit="submit"
        @pcCancel="pcCancel"
        @getApicontent="getApicontent"
        :announcement="announcement"
        :name="false"
        :isPrompt="isPrompt"
        :isMore="isMore"
        :count="count"
        @getLog="getLog"
        :chat_time="chatTime"
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
            <van-uploader :after-read="uploadeFile" accept="*">
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
            <van-icon
              v-if="isAudio & isIE"
              @click="recordService"
              name="comment-o"
              style="padding:0 1px"
              size="1.8rem"
            />
            <van-icon
              v-else-if="isIE"
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
            @touchmove="slideRecord"
            v-if="isAudio"
          >
            {{ btnText }}
          </div>
          <div class="send_text" v-else>
            <textarea
              ref="textarea"
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
                    faceShow = false
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
                {{ $t('send') }}
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
    <!-- 暂时隐藏常见问题 -->
    <!-- <PcChatList
      v-if="!isButtom"
      :chatType="1"
      :questionList="questionList"
    ></PcChatList> -->
    <!-- 录音图像 -->
    <div class="record_mask" v-show="isMask">
      <div class="record_pic">
        <canvas id="canvas"></canvas>
        <p class="cancel">{{ $t('clsSend') }}</p>
      </div>
    </div>
    <!-- 播放录音 -->
    <audio ref="audio" @ended="playEnd" style="display: none;"></audio>
    <!-- code 不存在 -->
    <div v-if="isGroupUser.state" class="is_group_user">
      <p class="is_group_user_msg">
        {{ isGroupUser.message || isGroupUser.msg }}
      </p>
    </div>
  </div>
</template>
<script>
import {
  getServiceChatLog,
  uploadVoice,
  praise,
  getApiList,
  getApiById,
  getQuestionList,
} from '@/api/chat.js'
import { ImagePreview } from 'vant'
// import PcChatList from '@/components/pcChatList/pcChatList.vue'
import ChatInfo from '@/components/chatPage/chatInfo.vue'
import common from '@/mixins/common'
import {
  compressImage,
  isImage,
  base64ToBlob,
  setStorage,
  getStorage,
  conversion,
  conversionFace,
  createUserName,
  isIE,
} from '@/libs/utils.js'
export default {
  name: 'ChatPage',
  mixins: [common()],
  components: {
    // PcChatList,
    ChatInfo,
  },
  data() {
    return {
      socket: '',
      loading: false,
      messages: [],
      activateId: 1,
      list: [],
      isMask: false,
      currentIndex: null, //当前播放的
      sendType: 0,
      Pcrecord: false,
      posStart: 0, //初始化起点坐标
      posEnd: 0, //初始化终点坐标
      posMove: 0, //初始化滑动坐标
      isLoading: false,
      chatUser: '官方客服',
      isPrompt: true,
      profilePhoto: 'https://server.customerchat.org/static/images/kefu.png',
      // questionList: [],
      outTime: false,
      isGroupUser: {
        state: false,
        message: '',
      },
      page: 1,
      count: 0,
      isMore: false,
      server_status: null,
    }
  },
  watch: {
    // isButtom(newVal) {
    //   !newVal && this.getQuestion(this.userInfo.seller.seller_code)
    // },
  },
  sockets: {
    // connect:查看socket是否渲染成功
    connect() {
      console.log('成功')
    },
    // 发生错误关闭连接
    error() {
      this.$socket.close()
    },
    // disconnect:检测socket断开连接
    disconnect(data) {},
    reconnect(data) {
      console.log('重连')
      this.$socket.emit('enter', {
        customer_id: this.userInfo.data ? this.userInfo.data.uid : '',
        customer_ip: this.userIp.ip,
        customer_name: this.username,
        seller_code: this.userInfo.seller.seller_code,
        customer_avatar: this.userInfo.data.headimg,
        level: this.$store.state.level,
        customer_area: this.userIp.address,
      })
    },
    //有客服接待通知
    prompt(data) {
      data.kefu_name = 'kefu'
      data.state == 2
      data.create_time = this.$dayjs().format('YYYY-MM-DD HH:mm:ss')
      this.messages.push(data)
      let obj = {}
      if (getStorage(this.$route.query.code) && data.kefu_code) {
        this.$store.commit('setKefu_code', data.kefu_code)
        obj = JSON.parse(getStorage(this.$route.query.code))
        obj[this.username].kefu_code = data.kefu_code
        setStorage(this.$route.query.code, obj)
      }
    },
    // 客服繁忙 和其他提示
    processing(data) {
      data.code === 6 ? (data.kefu_name = 'message') : (data.kefu_name = 'kefu')
      this.messages.push(data)
    },
    // 客服给用户发送消息
    serviceMsg(data) {
      let num = this.$store.state.num
      this.$store.commit('setNum', ++num)
      this.$store.commit('setTitle', num)
      this.$store.commit('closeTitleScrolling')
      this.$store.dispatch('playPromptVuex')
      this.$store.commit('titleScrolling')
      data.type === 3 && (data.message.play = false)
      if (data.type === 0) {
        data.message = conversionFace(data.content || data.message)
        data.play = false
      }
      data.create_time = this.$dayjs().format('YYYY-MM-DD HH:mm:ss')
      this.messages.push(data)
    },
    userMsg(data) {
      let message = JSON.parse(JSON.stringify(data))
      if (data.from_name === this.userInfo.data.username) {
        data.type === 3 && (message.message.play = false)
        if (data.type === 0) {
          message.message = conversionFace(data.message)
          message.play = false
        }
        message.create_time = data.createtime
        this.messages.push(message)
      }
    },
    // 客服关闭会话,提示评分
    score(data) {
      data.endChat = true
      data.isScore = false
      data.scoreNum = 0 //评分
      data.scoreMessage = '' //评分内容
      this.messages.push(data)
    },
    //
    // closetime-processing()
  },
  methods: {
    // 发送消息
    send(data) {
      if (!this.sendText.length && this.sendType === 0) return
      let my_send = {
        cmd: 'user-service',
        kefu_code: JSON.parse(getStorage(this.code))[this.username].kefu_code,
        from_avatar: this.userInfo.data.headimg,
        message: data,
        from_id: this.userInfo.data.uid ? this.userInfo.data.uid : '',
        from_name: this.userInfo.data.username,
        seller_code: this.userInfo.seller.seller_code,
        type: this.sendType,
        from_area: this.userIp.address,
        from_ip: this.userIp.ip,
      }
      let sendMessage = JSON.parse(JSON.stringify(my_send))
      this.sendType === 0 && (sendMessage.message = conversion(my_send.message))
      this.$socket.emit('message', sendMessage)
      this.sendText = ''
      this.faceShow = false
    },
    // 获取图片
    uploadeImg(file) {
      this.sendType = 1
      if (!isImage(file.file.type)) {
        this.$toast({
          message: this.$t('selectImg'),
          position: 'top',
        })
      } else {
        compressImage(
          file.file,
          (imgData) => {
            this.send(imgData)
          },
          (error) => {
            // 压缩出错
            this.$toast(this.$t('sendErr'))
          }
        )
      }
    },
    pcStopService() {
      this.stopRecorder(this.uploadeVoice)
    },
    recordService() {
      this.record(this.uploadeVoice)
    },
    startRecordServic(e) {
      this.startRecord(e, this.uploadeVoice)
    },
    endRecordService(e) {
      this.endRecord(e, this.uploadeVoice)
    },
    uploadeVoice(formdata) {
      uploadVoice({
        params: formdata,
        seller_code: this.userInfo.seller.seller_code,
      })
        .then((result) => {
          this.loading = false
          let data = result.data.data
          data.duration = Math.round(this.recorder.duration)
          this.send(data)
        })
        .catch((err) => {
          this.loading = false
        })
    },
    // 获取和客服的聊天记录
    getServiceChatMessage(params, fn) {
      getServiceChatLog(params)
        .then((result) => {
          this.server_status = result.data.code
          this.loading = false
          this.count = result.data.count
          let array = result.data.data.map((item) => {
            item.type == 3 && (item.play = false)
            if (item.type == 0) {
              item.content
                ? (item.content = conversionFace(item.content))
                : (item.message = conversionFace(item.message))
              item.play = false
            }
            return item
          })
          if (this.page > 1) {
            this.messages.unshift(...array)
            fn && fn()
            setTimeout(() => {
              this.isMore = false
            }, 200)
          } else {
            fn && fn()
            this.messages = array
            this.isMore = false
          }
        })
        .catch((err) => {
          this.loading = false
          this.$toast(err.msg)
        })
    },
    // 发送接待
    reception() {
      this.$socket.emit('enter', {
        customer_id: this.userInfo.data ? this.userInfo.data.uid : '',
        customer_ip: this.userIp.ip,
        customer_name: this.username,
        seller_code: this.userInfo.seller.seller_code,
        customer_avatar: this.userInfo.data.headimg,
        level: this.$store.state.level,
        customer_area: this.userIp.address,
      })
    },
    submit(index, val) {
      if (val) return
      praise({
        uid: this.userInfo.data.uid,
        kefu_code: JSON.parse(getStorage(this.code))[this.username].kefu_code,
        code: this.userInfo.seller.seller_code,
        content: this.messages[index].scoreMessage,
        star:
          this.messages[index].scoreNum === 0
            ? 1
            : this.messages[index].scoreNum,
      })
        .then((result) => {
          this.messages[index].isScore = true
          if (result.data.code === 0) {
            this.messages.push({
              kefu_name: 'kefu',
              message: this.$t('comment'),
            })
          }
        })
        .catch((err) => {
          console.log(err)
          this.$toast(this.$t('commentErr'))
        })
    },
    // 获取进入客服主动发送消息
    getServiceSendData() {
      getApiList({
        seller_code: this.code,
      })
        .then((result) => {
          if (result.data.code === 0) {
            result.data.data.length &&
              this.messages.push({
                isApi: true,
                apiList: result.data.data,
                from_name: this.$t('service'),
                from_avatar: this.profilePhoto,
                create_time: this.$dayjs().format('YYYY-MM-DD HH:mm:ss'),
              })
            this.messages.push({
              state: 2,
              message: this.userInfo.seller.hello_word,
            })
            if (sessionStorage.getItem('message')) {
              this.messages.push({
                kefu_name: 'kefu',
                message: '感谢你的留言，请等待客服联系你',
              })
              sessionStorage.removeItem('message')
            }

            this.server_status === 9 &&
              this.messages.push({
                kefu_name: 'message',
                message: '当前没有客服在线',
              })
          } else {
            this.$toast(this.$t('timeOut'))
          }
        })
        .catch((err) => {
          console.log(err)
          this.$toast(this.$t('timeOut'))
        })
    },
    getApicontent(id) {
      getApiById({
        api_id: id,
      }).then((result) => {
        if (result.data.code === 0) {
          this.messages.push({
            isApi: true,
            content: result.data.data,
            from_name: this.$t('service'),
            from_avatar: this.profilePhoto,
          })
        }
      })
    },
    // 获取常见问题
    // getQuestion(seller_code) {
    //   getQuestionList({ seller_code })
    //     .then((result) => {
    //       if (result.data.code === 0) {
    //         this.questionList = result.data.data.map((item) => {
    //           item.isShow = false
    //           return item
    //         })
    //       }
    //     })
    //     .catch((err) => {
    //       this.$toast(err.msg)
    //     })
    // },
    getLog(e) {
      this.isMore = true
      this.page++
      let scrollH = this.$refs.ChatInfo.$refs.chatInfo.scrollHeight
      this.getServiceChatMessage(
        {
          page: this.page,
          username: this.userInfo.data.username,
          seller_code: this.userInfo.seller.seller_code,
        },
        () => {
          setTimeout(() => {
            e.target.scrollTo(0, e.target.scrollHeight - (scrollH + 30))
          })
        }
      )
    },
  },
  mounted() {
    this.judgment()
      .then(() => {
        this.getUserInfo(() => {
          this.reception()
          this.getNewsData(this.userInfo.seller.seller_code)
          // 轮询查找
          setInterval(() => {
            this.$socket.emit('message', {
              cmd: 'outtime-processing',
              username: this.username,
              seller_code: this.userInfo.seller.seller_code,
              uid: this.userInfo.data.uid,
            })
          }, 5000)
          this.getServiceChatMessage(
            {
              page: 1,
              username: this.userInfo.data.username,
              seller_code: this.userInfo.seller.seller_code,
            },
            () => {
              this.getServiceSendData(this.code)
            }
          )
          // Pc端获取列表
          // if (!this.isButtom) {
          //   this.getQuestion(this.userInfo.seller.seller_code)
          // }
        })
      })
      .catch((err) => {
        console.log(err)
        this.$dialog.alert({
          message: '商家不存在或参数错误！',
          showConfirmButton: false,
          showCancelButton: false,
        })
      })
    this.startCanvas()
  },
}
</script>
<style lang="less" scoped>
.textarea {
  border: 1px solid #222;
  height: 100px;
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
    width: 18rem;
    height: 55px;
    border-radius: 0.8rem;
    text-align: center;
    line-height: 55px;
  }
}
.van-notice-bar__wrap {
  line-height: 25px !important;
}
</style>
