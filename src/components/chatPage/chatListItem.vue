<template>
  <div class="chat_item" @click="goChat(chatInfo.id)">
    <div class="flex_align">
      <img class="chat_item_pic" :src="chatInfo.group_avatar" alt />
      <p class="chat_item_title">{{chatInfo.group_name}}</p>
    </div>
    <p class="chat_unread">
      <span>12.33</span>
      <span class="chat_message">{{0}}</span>
    </p>
  </div>
</template>

<script>
export default {
  name: "ChatListItem",
  props: {
    chatInfo: {
      type: Object,
      default: () => {
        return {};
      }
    }
  },
  components: {},

  data() {
    return {};
  },
  computed: {},
  watch: {},
  methods: {
    goChat() {
      this.$emit("goChat", this.chatInfo);
    }
  },
  created() {},
  mounted() {}
};
</script>
<style lang='less' scoped>
.chat_item {
  height: 55px;
  border-bottom: 0.5px solid #eee;
  padding: 0 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  .chat_item_pic {
    width: 32px;
    height: 32px;
    border-radius: 5px;
  }
  .chat_item_title {
    color: #ccc;
    font-size: 14px;
    margin-left: 10px;
  }
  .chat_unread {
    font-size: 8px;
    color: #ccc;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    .chat_message {
      width: 16px;
      height: 16px;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background-color: crimson;
    }
  }
}
</style>