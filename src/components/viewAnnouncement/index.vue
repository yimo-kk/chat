<template>
  <div class="announcement">
    <div class="close flex_center">
      <van-icon
        class="iconfont"
        class-prefix="icon"
        name="chacha"
        size="2rem"
        @click="close"
      ></van-icon>
    </div>
    <div class="announcement_list">
      <h4 class="new-title">公告</h4>
      <p v-for="(item,index) in newList" :key="item.news_id" class="newList-item"> 
       <span class="content">{{`${index+1}.${item.content}`}}</span>
       <span class="time">{{item.create_time}}</span>
      </p>
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
  position: fixed;
  top: 0;
  left: 0;
  z-index: 333;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  .announcement_list {
    overflow: auto;
    max-height: 60%;
    min-height: 20%;
    max-width: 80%;
    min-width: 60%;
    background: #fff;
    padding: 5px;
    border-radius: 5px;
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
    top: 1.8rem;
    right: 1.8rem;
    background-color: #eee;
    border-radius: 50%;
  }
}
</style>