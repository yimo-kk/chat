<template>
  <div class="announcement">
    <div  class="mask" @click="close"></div>
    
    <div class="announcement_list">
      <div class="close flex_center">
        <van-icon
          class="iconfont"
          class-prefix="icon"
          name="chacha"
          size="1.5rem"
          @click="close"
        ></van-icon>
      </div>
      <h4 class="new-title">公告</h4>
     <div>
        <p v-for="(item,index) in newList" :key="item.news_id" class="newList-item"> 
          <span class="content">{{`${index+1}.${item.content}`}}</span>
          <span class="time">{{item.create_time}}</span>
        </p>
     </div>
    </div>
  </div> 
</template> 

<script>
export default {
  name: "viewAnnouncement",
  components: {},
  props:{
    newList:{
      type:Array,
      default:()=>{
        return []
      }
    }
  },
  data() {
    return {};
  },
  computed: {},
  watch: {},
  methods: {
  
    close() {
      this.$emit("close");
    }
  },
  created() {},
  mounted() {}
};
</script>
<style lang='less' scoped>
.announcement {
  .mask{
    position: fixed;
    top: 0;
    left: 0;
    z-index: 33;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.3);
  }
  .announcement_list {
    position: absolute;
    top:50%;
    left: 50%;
    transform: translate(-50%,-50%);
    overflow: auto;
    max-height: 60%;
    min-height: 20%;
    width: 80%;
    background: #fff;
    padding: 5px;
    border-radius: 5px;
    z-index: 222;
    .new-title{
      text-align: center;
      padding: 5px;
    }
    .newList-item{
      padding: 10px;
      .content{
      line-height: 1.5rem;
      word-break: break-word;
    }
    .time{
      margin-left: 5px;
      color: #ccc;
      word-break: break-word;
      display: block;
    }
    }
    
  }
  .close {
    position: absolute;
    top: .5rem;
    right: .5rem;
    background-color: #eee;
    border-radius: 50%;
  }
}
</style>