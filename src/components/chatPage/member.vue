<template>
  <div class="member">
    <img class="member_img" :src="name.headimg" alt="">
    <!-- <i class="icon iconfont icon-yonghuguanli1"></i> -->
    <p class="name dwote">{{name.username}}{{(name.groupKefu&&name.groupKefu.length) || name.isAdmin | isAdmin}}</p>
  </div>
</template>

<script>
export default {
  name: "Member",
  props: {
    name: {
      type: Object,
      default(){
        return {}
      }
    }
  },
  filters: {
     isAdmin(val){
      if(typeof name.isAdmin == 'object'){
        let bool = val.groupKefu.some(item=>{
          return item== this.$store.state.Socket.gid
        })
        return bool ? '(管理员)':''
      }else {
        return val ? '(管理员)':''
      }
    }
  },
};
</script>
<style lang='less' scoped>
.member {
  margin: 10px 10px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  height: 30px;
  cursor: pointer;
  // border-bottom: 1px solid #ccc;
  .name {
    margin: 0 10px;
  }
  .member_img{
    width: 2rem;
    height: 2rem;
    border-radius: .5rem;
  }
}
</style>