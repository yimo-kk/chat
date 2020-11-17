<template>
  <div>
    <div v-if="messageState" class="message">
    <header class="message_header flex_center">
        <div class="go_back">
          <van-icon
            class="iconfont"
            class-prefix="icon"
            name="fanhui"
            size="20px"
            @click.stop="()=>{
                $router.go(-1)
                
              }"
          ></van-icon>
          <!--  localStorage.removeItem('seller_code') -->
        </div>
      <p>{{$t('message')}}</p>
    </header>
    <div class="message_content">
      <van-form @submit="onSubmit" label-width='5rem' class="my_form">
        <van-field
         v-if="userMessage.leave_email"
          v-model="mailbox"
           autocomplete="off"
          style="marginBottom:1rem"
          border
          name="mailbox"
          :label="$t('mailbox')"
          :placeholder="$t('yourEmail')"
          :rules="[{ required: true}]"
          clearable
        />
        <van-field
         v-if="userMessage.leave_phone"
          v-model="phone"
           autocomplete="off"
          style="marginBottom:1rem"
          border
          type="tel"
          name='phone'
          :label="$t('phone')"
          :placeholder="$t('yourPhone')"
          :rules="[{ required: true }]"
          clearable
        />
        <van-field
          v-model="message"
          rows="3"
          :autosize='{ maxHeight: 200, minHeight: 100 }'
          :label="$t('messages')"
          name="message"
          type="textarea"
          maxlength="200"
          :placeholder="$t('messageContent')"
          show-word-limit
          :rules="[{ required: true }]"
          border
          clearable
        />
        <div class="submit_box">
          <van-button round  type="info" native-type="submit"  class="buttom">
            {{$t('submit')}}
          </van-button>
        </div>
    </van-form>
    </div>
  </div>
  <!-- <div v-else>
    <van-empty :description="$t('messageSuccess')"></van-empty>
  </div> -->
  </div>
</template>

<script>
import {getSellerLeave,userLeave} from '@/api/message.js'
import {check} from '@/libs/utils.js'
import {mapState}from 'vuex'
export default {
  name: "Message",
  components: {},
  data() {
    return {
      mailbox:'',
      phone:'',
      message:'',
      userMessage:{},
      messageState:true
    };
  },
  computed: {
      ...mapState(["userInfo",'username']),
  },
  watch: {
  },
  methods: {
    onSubmit(data){
      if(this.userMessage.leave_phone && !check(data.phone,'phone')){
        this.$toast({
          message: this.$t('correctNumber'),
          position: 'top',
        })
        
        return
      }
      if(this.userMessage.leave_email && !check(data.mailbox,'idCard')){
        this.$toast({
           message: this.$t('correctEmail'),
          position: 'top',
        })
        return
      }
      userLeave({
        seller_code:this.userMessage.seller_code,
        phone:data.phone?data.phone:'',
        email:data.mailbox?data.mailbox:'',
        content:data.message,
        username:this.username
      })
      .then((result) => {
        // this.messageState= false
        this.$router.go(-1)
        sessionStorage.setItem('message',true)
      }).catch((err) => {
        console.log(err)
        this.$toast(err.msg)
      });
    },
    getInfo(){
      getSellerLeave({seller_code:this.userInfo.seller?this.userInfo.seller.seller_code : localStorage.getItem('seller_code')})
      .then((res)=>{
        this.userMessage = res.data
      })
    }
  },
  mounted() {
    this.getInfo()
  }
};
</script>
<style lang='less' >
@import "../../styles/message.less";

</style>
