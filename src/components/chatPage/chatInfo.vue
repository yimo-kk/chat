<template>
  <div class="chat_info" ref="chatInfo">
    <div class="who_chat">
      <div class="chat_title">
        <p class="go_back">
          <van-icon
            class="iconfont"
            class-prefix="icon"
            name="fanhui"
            size="20px"
            @click.stop="()=>{
                $router.push({name:'ChatList',query:{
                  username, 
                  code:$route.query.code
                }})
              }"
          ></van-icon>
        </p>
        <p class="title">{{chatUser}}</p>
        <p v-if="isPerson" class="group flex_center">
          <van-icon class="iconfont" class-prefix="icon" name="qunzu" size="20px"></van-icon>
          <span class="group_num">{{groupNum}}人</span>
        </p>
      </div>
      <van-notice-bar
        v-if=" Object.keys(announcement).length > 0"
        left-icon="volume-o"
        color="#7fb9f3"
        scrollable
        :text="announcement.content"
      />
    </div>
    <div
      :class="['chat_content',Object.keys(announcement).length > 0?'activity_contentTop': 'contentTop']"
      ref="chatContent"
    >
      <div class="flex_center prompt" v-if="isPrompt">
        <p>{{$store.state.userInfo.seller ? $store.state.userInfo.seller.hello_word :""}}</p>
      </div>
      <div v-for="(item,index) in messages" :key="index">
        <div class="flex_center" style="color:#ccc; fontSize:12px">
          <p>{{ isViewDate(index) ?item.create_time:''}}</p>
        </div>
        <div class="record" v-if="item.from_name != username && !item.kefu_name">
          <img class="head_portrait" :src="item.from_avatar" alt />
          <div style="margin: 0 10px;" class="chat_content_text_left">
            <span v-if="name" style="font-size: 12px;color:#ccc">{{item.from_name}}</span>
            <span style="white-space: pre-line" v-if="item.type=== 0" class="content left">{{item.content || item.message }}</span>
            <p v-else-if="item.type=== 1" class="content left" style="padding:4px">
              <img
                @load='loadImg' 
                @click="imageView(index,item.content||item.message)"
                class="send_img send_img_left"
                :src="item.content ||  item.message"
                alt
              />
            </p>
            <div
              title="点击下载文件"
              v-else-if="item.type=== 2"
              class="left fileView"
              style="display: flex;
                  align-items: center;"
              @click="downloadFile(item.content || item.message,item.file_alias)"
            >
              <div class="file_name" style="align-items: flex-end;">
                <span style="color:#000">{{item.message&&item.message.filename || item.file_alias}}</span>
                <span
                  style="color: #ccc;margin: 6px;font-size: 10px;"
                >{{item.message&&item.message.filesize || item.file_size}}</span>
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
            <div v-else-if="item.type=== 3" class="content left">
              <Audio
                @play="(isPlay)=>{
                    playRecord( item.content?item.content: item.message.src,index,isPlay)
                    }"
                :isPlay="item.message ?item.message.play:item.play"
                :data="item"
              ></Audio>
            </div>
            <div v-if="item.endChat" class="api_list score">
              <p class="score_title">请您对本次服务进行评分</p>
              <van-rate
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
                placeholder="欢迎给我们的服务提意见~"
                show-word-limit
                :readonly="item.isScore"
              />
              <van-button
                :color="item.isScore?'#ccc':'#12a0cc'"
                @click="submit(index,item.isScore)"
                :disabled="item.isScore"
                size="mini"
              >{{item.isScore ? '已评价':'评价'}}</van-button>
            </div>
            <div v-if="item.isApi">
              <div v-if="item.apiList && item.apiList.length" class="api_list">
                <span class="select_or_view">请选择/查看</span>
                <p
                  v-for="(val,apiIndex) in item.apiList"
                  :key="apiIndex"
                  class="api_list_item"
                  @click="getApicontent(val.api_id)"
                >
                  <a class="dwote">{{val.api_title}}</a>
                  <van-icon
                    class="iconfont"
                    size="12px"
                    class-prefix="icon"
                    name="iconfontzhizuobiaozhun19"
                  ></van-icon>
                </p>
              </div>
              <p v-else class="api_list_content">{{item.content}}</p>
            </div>
          </div>
        </div>
        <div class="record record_right" v-else-if="item.from_name == username&&!item.kefu_name ">
          <div style="margin: 0 10px;" class="chat_content_text_right">
            <p v-if="name" style="text-align: end;font-size: 12px;color:#ccc">{{username}}</p>
            <span style="white-space: pre-line" v-if="item.type=== 0" class="content right">{{item.message || item.content}}</span>
            <p v-else-if="item.type=== 1" class="content right" style="padding:4px">
              <img
              @load='loadImg' 
                @click="imageView(index,item.content||item.message)"
                class="send_img send_img_right"
                :src="item.content ||  item.message"
                alt
              />
            </p>
            <div
              title="点击下载文件"
              v-else-if="item.type=== 2"
              class="right fileView"
              style="display: flex;
                  align-items: center;"
              @click="downloadFile(item.content || item.message,item.file_alias)"
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
                <span
                  style="color:#000"
                >{{item.message && item.message.filename || item.file_alias}}</span>
                <span
                  style="color: #ccc;margin: 6px;font-size: 10px;"
                >{{item.message&&item.message.filesize || item.file_alias }}</span>
              </div>
            </div>
            <div v-else-if="item.type=== 3" class="content right">
              <Audio
                @play="(isPlay)=>{
                   playRecord(item.content?item.content: item.message.src,index,isPlay)
                  }"
                :isPlay=" item.message ?item.message.play:item.play"
                :data="item"
              ></Audio>
            </div>
          </div>
          <img class="head_portrait" :src="item.from_avatar" alt />
        </div>
        <div v-if="item.kefu_name ==='kefu'" class="flex_center" style="marginBottom:10px">
          <p style="color:#ccc">{{item.message}}</p>
        </div>
      </div>
    </div>
    <!-- pc端 -->
    <div v-if="Pcrecord">
      <div class="Pc_record">
        <div>
          <img src="@/assets/iamge/voice.gif" width="100px" height="100px" />
          <br />
          <p>正在录音请说话...</p>
        </div>
        <div class="Pc_btn">
          <span class="flex_center" style="cursor:pointer;" @click="stopRecorder">发送</span>
          <span class="flex_center" style="cursor:pointer;" @click="pcCancel">取消</span>
        </div>
      </div>
      <div class="mask"></div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { ImagePreview } from "vant";
