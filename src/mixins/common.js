import {
  getNews
} from "@/api/chat.js";
const appData = require("@/assets/emojis.json");
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
        announcement:{}
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
          if (newVal.length >= 128) {
             this.sendText = newVal.slice(0, 10);
           }
        },
      },
    methods: {
        getUserInfo(callback) {
            // let bool
            //    if(this.$route.query.username && Object.keys(this.userInfo).length > 0 ){
            //     bool= this.$route.query.username !== this.userInfo.data.username
            // }else {
            //   bool=Object.keys(this.userInfo).length <= 0
            // }
          // if (bool ) {
            this.loading = true
            let params ={
              login_ip: this.userIp.ip,
              area: this.userIp.address,
              username: this.$route.query.username
                ? this.$route.query.username
                : this.username,
              is_tourist: this.$route.query.username ? 2 : 0
            }
            if(this.$route.query.code){
              params.code= this.$route.query.code
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
          // } else {
          //   callback()
          // }
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
    },
    created() {
        this.code != this.$route.query.code &&
          this.$store.commit("setCode", this.$route.query.code); 
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
        });
        window.addEventListener("resize", function() {
            that.screenWidth = document.body.offsetWidth;
          });
    }
  };
}
