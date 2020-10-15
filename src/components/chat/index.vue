<template>
 <div class="chat_info" ref="chatInfo">
        <div class="who_chat flex_center">
          <p class="go_back" >
            <van-icon
              class="iconfont"
              class-prefix="icon"
              name="fanhui"
              size="25px"
              @click.stop="()=>{
                $router.push({name:'ChatList',query:{
                  username
                }})
              }"
            ></van-icon>
          </p>
          <p>{{chatUser}}</p>
        </div>
        <div class="chat_content">
          <div class="flex_center prompt">
            <p>{{$store.state.userInfo.seller ? $store.state.userInfo.seller.hello_word :""}}</p>
          </div>
          <div v-for="(item,index) in messages" :key="index">
            <div class="flex_center" style="color:#ccc; fontSize:12px">
              <p>{{ isViewDate(index) ?item.create_time:''}}</p>
            </div>
            <div class="record" v-if="item.from_name != username && !item.kefu_name">
              <img class="head_portrait" :src="item.from_avatar" alt />
              <div style="margin: 0 10px;">
                <span style="font-size: 14px;color:#ccc">{{item.from_name}}</span>
                <span v-if="item.type=== 0" class="content left">{{item.content || item.message}}</span>
                <p v-else-if="item.type=== 1" class="content left" style="padding:0">
                  <img
                    @click="imageView(index,item.content)"
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
                  <div class="file_name">
                    <span
                      style="color:#007aff"
                    >{{item.message&&item.message.filename || item.file_alias}}</span>
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
                    playRecord( item.content?item.content: item.message.src,index)
                    }"
                    :isPlay="item.message ?item.message.play:item.play"
                    :data="item"
                  ></Audio>
                </div>
                <div v-if="item.endChat" class="score">
                  <p class="score_title">请你对本次服务进行评分</p>
                  <van-rate v-model="item.scoreNum" allow-half void-icon="star" color="#ffd21e" />
                  <van-field
                    v-model="item.scoreMessage"
                    rows="2"
                    autosize
                    type="textarea"
                    maxlength="50"
                    placeholder="欢迎给我们的服务提意见~"
                    show-word-limit
                  />
                  <p
                    :class="['submit',item.scoreMessage.length ||item.scoreNum ?'activity_submit':'' ]"
                    @click="submit(index)"
                  >提交</p>
                </div>
              </div>
            </div>
            <div
              class="record record_right"
              v-else-if="item.from_name == username&&!item.kefu_name "
            >
              <div style="margin: 0 10px;">
                <p style="text-align: end;font-size: 14px;color:#ccc">{{username}}</p>
                <span v-if="item.type=== 0" class="content right">{{item.message || item.content}}</span>
                <p v-else-if="item.type=== 1" class="content right" style="padding:0">
                  <img
                    @click="imageView(index,item.content)"
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
                      style="color:#007aff"
                    >{{item.message && item.message.filename || item.file_alias}}</span>
                    <span
                      style="color: #ccc;margin: 6px;font-size: 10px;"
                    >{{item.message&&item.message.filesize || item.file_alias }}</span>
                  </div>
                </div>
                <div v-else-if="item.type=== 3" class="content right">
                  <Audio
                    @play="(isPlay)=>{
                   playRecord(item.content?item.content: item.message.src,index)
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
export default {
name:'Chat',
components: {},
data() {
return {

}
},
computed: {},
watch: {},
methods: {

},
created() {

},
mounted() {

},
}
</script>
<style lang='less' scoped>

</style>