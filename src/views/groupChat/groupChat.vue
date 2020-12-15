<template>
  <div class="chat">
    <div v-show="loading" class="loading_box">
      <van-loading size="45" class="loading" color="#02c0fe" />
    </div>
    <div class="chat_serve w">
      <div class="chat_box">
        <!-- 消息展示-->
        <ChatInfo
          ref="GroupChatInfo"
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
          @pcCancel="pcCancel"
          :isMore="isMore"
          :count="count"
          @getLog="getLog"
          :currentGroupimg="currentGroupimg"
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
              <van-icon
                v-if="isAudio & isIE && on_voice"
                @click="recordService"
                name="comment-o"
                style="padding:0 1px"
                size="1.8rem"
              />
              <van-icon
                v-else-if="isIE && on_voice"
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
      <pcChatList
        v-if="!isButtom"
        :chatType="2"
        :groupMemberList="groupMember.data"
      ></pcChatList>
      <!-- 录音图像 -->
      <div class="record_mask" v-show="isMask">
        <div class="record_pic">
          <canvas id="canvas"></canvas>
          <p class="cancel">{{ $t('clsSend') }}</p>
        </div>
      </div>
      <!-- 播放录音 -->
      <audio ref="audio" @ended="playEnd" style="display: none;"></audio>
    </div>
    <!-- code 不存在 -->
    <div v-if="isGroupUser.state" class="is_group_user">
      <p class="is_group_user_msg">
        {{ isGroupUser.message || isGroupUser.msg }}
      </p>
    </div>
    <enterPopup :isShowPopup="isShowPopup" @onSubmit="onSubmit"></enterPopup>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import pcChatList from '@/components/pcChatList/pcChatList.vue'
import ChatInfo from '@/components/chatPage/chatInfo.vue'
import enterPopup from '@/components/popup/enterPopup.vue'
import common from '@/mixins/common'

import {
  getGroupChatLog,
  sendGroupChatFile,
  getGroupList,
  uploadVoice,
  checkGroupPwd,
  getGroupData,
} from '@/api/chat.js'

