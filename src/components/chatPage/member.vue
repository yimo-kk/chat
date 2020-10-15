<template>
  <div class="member">
    <i class="icon iconfont icon-yonghuguanli1"></i>
    <p class="name dwote">{{name}}</p>
  </div>
</template>

<script>
export default {
  name: "Member",
  props: {
    name: {
      type: String,
      default: ""
    }
  },
  components: {},
  data() {
    return {};
  },
  computed: {},
  watch: {},
  methods: {},
  created() {},
  mounted() {}
};
</script>
<style lang='less' scoped>
.member {
  margin: 8px 10px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  height: 30px;
  cursor: pointer;
  // border-bottom: 1px solid #ccc;
  .name {
    margin: 0 10px;
  }
}
</style>