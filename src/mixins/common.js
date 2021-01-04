import {
  getNews,
  serviceSendChatFile,
  getNewsList,
  userDecode
} from "@/api/chat.js";
import {
  isIE,
  // conversion,
  conversionFace,
  setStorage,
  getStorage,
  getQueryString,
  segmentation,
  createUserName
} from "@/libs/utils.js";
// const appData = require("@/assets/emojis.json");
import { emojisAmap, wChatToUi } from '@/assets/emjoy/emjoydata'
import { mapState, mapMutations } from "vuex";
import Recorder from "js-audio-recorder";
let recorderData
if (!isIE()) {
  recorderData = new Recorder({
    sampleBits: 8, // 采样位数，支持 8 或 16，默认是16
    sampleRate: 22050, // 采样率，支持 11025、16000、22050、24000、44100、48000，根据浏览器默认值，我的chrome是48000
    numChannels: 1 // 声道，支持 1 或 2， 默认是1e
  });
}
export default function () {
  return {
    data () {
      return {
        faceShow: false,
        faceList: [],
        getBrowString: "",
        sendText: "",
        screenWidth: document.body.offsetWidth,
        isButtom: document.body.offsetWidth < 540,
        announcement: {},
        btnText: '按住 说话',
        recorder: recorderData,
        isAudio: false, // 录音时的波浪
        drawRecordId: null,
        oCanvas: null,
        ctx: null,
        userIp: {
          ip: '',
          address: ''
        },
        isClose: false
      };
    },
    watch: {
      screenWidth (val) {
        if (val < 540) {
          this.isButtom = true
        } else {
          this.isButtom = false
        }
      },
      sendText (newVal) {
        if (!newVal) return
        // var str = conversion(newVal)
        var str = newVal
        if (str.length >= 188) {
          this.$toast(this.$t('overLimit'))
          var string = str.slice(0, 188)
          var arr = string.split('[')
          arr.forEach((item, index) => {
            if (index > 0 && item.indexOf(']') === -1) {
              arr.pop()
            }
          })
          // this.sendText = conversionFace(arr.join('['))
          this.sendText = arr.join('[')
        }
        // else {
        //   this.sendText = conversionFace(str)
        // }
      },
    },
    computed: {
      ...mapState(["userInfo", "code", "gid", "username", 'kefu_code', 'isQuestion', 'carryPassword']),
      isIE () {
        return !isIE()
      },
      chatTime () {
        if (Object.keys(this.userInfo).length) {
          return this.userInfo.seller.chat_time
        } else {
          return 0
        }
      }
    },
    methods: {
      ...mapMutations(['setLevel', 'setIsQuestion', 'setCarryPassword']),
      getUserInfo (callback) {
        let params = {
          username: this.username,
        }
        if (this.code) {
          params.code = this.code
          // 获取等级level 
          JSON.parse(getStorage(this.code))[this.username] && (params.level = JSON.parse(getStorage(this.code))[this.username].level)
        }
        this.loading = true
        this.$store
          .dispatch("getUsersData", params)
          .then((res) => {
            this.loading = false
            if (res.code === 2 || res.code === 6) {
              res.state = true
              this.isGroupUser = res
              return
            }
            this.userIp = {
              ip: res.data.login_ip,
              address: res.data.area
            }
            this.setIsQuestion(res.seller.is_question)
            callback && callback()
          })
          .catch(err => {
            console.log(err)
            this.$dialog.alert({
              message: err.data.msg,
              showConfirmButton: false,
              showCancelButton: false,
            })
            this.loading = false
          });
      },
      enter (event) {
        if (event.keyCode === 13 && event.ctrlKey || event.altKey) {
          this.sendText += '\n'
        } else if (event.keyCode === 13 && event.shiftKey) {
          // shitt+回车自带换行
        } else if (event.keyCode === 13) {
          this.sendType = 0;
          event.preventDefault();
          this.send(this.sendText);
        }
      },
      faceContent () {
        this.faceShow = !this.faceShow
        if (this.faceShow == true) {
          for (let key in emojisAmap) {
            let obj = {}
            obj[key] = emojisAmap[key]
            obj.name = `[${key}]`
            obj.oldName = key
            this.faceList.push(obj)
          }
          for (let key in wChatToUi) {
            let obj = {}
            obj[wChatToUi[key]] = key
            obj.name = wChatToUi[key]
            obj.oldName = key
            this.faceList.push(obj)
          }
        } else {
          this.faceList = []
        }
        // this.faceShow = !this.faceShow;
        // if (this.faceShow == true) {
        //   for (let i in appData) {
        //     this.faceList.push(appData[i]);
        //   }
        // } else {
        //   this.faceList = [];
        // }
      },
      getBrow (index) {
        for (let i in this.faceList) {
          if (index == i) {
            // this.getBrowString = this.faceList[index].char;
            // this.sendText += this.getBrowString;
            this.sendText += `[${this.faceList[index].oldName}]`
          }
        }
      },
      textSend () {
        this.sendType = 0;
        this.send(this.sendText);
      },
      // 公告
      getNewsList (seller_code) {
        return new Promise(async (resolve, reject) => {
          await getNewsList(seller_code)
            .then((result) => {
              resolve(result.data);
            }).catch((err) => {
              reject(err);
            });
        });

      },
      getNewsData (seller_code) {
        getNews({ seller_code })
          .then(result => {
            if (result.data.code === 0) {
              if (!Array.isArray(result.data.data)) {
                this.announcement = result.data.data;
              }
            }
          })
          .catch(err => {
            this.$toast(this.$t('timeOut'));
          });
      },
      record (callback) {
        this.sendType = 3;
        this.getPermission(callback);
      },
      // 提前获取录音权限
      getPermission (callback) {
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
            this.$toast(this.$t('noRecording'));
          }
        );
      },
      // 录音
      startRecord (event, callback) {
        event.preventDefault(); //阻止浏览器默认行为
        this.posStart = 0;
        this.posStart = event.touches[0].pageY; //获取起点坐标
        this.btnText = "松开 结束";
        this.isMask = true;
        this.startRecorder(callback);
      },
      // 上滑取消
      slideRecord (event) {
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
      endRecord (event, callback) {
        if (this.outTime) return
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
      startCanvas () {
        //录音波浪
        this.oCanvas = document.getElementById("canvas");
        this.oCanvas.style.width = 70 + 'vw'
        this.oCanvas.style.borderRadius = 6 + 'px'
        this.ctx = this.oCanvas.getContext("2d");
      },
      // 开始录音
      startRecorder (callback) {
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
        this.recorder.onprogress = function (params) {
          if (params.duration >= 59.5) {
            that.stopRecorder(callback)
            that.btnText = "按住 说话";
            that.isMask = false;
            that.outTime = true
          }
        }
      },
      // 结束录音
      stopRecorder (callback) {
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
        this.loading = true
        this.outTime = false
        callback(formdata)
      },
      /**
       * 绘制波浪图-录音
       * */
      drawRecord () {
        // 用requestAnimationFrame稳定60fps绘制
        this.drawRecordId = requestAnimationFrame(this.drawRecord);
        // 实时获取音频大小数据
        let dataArray = this.recorder.getRecordAnalyseData(),
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
      playRecord (stream, index, bool) {
        this.currentIndex = index;
        let audio = this.$refs.audio
        if (bool) {
          audio.src = '';
          this.messages.forEach((item) => {
            item.type == 3 && item.message ? (item.message.play = false) : (item.play = false);
            item.type == 0 && (item.play = false)
          })
        } else {
          this.recordOne(index);
          if (window.URL) {
            audio.src = stream;
          } else {
            audio.src = event;
          }
          audio.autoplay = true;
        }
      },
      playEnd () {
        this.messages.forEach(item => {
          if (item.type == 3 || item.type == 0) {
            item.type == 3 && item.message ? (item.message.play = false) : (item.play = false);
            item.type == 0 && (item.play = false)
          }
        });
      },
      // 只能播放一个其他全为flase
      recordOne (value) {
        this.messages.forEach((item, index) => {
          if (index === value) {
            item.type == 3 && (item.message ? (item.message.play = true) : (item.play = true))
            item.type == 0 && (item.play = true)
          } else {
            item.type == 3 && (item.message ? (item.message.play = false) : (item.play = false))
            item.type == 0 && (item.play = false)
          }
        });
      },
      // pc取消发送语音需要暂停处理
      pcCancel () {
        this.Pcrecord = false;
        this.recorder.stop();
      },
      // 上传文件
      uploadeFile (file) {
        this.sendType = 2;
        this.loading = true
        const formdata = new FormData();
        formdata.append("filedata", file.file);
        formdata.append("filename", file.file.name);
        serviceSendChatFile(formdata)
          .then(result => {
            if (result.data.code == 0) {
              this.send(result.data.data);
              this.loading = false
            } else {
              this.$toast(result.data.msg)
              this.loading = false
            }
          })
          .catch(err => {
            this.loading = false
          });
      },
      handleBusinessUser (code, { username, group_id = '', level = 0 }) {
        this.setLevel(level)
        let obj = {}
        let valueObj = { 'kefu_code': '', 'level': level, 'groupList': [{ 'group_id': group_id, }] } //'isPassword': false 
        if (getStorage(code)) {
          obj = JSON.parse(getStorage(code))
          let nowObj = {}
          if (Object.keys(obj)[0] !== username) {
            nowObj[username] = valueObj
            setStorage(code, JSON.stringify(nowObj))
          } else {
            let isExist = false
            obj[username]['groupList'] && obj[username]['groupList'].forEach(item => {
              if (item.group_id == group_id) {
                isExist = true
              }
            })
            if (!isExist && group_id) {
              obj[username]['groupList'].push({ 'group_id': group_id || '' }) // 'isPassword': false 
            }
            setStorage(code, JSON.stringify(obj))
          }
        } else {
          obj[username] = valueObj
          setStorage(code, obj);
        }
        this.$store.commit("setUsername", username);
        this.$store.commit("setCode", code);
        group_id &&
          this.$store.commit("setGroupId", group_id);
      },
      // 商家:{用户名:{客服名:客服,群id:id,isPassword:false,password:null}}
      // 判断是否有商家code等参数
      judgment (fn) {
        return new Promise(async (resolve, reject) => {
          let u = getQueryString('u')
          let code = getQueryString('code')
          this.loading = true
          if (u) {
            await userDecode({ u, code })
              .then((result) => {
                this.loading = false
                if (!result.data.data) {
                  this.$dialog.alert({
                    message: this.$t('merchantError'),
                    showConfirmButton: false,
                    showCancelButton: false
                  })
                  return
                }
                result.data.code === 1 && this.setCarryPassword(true)
                let data = segmentation(result.data.data)
                // 当解密没有name时创建一个随机name
                if (!data.username) {
                  (getStorage(code) && Object.keys(JSON.parse(getStorage(code))).length) ?
                    data.username = Object.keys(JSON.parse(getStorage(code)))[0] :
                    data.username = createUserName()
                }
                this.handleBusinessUser(code, data)
                resolve()
              })
              .catch(err => {
                console.log(err)
                reject(err);
              });
          } else {
            let business = getStorage(code)
            let name = business && Object.keys(JSON.parse(business))[0]
            let data = {
              username: name || createUserName()
            }
            this.handleBusinessUser(code, data)
            resolve()
          }
        })
      },
      // 检查浏览器判断 刷新关闭
      closed () {
        // window.onbeforeunload = function () {
        //   let time = new Date().getTime()
        //   // 谷歌,edg先执行 火狐,ie后执行
        //   localStorage.setItem('onbeforeunload', time)
        // }
        // window.onunload = function () {
        //   // 火狐,ie先执行 谷歌,,edg后执行
        //   let time = new Date().getTime()
        //   localStorage.setItem('onunload', time)
        // }
        let that = this
        let userAgent = navigator.userAgent; //取得浏览器的userAgent字符串  
        let isOpera = userAgent.indexOf("Opera") > -1; //判断是否Opera浏览器  
        let isIE = userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1 && !isOpera; //判断是否IE浏览器
        let isIE11 = userAgent.indexOf("rv:11.0") > -1; //判断是否是IE11浏览器
        let isEdge = userAgent.indexOf("Edge") > -1 && !isIE; //判断是否IE的Edge浏览器
        if (!isIE && !isEdge & !isIE11) {//兼容chrome和firefox iE暂时不管
          var _beforeUnload_time = 0, _gap_time = 0;
          var is_fireFox = navigator.userAgent.indexOf("Firefox") > -1;//是否是火狐浏览器
          window.onunload = function () {
            _gap_time = new Date().getTime() - _beforeUnload_time;
            if (_gap_time <= 3) {
              that.$socket.emit('message', {
                cmd: 'userClose',
                message: '23333333333'
              })
            } else {//浏览器刷新
              console.log('刷新')
            }
          }
          window.onbeforeunload = function () {
            _beforeUnload_time = new Date().getTime();
            if (is_fireFox) {//火狐关闭执行
              console.log('关闭333')
            }
          };
        }
      }
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
        that.faceList = []
      });
      window.addEventListener("resize", function () {
        that.screenWidth = document.body.offsetWidth;
      });
      this.startCanvas();
      // 测试刷新 关闭
      // this.closed()
    }

  };
}
