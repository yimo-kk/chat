import {
  getNews,
  serviceSendChatFile,
  getNewsList
} from "@/api/chat.js";
import { isIE,conversion,conversionFace } from "@/libs/utils.js";
const appData = require("@/assets/emojis.json");
import { mapState } from "vuex";
import Recorder from "js-audio-recorder";
let recorderData
if(!isIE()){
  recorderData = new Recorder({
  sampleBits: 8, // 采样位数，支持 8 或 16，默认是16
  sampleRate: 22050, // 采样率，支持 11025、16000、22050、24000、44100、48000，根据浏览器默认值，我的chrome是48000
  numChannels: 1 // 声道，支持 1 或 2， 默认是1e
});
}
export default function() {
  return {
    data() {
      return {
        faceShow: false,
        faceList: [],
        getBrowString: "",
        sendText: "",
        screenWidth: document.body.offsetWidth,
        isButtom: document.body.offsetWidth < 540,
        announcement:{},
        btnText:'按住 说话',
        recorder:recorderData,
        isAudio: false, // 录音时的波浪
        drawRecordId: null,
        oCanvas: null,
        ctx: null,
      };
    },
    watch: {
        screenWidth(val) {
          if(val < 540){
            this.isButtom = true
          }else {
            this.isButtom = false
          }
        },
        sendText(newVal){
          if(!newVal)return
          var str = conversion(newVal)
          console.log(str.length)
          if (str.length >= 128) {
            var string = str.slice(0, 128)
            var arr = string.split('[')
            arr.forEach((item,index)=>{
              if(index >0 &&item.indexOf(']') === -1 ){
                arr.pop()
              }
            })
           this.sendText = conversionFace(arr.join('['))
         }else {
          this.sendText = conversionFace(str)
         }
        },
      },
      computed: {
        ...mapState(["userInfo", "code", "gid", "username", "userIp"]),
        isIE(){
          return !isIE()
        }
      },
    methods: {
        getUserInfo(callback) {
            this.loading = true
            let params ={
              login_ip: this.userIp.ip,
              area: this.userIp.address,
              username: this.$route.query.username || this.username ,
              is_tourist: this.$route.query.username ? 2 : 0
            }
            if(this.$store.state.code){
              params.code= this.$store.state.code
            }
            this.$store
              .dispatch("getUsersData",params )
              .then((res) => {
               if(res.code === 2 || res.code === 6){
                 res.state = true
                 this.isGroupUser = res
                 this.loading = false
                return
               }
                callback()
              })
              .catch(err => {
                  this.loading = false
                this.$toast(err.msg);
              });
        },
        enter(event) {
            if (event.keyCode === 13 && event.ctrlKey ||event.altKey) {
             this.sendText +='\n'
           }else if(event.keyCode === 13 &&event.shiftKey){
             // shitt+回车自带换行
           }else if (event.keyCode === 13 ) {
             this.sendType = 0;
             event.preventDefault();
             this.send(this.sendText);
           }
        },
        faceContent() {
            this.faceShow = !this.faceShow;
            if (this.faceShow == true) {
              for (let i in appData) {
                this.faceList.push(appData[i]);
              }
            } else {
              this.faceList = [];
            }
        },
        getBrow(index) {
            for (let i in this.faceList) {
              if (index == i) {
                this.getBrowString = this.faceList[index].char;
                this.sendText += this.getBrowString;
              }
            }
        },
        textSend() {
            this.sendType = 0;
            this.send(this.sendText);
        },
        // 公告
        getNewsList(seller_code){
          return new Promise( async (resolve, reject) => {
           await getNewsList(seller_code)
            .then((result) => {
              resolve(result.data);
            }).catch((err) => {
              reject(err);
            });
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
        },
        record(callback) {
          this.sendType = 3;
          this.getPermission(callback);
        },
          // 提前获取录音权限
        getPermission(callback) {
          Recorder.getPermission().then(
            () => {
              if (this.isButtom) {
                this.isAudio = !this.isAudio;
              } else {
                this.Pcrecord = !this.Pcrecord;
                this.startRecorder(callback);
              }
            },
            error => {
              this.$toast("暂无录音权限！请重新授权");
            }
          );
        },
        // 录音
        startRecord(event,callback) {
          event.preventDefault(); //阻止浏览器默认行为
          this.posStart = 0;
          this.posStart = event.touches[0].pageY; //获取起点坐标
          this.btnText = "松开 结束";
          this.isMask = true;
          this.startRecorder(callback);
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
        endRecord(event,callback) {
          if(this.outTime)return
          event.preventDefault();
          this.posEnd = 0;
          this.posEnd = event.changedTouches[0].pageY; //获取终点坐标
          this.btnText = "按住 说话";
          this.isMask = false;
          if (this.posStart - this.posEnd < 100) {
            this.stopRecorder(callback)
          } else {
            this.recorder.stop();
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
        startRecorder(callback) {
          let that = this
          this.recorder.start().then(
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
          this.recorder.onprogress = function(params) {
            if(params.duration>=59.5){
              that.stopRecorder(callback)
              that.btnText = "按住 说话";
              that.isMask = false;
              that.outTime=true
            }
        } 
        },
        // 结束录音
        stopRecorder(callback) {
          this.Pcrecord = false;
          if (this.recorder.isServe) return;
          this.recorder.stop();
          this.drawRecordId && cancelAnimationFrame(this.drawRecordId);
          this.drawRecordId = null;
          if (this.recorder.duration < 1) {
            this.$toast("说话时间太短了");
            return;
          }
          let dataMp3 = this.recorder.getWAVBlob();
          var fileName = new Date().valueOf() + "." + "wav";
          const formdata = new FormData();
          formdata.append("name", fileName);
          formdata.append("file", dataMp3);
          this.loading=true
          this.outTime =false
          callback(formdata)
          // uploadVoice({
          //   params: formdata,
          //   seller_code: this.userInfo.seller.seller_code
          // })
          //   .then(result => {
          //     this.loading=false
          //     let data = result.data.data;
          //     data.duration = Math.round(recorder.duration);
          //     this.send(data);
          //   })
          //   .catch(err => {
          //     this.loading=false
          //   });
        },
        /**
         * 绘制波浪图-录音
         * */
        drawRecord() {
          // 用requestAnimationFrame稳定60fps绘制
          this.drawRecordId = requestAnimationFrame(this.drawRecord);
          // 实时获取音频大小数据
          let dataArray =this. recorder.getRecordAnalyseData(),
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
          this.recorder.stop();
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
    },
    created() {
        // this.code != this.$route.query.code &&
        //   this.$store.commit("setCode", this.$route.query.code); 
      },
    mounted () {
        // 点击表情框以外就隐藏
        let that = this;
        document.addEventListener("click", function (e) {
          let flag = e.target.contains(
            document.getElementsByClassName("click_head_portrait")[0]
          );
          if (flag) return;
          that.faceShow = false;
          that.faceList =[]
        });
        window.addEventListener("resize", function() {
            that.screenWidth = document.body.offsetWidth;
          });
          this.startCanvas();
        }
  };
}
