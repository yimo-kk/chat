<template>
  <div
    :class="[
      'chat_info',
      Object.keys(announcement).length > 0
        ? 'activity_contentTop'
        : 'contentTop',
    ]"
    :style="{
      backgroundImage: `url(${name ? currentGroupimg : ''})`,
    }"
    ref="chatInfo"
  >
    <div class="more_chat_log ">
      <van-loading size="1rem" v-if="isMore" class="more_log" color="#1989fa">
        <span style="fontSize:12px">加载中...</span>
      </van-loading>
    </div>
    <p
      v-if="count > 50 && messages.length >= count && !isMore"
      class="more_log"
    >
      没有更多了...
    </p>

    <div
      :class="[
        'who_chat',
        name
          ? 'chat_box_width_group'
          : isQuestion
          ? 'chat_box_width_group'
          : 'chat_box_width_server',
      ]"
    >
      <div class="chat_title">
        <div class="language">
          <span
            @click="changeLocale(localeval === 'zh-CN' ? 'en-US' : 'zh-CN')"
          >
            {{ localeval == 'zh-CN' ? 'En' : 'Zh' }}
          </span>
        </div>
        <!-- 返回 -->
        <!-- <div class="go_back">
          <van-icon
            class="iconfont"
            class-prefix="icon"
            name="fanhui"
            size="20px"
            @click.stop="()=>{
                $router.push({name:'ChatList',query:{
                  username, 
                  code:$store.state.code
                }})
              }"
          ></van-icon>
        </div> -->
        <p class="title">{{ chatUser }}</p>
        <p v-if="isPerson" class="group flex_center">
          <van-icon
            class="iconfont"
            class-prefix="icon"
            name="qunzu"
            size="20px"
          ></van-icon>
          <span class="group_num">{{ groupNum }}人</span>
        </p>
      </div>
      <van-notice-bar
        v-if="Object.keys(announcement).length > 0"
        left-icon="volume-o"
        color="#7fb9f3"
        scrollable
        @click="moreAnnouncement"
        :text="announcement.content"
      />
    </div>
    <div :class="['chat_content']" ref="chatContent">
      <div v-for="(item, index) in messages" :key="index">
        <div class="flex_center prompt" v-if="isPrompt && item.isWelcome">
          <p>
            {{ item.welcome }}
          </p>
        </div>

        <div v-if="item.state != 2">
          <div class="flex_center" style="color:#ccc; fontSize:12px">
            <p>
              {{
                chat_time
                  ? item.create_time
                  : isViewDate(index)
                  ? item.create_time
                  : ''
              }}
            </p>
          </div>
          <div
            class="record"
            v-if="item.from_name != username && !item.kefu_name"
          >
            <img class="head_portrait" :src="item.from_avatar" alt />
            <div style="margin: 0 10px;" class="chat_content_text_left">
              <span style="font-size: 12px;color:#ccc">{{
                item.state === 1 || !name ? item.from_name : item.nickname
              }}</span>
              <div v-if="item.type === 0" class="flex">
                <div class="left content">
                  <span
                    style="white-space: pre-line;word-break: break-word;"
                    v-html="conversionFace(item.content || item.message)"
                  >
                  </span>

                  <div
                    v-if="item.type == 0 && item.is_voice && !name"
                    class="playIcon flex"
                    status="stop"
                    :title="$t('tts')"
                    no="1"
                  >
                    <Audio
                      :time="false"
                      @play="
                        (isPlay) => {
                          playRecord(item.voice_path, index, isPlay)
                        }
                      "
                      :isPlay="item.play"
                      :data="item"
                    ></Audio>
                  </div>
                </div>
              </div>
              <p
                v-else-if="item.type === 1 || item.type === 4"
                class="content left"
                style="padding:4px"
              >
                <img
                  @load="loadImg"
                  @click="imageView(index, item.content || item.message)"
                  :class="[
                    item.type === 4 ? 'emojiImg' : 'send_img',
                    'send_img_left',
                  ]"
                  :src="item.content || item.message"
                  alt
                />
              </p>
              <div
                :title="$t('download')"
                v-else-if="item.type === 2"
                class="left fileView"
                style="display: flex;
                  align-items: center;"
                @click="
                  downloadFile(item.content || item.message, item.file_alias)
                "
              >
                <div class="file_name" style="align-items: flex-end;">
                  <span style="color:#000">{{
                    (item.message && item.message.filename) || item.file_alias
                  }}</span>
                  <span style="color: #ccc;margin: 6px;font-size: 10px;">{{
                    (item.message && item.message.filesize) || item.file_size
                  }}</span>
                </div>
                <p style="padding-left:10px">
                  <van-icon
                    color="#B18904"
                    size="40"
                    class="iconfont"
                    class-prefix="icon"
                    name="wenjian"
                  ></van-icon>
                </p>
              </div>
              <div v-else-if="item.type === 3" class="content left">
                <Audio
                  :time="true"
                  @play="
                    (isPlay) => {
                      playRecord(
                        item.content ? item.content : item.message.src,
                        index,
                        isPlay
                      )
                    }
                  "
                  :isPlay="item.message ? item.message.play : item.play"
                  :data="item"
                ></Audio>
              </div>
              <div v-if="item.endChat" class="api_list score">
                <p class="score_title">{{ $t('score') }}</p>
                <van-rate
                  style="padding：0 1rem"
                  v-model="item.scoreNum"
                  void-icon="star"
                  color="#ffd21e"
                  :readonly="item.isScore"
                />
                <van-field
                  v-model="item.scoreMessage"
                  rows="2"
                  autosize
                  type="textarea"
                  maxlength="50"
                  :placeholder="$t('opinion')"
                  show-word-limit
                  :readonly="item.isScore"
                />
                <van-button
                  :color="item.isScore ? '#ccc' : '#12a0cc'"
                  @click="submit(index, item.isScore)"
                  :disabled="item.isScore"
                  size="mini"
                  >{{
                    item.isScore ? $t('Evaluated') : $t('Evaluation')
                  }}</van-button
                >
              </div>
              <div v-if="item.isApi">
                <div
                  v-if="item.apiList && item.apiList.length"
                  class="api_list"
                >
                  <span class="select_or_view">{{ $t('viewOrSelect') }}</span>
                  <p
                    v-for="(val, apiIndex) in item.apiList"
                    :key="apiIndex"
                    class="api_list_item"
                    @click="getApicontent(val.api_id)"
                  >
                    <a
                      class="dwote"
                      :title="val.api_title"
                      v-html="val.api_title"
                    ></a>
                    <van-icon
                      class="iconfont"
                      size="12px"
                      class-prefix="icon"
                      name="iconfontzhizuobiaozhun19"
                    ></van-icon>
                  </p>
                </div>
                <p v-else class="api_list_content">{{ item.content }}</p>
              </div>
            </div>
          </div>
          <div
            class="record record_right"
            v-else-if="item.from_name == username && !item.kefu_name"
          >
            <div style="margin: 0 10px;" class="chat_content_text_right">
              <p style="text-align: end;font-size: 12px;color:#ccc">
                {{ item.nickname || item.from_name }}
              </p>
              <div v-if="item.type === 0" class="content right">
                <span
                  style="white-space: pre-line;word-break: break-word;"
                  v-html="conversionFace(item.content || item.message)"
                >
                </span>
              </div>

              <p
                v-else-if="item.type === 1 || item.type === 4"
                class="content right"
                style="padding:4px"
              >
                <img
                  @load="loadImg"
                  @click="imageView(index, item.content || item.message)"
                  :class="[
                    item.type === 4 ? 'emojiImg' : 'send_img',
                    'send_img_right',
                  ]"
                  :src="item.content || item.message"
                  alt
                />
              </p>
              <div
                :title="$t('download')"
                v-else-if="item.type === 2"
                class="right fileView"
                style="display: flex;
                  align-items: center;"
                @click="
                  downloadFile(item.content || item.message, item.file_alias)
                "
              >
                <p style="padding-right:10px">
                  <van-icon
                    color="#B18904"
                    size="40"
                    class="iconfont"
                    class-prefix="icon"
                    name="wenjian"
                  ></van-icon>
                </p>
                <div class="file_name">
                  <span style="color:#000">{{
                    (item.message && item.message.filename) || item.file_alias
                  }}</span>
                  <span style="color: #ccc;margin: 6px;font-size: 10px;">{{
                    (item.message && item.message.filesize) || item.file_alias
                  }}</span>
                </div>
              </div>
              <div v-else-if="item.type === 3" class="content right">
                <Audio
                  :time="true"
                  @play="
                    (isPlay) => {
                      playRecord(
                        item.content ? item.content : item.message.src,
                        index,
                        isPlay
                      )
                    }
                  "
                  :isPlay="item.message ? item.message.play : item.play"
                  :data="item"
                ></Audio>
              </div>
            </div>
            <img class="head_portrait" :src="item.from_avatar" alt />
          </div>
        </div>
        <div
          v-if="item.kefu_name === 'kefu' || item.state == 2"
          class="flex_center"
          style="marginBottom:10px"
        >
          <p
            style="color:#ccc;fontSize:0.8rem;padding: 0 5rem;
    text-align: center;"
          >
            {{ item.message || item.content }}
          </p>
        </div>
        <div
          v-if="item.kefu_name === 'message'"
          class="flex_center"
          style="marginBottom:10px"
        >
          <p style="color:#ccc;fontSize:0.8rem">{{ item.message }}</p>
          <a
            style="fontSize:0.8rem"
            href="javascript:void(0)"
            @click="message"
            >{{ $t('pleaseMessage') }}</a
          >
        </div>
      </div>
      <div v-if="readonly" class="flex_center second-readonly ">
        再次咨询客服，
        <p class="click-me" @click="$router.go(0)">点击我</p>
      </div>
    </div>
    <!-- pc端 -->
    <div v-if="Pcrecord">
      <div class="Pc_record">
        <div>
          <img src="@/assets/iamge/voice.gif" width="100px" height="100px" />
          <br />
          <p>{{ $t('recording') }}</p>
        </div>
        <div class="Pc_btn">
          <span
            class="flex_center"
            style="cursor:pointer;"
            @click="stopRecorder"
            >{{ $t('send') }}</span
          >
          <span class="flex_center" style="cursor:pointer;" @click="pcCancel">{{
            $t('cancel')
          }}</span>
        </div>
      </div>
      <div class="mask"></div>
    </div>
    <viewAnnouncement
      v-show="isMoreAnnouncement"
      @close="close"
      :newList="newList"
    ></viewAnnouncement>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { ImagePreview } from 'vant'
