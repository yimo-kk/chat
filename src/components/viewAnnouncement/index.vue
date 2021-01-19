<template>
  <div class="announcement">
    <div class="mask" @click="close"></div>

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
      <h4 class="new-title">最新公告</h4>
      <div class="newList">
        <p v-for="item in newList" :key="item.news_id" class="newList-item">
          <span class="content">{{ `${item.content}` }}</span>
          <span class="time">{{ item.create_time }}</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'viewAnnouncement',
  components: {},
  props: {
    newList: {
      type: Array,
      default: () => {
        return []
      },
    },
  },
  data() {
    return {}
  },
  computed: {},
  watch: {},
  methods: {
    close() {
      this.$emit('close')
    },
  },
  created() {},
  mounted() {},
}
</script>
<style lang="less" scoped>
.announcement {
  .mask {
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
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    max-height: 30rem;
    min-height: 20%;
    width: 80%;
    background: #fff;
    padding: 5px;
    border-radius: 5px;
    z-index: 222;
    .new-title {
      font-size: 1.2rem;
      font-weight: 500;
      color: #2472ff;
      text-align: center;
      padding: 1rem;
    }
    .newList {
      overflow: auto;
      background-color: #f9fbff;
      margin: 0 1.3rem 1.3rem;
      max-height: 24rem;
      .newList-item {
        padding: 10px;
        .content {
          // line-height: 1.5rem;
          word-break: break-word;
        }
      }
      &::-webkit-scrollbar {
        width: 4px;
        /*高宽分别对应横竖滚动条的尺寸*/
        // background-color: #fff;
        border-radius: 2px;
      }

      &::-webkit-scrollbar-thumb {
        border-radius: 2px;
        background: #d8d8d8;
      }

      .time {
        margin-left: 5px;
        color: #ccc;
        word-break: break-word;
        display: block;
        font-size: 0.5rem;
      }
    }
  }
  .close {
    position: absolute;
    top: 0.9rem;
    right: 0.9rem;
    background-color: #eee;
    border-radius: 50%;
  }
}
</style>