import Axios from "axios";
import qs from "qs";
// import { screenSize } from "@/libs/utils.js";
import Audio from "@/components/chatPage/audio.vue";
export default {
  name: "ChatInfo",
  props: {
    chatUser: {
      type: String,
      default: ""
    },
    messages: { 
      type: Array,
      default() {
        return [];
      }
    },
    Pcrecord: {
      type: Boolean
    },
    isPrompt: {
      type: Boolean,
      default: true
    },
    isPerson: {
      type: Boolean,
      default: false
    },
    groupNum: {
      type: Number,
      default: 0
    },
    name: {
      type: Boolean,
      default: false
    },
    announcement: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  components: {
    Audio
  },
  data() {
    return {};
  },
  computed: {
    ...mapState(["userInfo", "username", "code"]),
    isViewDate() {
      return index => {
        if (this.messages[index] && this.messages[index - 1]) {
          return (
            new Date(this.messages[index].create_time).getTime() -
              new Date(this.messages[index - 1].create_time).getTime() >
            1000 * 60 * 5
          );
        } else {
          return "";
        }
      };
    }
  },
  watch: {
    "messages.length": {
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          this.messageDown();
        }
      },
      deep: true,
    },
  },
  methods: {
    // 来的消息显示在最下面
    messageDown() {
      let that = this;
      this.$nextTick(() => {
          that.$refs.chatInfo.scrollTop = that.$refs.chatInfo.scrollHeight;
      });
    },
    // 图片显示延迟显示
    loadImg(){
     this.messageDown()
    },
    // 查看图片
    imageView(index, data) {
      let imageViewList = [];
      this.messages.filter(item => {
        if (item.type === 1) {
          item.content && imageViewList.push(item.content);
          item.message && imageViewList.push(item.message);
        }
      });
      ImagePreview({
        images: imageViewList,
        closeable: true,
        showIndex: false,
        loop: false,
        getContainer: ".chat_content",
        startPosition: imageViewList.indexOf(data)
      });
    },
    // 下载文件
    downloadFile(content, fileName) {
      try {
        let dUrl;
        typeof content == "string"? dUrl= content:dUrl= content.src
         if( dUrl.split('.').pop() === 'pdf'|| dUrl.split('.').pop() ==='txt'){
            var request = new XMLHttpRequest();
            request.responseType = "blob";
            request.open("GET", dUrl,true);
            request.onload = function(e) {
                var url = window.URL.createObjectURL(request.response);
                var a = document.createElement("a");
                document.body.appendChild(a);
                a.href = url;
                a.download = fileName
                a.click();
            }
            request.send();
         }else {
          let aLink = document.createElement("a");
          let evt = document.createEvent("HTMLEvents");
          evt.initEvent("click", true, true); //initEvent 不加后两个参数在FF下会报错  事件类型，是否冒泡，是否阻止浏览器的默认行为
            aLink.href = dUrl;
            aLink.download = fileName;
          
          aLink.click();
         }
        

      } catch (error) {
        this.$toast("文件已过期！");
      }
    },
    // pc取消发送语音需要暂停处理
    pcCancel() {
      this.$emit("pcCancel");
    },
    // 播放语音
    playRecord(stream, index,isPlay) {
      this.$emit("playRecord", stream, index,isPlay);
    },
    // pc端发送语音
    stopRecorder() {
      this.$emit("stopRecorder");
    },
    // 评价
    submit(index, val) {
      this.$emit("submit", index, val);
    },
    getApicontent(id) {
      this.$emit("getApicontent", id);
    }
  },
  created() {},
  mounted() {
    this.messageDown();
  },
  // updated() {
  //   // 数据更新后就要执行一次
  //   this.messageDown();
  // }
};
</script>
<style lang='less' scoped>
</style>