import Audio from '@/components/chatBox/audio.vue'
import viewAnnouncement from '@/components/viewAnnouncement'
export default {
  name: 'ChatInfo',
  props: {
    chatUser: {
      type: String,
      default: '',
    },
    messages: {
      type: Array,
      default() {
        return []
      },
    },
    Pcrecord: {
      type: Boolean,
    },
    isPrompt: {
      type: Boolean,
      default: true,
    },
    isPerson: {
      type: Boolean,
      default: false,
    },
    groupNum: {
      type: Number,
      default: 0,
    },
    name: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    announcement: {
      type: Object,
      default() {
        return {}
      },
    },
    isMore: {
      type: Boolean,
      default: false,
    },
    currentGroupimg: {
      type: String,
      default: '',
    },
    count: {
      type: Number,
      default: 20,
    },
    chat_time: {
      type: Number,
      default: 0,
    },
  },
  components: {
    Audio,
    viewAnnouncement,
  },
  data() {
    return {
      isMoreAnnouncement: false,
      newList: [],
      localeval: 'zh-CN',
      ttsIndex: null,
    }
  },
  computed: {
    ...mapState(['userInfo', 'username', 'code', 'isQuestion']),
    isViewDate(index) {
      return (index) => {
        if (this.messages[index] && this.messages[index - 1]) {
          if (
            this.messages[index].create_time &&
            this.messages[index - 1].create_time
          ) {
            return (
              new Date(this.messages[index].create_time).getTime() -
                new Date(this.messages[index - 1].create_time).getTime() >
              1000 * 60 * 3
            )
          }
        } else {
          return false
        }
      }
    },
  },

  watch: {
    'messages.length': {
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          this.isMore == false && this.messageDown()
        }
      },
      deep: true,
    },
    // 有公告时也需要调用一下
    announcement: {
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          this.messageDown()
        }
      },
      deep: true,
    },
  },
  methods: {
    // 来的消息显示在最下面
    messageDown() {
      if (this.messages.length && this.isMore == false) {
        this.$nextTick(() => {
          this.$refs.chatInfo.scrollTop = this.$refs.chatInfo.scrollHeight
        })
      }
    },
    // 图片显示延迟显示
    loadImg() {
      this.messageDown()
    },
    // 查看图片
    imageView(index, data) {
      let imageViewList = []
      this.messages.filter((item) => {
        if (item.type === 1) {
          item.content && imageViewList.push(item.content)
          item.message && imageViewList.push(item.message)
        }
      })
      ImagePreview({
        images: imageViewList,
        closeable: true,
        showIndex: false,
        loop: false,
        getContainer: '.chat_content',
        startPosition: imageViewList.indexOf(data),
      })
    },
    // 下载文件
    downloadFile(content, filename) {
      try {
        let dUrl
        typeof content == 'string' ? (dUrl = content) : (dUrl = content.src)
        let suffix = ['pdf', 'txt'] //, 'jpg', 'png', 'jepg', 'gif'
        if (suffix.includes(dUrl.split('.').pop())) {
          var request = new XMLHttpRequest()
          request.responseType = 'blob'
          request.open('GET', dUrl, true)
          request.onload = function(e) {
            var url = window.URL.createObjectURL(request.response)
            var a = document.createElement('a')
            document.body.appendChild(a)
            a.href = url
            a.download =
              typeof content == 'string' ? filename : content.filename
            a.click()
          }
          request.send()
        } else {
          if (['jpg', 'png', 'jepg', 'gif'].includes(dUrl.split('.').pop())) {
            ImagePreview({
              images: [dUrl],
              closeable: true,
              showIndex: false,
              loop: false,
            })
            return
          }
          let aLink = document.createElement('a')
          let evt = document.createEvent('HTMLEvents')
          evt.initEvent('click', true, true) //initEvent 不加后两个参数在FF下会报错  事件类型，是否冒泡，是否阻止浏览器的默认行为
          aLink.href = dUrl
          aLink.download =
            typeof content == 'string' ? filename : content.filename
          aLink.click()
        }
      } catch (error) {
        this.$toast(this.$t('fileErr'))
      }
    },
    downloadIamge(imgsrc, name) {
      //下载图片地址和图片名
      let image = new Image()
      // 解决跨域 Canvas 污染问题
      image.setAttribute('crossOrigin', 'anonymous')
      image.onload = function() {
        let canvas = document.createElement('canvas')
        canvas.width = image.width
        canvas.height = image.height
        let context = canvas.getContext('2d')
        context.drawImage(image, 0, 0, image.width, image.height)
        let url = canvas.toDataURL('image/png') //得到图片的base64编码数据
        let a = document.createElement('a') // 生成一个a元素
        let event = new MouseEvent('click') // 创建一个单击事件
        a.download = name || 'photo' // 设置图片名称
        a.href = url // 将生成的URL设置为a.href属性
        a.dispatchEvent(event) // 触发a的单击事件
      }
      image.src = imgsrc
    },

    // pc取消发送语音需要暂停处理
    pcCancel() {
      this.$emit('pcCancel')
    },
    // 播放语音
    playRecord(stream, index, isPlay) {
      this.$emit('playRecord', stream, index, isPlay)
    },
    // pc端发送语音
    stopRecorder() {
      this.$emit('stopRecorder')
    },
    // 评价
    submit(index, val) {
      this.$emit('submit', index, val)
    },
    getApicontent(id) {
      this.$emit('getApicontent', id)
    },
    moreAnnouncement() {
      this.$parent
        .getNewsList({ seller_code: this.userInfo.seller.seller_code })
        .then((result) => {
          this.newList = result.data
          this.isMoreAnnouncement = true
        })
        .catch((err) => {
          this.$toast(err.msg)
        })
    },
    close() {
      this.isMoreAnnouncement = false
    },
    changeLocale(type) {
      this.localeval = type
      this.$i18n.locale = type
    },
    message() {
      sessionStorage.setItem('seller_code', this.userInfo.seller.seller_code)
      this.$router.push({ name: 'Message' })
    },
    translationStart() {},
  },
  mounted() {
    this.messageDown()
    // 滚动到顶部 加载更多
    let chatDoc = this.$refs.chatInfo
    chatDoc.addEventListener('scroll', (e) => {
      if (
        e.target.scrollTop === 0 &&
        e.target.scrollHeight > e.target.offsetHeight &&
        !(this.messages.length >= this.count) &&
        !this.isMore
      ) {
        this.$emit('getLog', e)
      }
    })
  },
}
</script>
<style lang="less" scoped>
.playIcon {
  display: flex;
  border-radius: 3px;
}
.small {
  width: 13px;
  height: 10px;
  border-style: solid;
  border-top-color: transparent;
  border-left-color: transparent;
  border-bottom-color: transparent;
  border-radius: 50%;
  box-sizing: border-box;
  vertical-align: middle;
  display: inline-block;
  color: #a2a2a2;
  border-width: 0.1325rem;
}