import {
  setStorageData,
  getStorage,
  compressImage,
  isImage,
  conversion,
  conversionFace,
  createUserName,
  setStorage,
  isIE,
  rule,
} from '@/libs/utils.js'
export default {
  name: 'groupChat',
  mixins: [common()],
  components: {
    pcChatList,
    ChatInfo,
    enterPopup,
  },
  data() {
    return {
      loading: false,
      messages: [],
      Pcrecord: false,
      sendType: null,
      isMask: false, // 录音时的波浪
      chatTitle: '',
      groupMember: {
        data: [],
        num: null,
      },
      isGroupUser: {
        state: false,
        message: '',
      },
      on_file: 0, //上传文件和语音功能是否开启 0否1是
      on_voice: 0,
      socket: '',
      page: 1,
      count: 0,
      isMore: false,
      is_invite: null,
      isShowPopup: false,
      currentUid: null,
      currentUsername: '',
      currentHeadimg: '',
      currentGroupimg: '',
    }
  },
  computed: {
    isIE() {
      return !isIE()
    },
  },
  sockets: {
    // connect:查看socket是否渲染成功
    connect() {},
    //发生错误关闭连接
    error() {
      this.$socket.close()
    },
    // disconnect:检测socket断开连接
    disconnect(data) {
      // let that = this
      // console.log('断开')
      // this.$dialog.confirm({
      //     title: '提示',
      //     message: '网络异常断开连接，请刷新！',
      //   })
      // .then(() => {
      //   this.$router.go(0)
      //   // on confirm
      // })
    },
    reconnect(data) {
      console.log('重连')
      this.$socket.emit('group', {
        username: this.username,
        group_id: this.gid,
        seller_code: this.code || this.userInfo.seller.seller_code,
        nickname: this.userInfo.data.nickname,
      })
    },
    // 收到群消息
    groupMsg(data) {
      if (this.username !== data.from_name) {
        let num = this.$store.state.num
        this.$store.commit('setNum', ++num)
        this.$store.commit('setTitle', num)
        this.$store.commit('closeTitleScrolling')
        this.$store.dispatch('playPromptVuex')
        this.$store.commit('titleScrolling')
      }
      data.type === 3 && (data.message.play = false)
      data.type === 0 &&
        (data.message = conversionFace(data.content || data.message))
      this.messages.push(data)
    },
    // 拉黑全局
    groupBlack(data) {
      data.kefu_name = 'kefu'
      this.messages.push(data)
    },
    // 拉黑个人
    userBlack(data) {
      if (data.from_name == this.$store.state.userInfo.data.username) {
        data.kefu_name = 'kefu'
        this.messages.push(data)
      }
    },
    removeblack(data) {
      // if (data.username == this.$store.state.userInfo.data.username) {
      data.kefu_name = 'kefu'
      this.messages.push(data)
      // }
    },
    // 禁言全局
    groupForbid(data) {
      data.kefu_name = 'kefu'
      this.messages.push(data)
    },
    // 禁言个人
    userForbid(data) {
      if (data.from_name == this.$store.state.userInfo.data.username) {
        data.kefu_name = 'kefu'
        this.messages.push(data)
      }
    },
    // 解禁个人
    removeforbid(data) {
      data.kefu_name = 'kefu'
      this.messages.push(data)
    },
    // 加入聊天室
    userJoin(data) {
      this.groupAddOrLeave(data, 'add')
    },
    // 离开聊天室
    userLeave(data) {
      this.groupAddOrLeave(data, 'leave')
    },
    // 客服上线
    kefuOnline(data) {
      this.groupAddOrLeave(data, 'add', 'kefu')
    },
    // 客服离开
    kefuLeave(data) {
      this.groupAddOrLeave(data, 'leave')
    },
    // 管理员拉人进群
    pullUsersGroup(data) {
      this.groupAddOrLeave(data, 'add')
    },
    // 踢出群聊
    kickGroup(data) {
      data.kefu_name = 'kefu'
      this.messages.push(data)
      this.groupAddOrLeave(data, 'leave')
      if (data.username == this.$store.state.userInfo.data.username) {
        this.isGroupUser = {
          state: true,
          message: this.$t('noMember'),
        }
      }
    },
    // 解散群
    delGroup(data) {
      if (data.group_id == this.gid) {
        this.isGroupUser = {
          state: true,
          message: this.$t('disband'),
        }
      }
    },
    // 修改成员昵称
    saveNickname(data) {
      this.messages.push(data)
      if (this.groupMember.data.length) {
        this.groupMember.data.forEach((item) => {
          if (data.group_id == this.gid && data.uid == item.uid) {
            item.nickname = data.nickname
          }
        })
      }
      let newUserData = JSON.parse(JSON.stringify(this.userInfo))
      newUserData.data.nickname[this.userInfo.seller.seller_code] =
        data.nickname
      this.$store.commit('setUserInfo', newUserData)
    },
  },
  methods: {
    // 发送消息
    send(data) {
      if (!this.sendText.length && this.sendType === 0) return
      let my_send = {
        cmd: 'user-group',
        message: data,
        from_id: this.userInfo.data.uid,
        from_name: this.username,
        from_avatar: this.userInfo.data.headimg,
        group_id: this.gid,
        seller_code: this.userInfo.seller.seller_code,
        state: 0,
        nickname: this.userInfo.data.nickname[this.userInfo.seller.seller_code],
        type: this.sendType,
        is_invite: this.is_invite,
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
    // 获取群聊记录
    getGroupChatLog(params, fn) {
      getGroupChatLog(params)
        .then((result) => {
          this.loading = false
          this.count = result.data.count
          if (result.data.code == 1 || result.data.code == -1) {
            this.isGroupUser.state = true
            this.isGroupUser.message = result.data.msg
            return
          } else {
            this.$socket.emit('group', {
              username: this.username,
              group_id: this.gid,
              seller_code: this.userInfo.seller.seller_code,
              headimg: this.userInfo.data.headimg,
              nickname: this.userInfo.data.nickname,
            })

            this.is_invite = result.data.group.is_invite
            this.chatTitle = result.data.group_name
            let array = result.data.data.map((item) => {
              item.type == 3 && (item.play = false)
              if (item.type == 0) {
                item.content
                  ? (item.content = conversionFace(item.content))
                  : (item.message = conversionFace(item.message))
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
              this.messages = array
              this.isMore = false
            }
          }
        })
        .catch((err) => {
          this.loading = false
          this.$toast(err.msg)
        })
    },
    // 获取群成员
    getGroupList(group_id) {
      getGroupList({ group_id, seller_code: this.userInfo.seller.seller_code })
        .then((result) => {
          this.groupMember.data = result.data.data
          this.$set(this.groupMember, 'num', result.data.data.length)
        })
        .catch((err) => {
          console.log(err)
          this.$toast(this.$t('timeOut'))
        })
    },
    groupAddOrLeave(data, opt, val) {
      if (!Object.keys(this.groupMember).length) return
      let that = this
      let method = {
        add(data) {
          let vals = this.memberVal(that.groupMember.data)
          if (Array.isArray(data)) {
            let addVals = this.memberVal(data)
            addVals.forEach((item) => {
              if (!vals.includes(item)) {
                that.groupMember.num += 1
                that.groupMember.data.push(...data)
              }
            })
          } else {
            if (vals.includes(data.username)) return
            that.groupMember.num += 1
            val == 'kefu'
              ? that.groupMember.data.unshift(data)
              : that.groupMember.data.push(data)
          }
        },
        leave(data) {
          that.groupMember.num -= 1
          if (data.kefu_code) {
            that.groupMember.data.forEach((item, index) => {
              if (item.kefu_code && data.kefu_code == item.kefu_code) {
                that.groupMember.data.splice(index, 1)
              }
            })
          } else {
            let index = this.memberVal(that.groupMember.data).indexOf(
              data.username
            )
            if (index != -1) {
              that.groupMember.data.splice(index, 1)
            }
          }
        },
        memberVal(list) {
          if (!list) {
            return []
          } else {
            return list.map((item) => {
              return item.username
            })
          }
        },
      }
      method[opt](data)
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
    getLog(e) {
      this.isMore = true
      this.page++
      let scrollH = this.$refs.GroupChatInfo.$refs.chatInfo.scrollHeight
      this.getGroupChatLog(
        {
          page: this.page,
          group_id: this.gid,
          seller_code: this.userInfo.seller.seller_code,
          uid: this.userInfo.data.uid,
        },
        () => {
          setTimeout(() => {
            e.target.scrollTo(0, e.target.scrollHeight - (scrollH + 30))
          })
        }
      )
    },
    // 输入密码提交
    onSubmit(password) {
      checkGroupPwd({
        group_id: this.gid,
        seller_code: this.userInfo.seller.seller_code,
        group_pwd: password,
        uid: this.currentUid,
        username: this.currentUsername,
        headimg: this.currentHeadimg,
      })
        .then((result) => {
          if (result.data.code == -1) {
            this.$toast(this.$t('notPassword'))
            return
          } else {
            setStorageData(this.code, this.username, this.gid, true)
            this.isShowPopup = false
            this.loading = true
            this.getNewsData(this.userInfo.seller.seller_code)
            this.getGroupList(this.gid)
            this.getGroupChatLog({
              page: 1,
              group_id: this.gid,
              seller_code: this.userInfo.seller.seller_code,
              uid: this.userInfo.data.uid,
            })
          }
        })
        .catch((err) => {
          console.log(err)
        })
    },
    // 获取群是否需要邀请
    getGroupData() {
      if (!this.gid) {
        this.isGroupUser = {
          state: true,
          message: this.$t('notGroup'),
        }
        return
      }
      this.loading = true
      getGroupData({
        group_id: this.gid,
        seller_code: this.userInfo.seller.seller_code,
        username: this.username,
      })
        .then(async (result) => {
          this.loading = false
          this.on_file = result.data.group.on_file
          this.on_voice = result.data.group.on_voice
          this.currentUid = result.data.users.uid
          this.currentUsername = result.data.users.username
          this.currentHeadimg = result.data.users.headimg
          this.currentGroupimg = result.data.group.group_avatar
          let oldPassword
          JSON.parse(getStorage(this.code))[result.data.users.username][
            'groupList'
          ].forEach((item) => {
            item.group_id === this.gid && (oldPassword = item.isPassword)
          })
          if (!oldPassword && result.data.group.is_invite) {
            oldPassword ? '' : (this.isShowPopup = true)
          } else {
            this.loading = true
            await this.getNewsData(this.userInfo.seller.seller_code)
            await this.getGroupList(this.gid)
            await this.getGroupChatLog({
              page: 1,
              group_id: this.gid,
              seller_code: this.userInfo.seller.seller_code,
              uid: this.userInfo.data.uid,
            })
          }
        })
        .catch((err) => {
          this.loading = false
          console.log(err)
        })
    },
  },
  created() {},
  mounted() {
    this.judgment()
      .then(async () => {
        this.getUserInfo(async () => {
          await this.getGroupData()
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
  },
}
</script>
<style lang="less" scoped>
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
    width: 18rem;
    height: 55px;
    border-radius: 0.8rem;
    text-align: center;
    line-height: 55px;
  }
}
</style>
