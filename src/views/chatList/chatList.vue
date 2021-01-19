<template>
  <div class="chat_list_page">
    <p @click="test">点击</p>
    <van-sticky>
      <div class="title flex_center">
        <span>消息</span>
      </div>
    </van-sticky>
    <div class="list">
      <van-pull-refresh
        v-model="isLoading"
        @refresh="onRefresh"
        success-text="刷新成功"
      >
        <div
          v-for="(item, index) in $store.state.messageList"
          :key="index"
          style="marginBottom: 5px;"
        >
          <ChatListItem :chatInfo="item" @goChat="goChat"></ChatListItem>
        </div>
      </van-pull-refresh>
    </div>
  </div>
</template>

<script>
import ChatListItem from '@/components/chatBox/chatListItem.vue'
import { mapActions, mapState } from 'vuex'
import { setStorage } from '@/libs/utils.js'
export default {
  name: 'ChatList',
  components: {
    ChatListItem,
  },
  data() {
    return {
      list: this.messageList,
      isLoading: false,
    }
  },
  computed: {
    ...mapState(['username']),
    messageList() {
      return this.$store.state.messageList
    },
  },
  watch: {
    messageList(newVal, oldVal) {
      this.list = newVal
    },
  },
  sockets: {
    // connect:查看socket是否渲染成功
    connect() {},
  },
  methods: {
    ...mapActions(['getChatList', 'getUsersData']),
    goChat(data) {
      // 用户私聊
      if (data.uid) {
        this.$router.push({
          name: 'PrivateChat',
          query: {
            uid: data.uid,
          },
        })
      } else if (data.group_id) {
        // 群聊
        this.$router.push({
          name: 'GroupChat',
          query: {
            code: this.$store.state.code,
            group_id: data.group_id,
          },
        })
      } else {
        this.$router.push({
          name: 'ChatPage',
          query: {
            code: this.$store.state.code,
          },
        })
      }
    },
    onRefresh() {
      this.$store.commit('setMessageList', [])
      this.getChatList({
        username: this.username,
        seller_code: this.$store.state.userInfo.seller.seller_code,
      })
      this.isLoading = false
    },
    test() {
      this.$router.push({
        name: 'Test',
        query: {
          code: 2222,
          group_id: 445565,
        },
      })
    },
  },
  created() {},
  mounted() {
    if (
      Object.keys(this.$store.state.userInfo) <= 0 ||
      this.$route.query.username !== this.username
    ) {
      this.getUsersData({
        code: this.$store.state.code,
        username: this.$route.query.username ? this.$route.query.username : '',
      }).then((data) => {
        this.onRefresh()
      })
    } else {
      this.onRefresh()
    }
  },
}
</script>
<style lang="less" scoped>
.chat_list_page {
  height: 100%;
  .title {
    width: 100%;
    height: 50px;
    background-color: #eae8e7;
  }
  .list {
    overflow: auto;
    height: 100%;
    padding-bottom: 50px;
  }
}
/deep/.van-pull-refresh {
  height: calc(100vh - 50px);
}
</style>