.middle {
  width: 27px;
  height: 18px;
  border-style: solid;
  border-top-color: transparent;
  border-left-color: transparent;
  border-bottom-color: transparent;
  border-radius: 50%;
  box-sizing: border-box;
  vertical-align: middle;
  display: inline-block;
  margin-left: -22px;
  animation: show2 3s ease-in-out infinite;
  opacity: 1;
  color: #a2a2a2;
  border-width: 0.1325rem;
}
@keyframes show2 {
  0% {
    opacity: 0;
  }
  30% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

.different {
  transform: rotate(180deg);
}
.large {
  width: 37px;
  height: 28px;
  border-style: solid;
  border-top-color: transparent; //大专栏 纯css3配合vue实现微信语音播放效果;
  border-left-color: transparent;
  border-bottom-color: transparent;
  border-radius: 50%;
  box-sizing: border-box;
  vertical-align: middle;
  display: inline-block;
  margin-left: -32px;
  animation: show3 3s ease-in-out infinite;
  opacity: 1;
  color: #a2a2a2;
  border-width: 0.1325rem;
}
@keyframes show3 {
  0% {
    opacity: 0;
  }
  60% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
.stopanimate {
  -moz-animation-name: none;
  -webkit-animation-name: none;
  -ms-animation-name: none;
  animation-name: none;
}
.second-readonly {
  padding: 10px 0;
  color: rgb(204, 204, 204);
  .click-me {
    color: #45cbef;
    cursor: pointer;
  }
}
</style>
