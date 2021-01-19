<template>
  <div class="other">
    <Tab @activtTab="activtTab" :chatType="chatType" :tabs="tabList"></Tab>
    <div v-if="activateId == 1" class="question">
      <div
        v-for="(item, index) in questionData"
        :key="item.question_id"
        style="marginBottom: 5px;"
      >
        <div class="question_item" @click="clickQuestion(index)">
          <p class="dwote" :title="item.question">
            <i class="icon iconfont icon-iconfontzhizuobiaozhun19 iconFont"></i>
            {{ item.question }}
          </p>
        </div>
        <p v-show="item.isShow" class="question_answer">{{ item.answer }}</p>
      </div>
    </div>
    <div v-else-if="activateId == 2" class="group_list">
      <div v-for="(item, index) in groupMemberList" :key="index">
        <Member :name="item"></Member>
      </div>
    </div>
  </div>
</template>

<script>
import Tab from '@/components/chatBox/tab.vue'
import Member from '@/components/chatBox/member.vue'
export default {
  name: 'PcChatList',
  props: {
    chatType: {
      type: Number,
    },
    groupMemberList: {
      type: Array,
      default() {
        return []
      },
    },
    questionList: {
      type: Array,
      default() {
        return []
      },
    },
  },
  components: {
    Tab,
    Member,
  },
  data() {
    // 暂时只有客服1和群2，私人3暂时没做
    return {
      isShow: false,
      questionData: JSON.parse(JSON.stringify(this.questionList)),
      activateId: this.chatType,
      tabList: [
        {
          id: 1,
          name: this.$t('groupMember'),
        },
        {
          id: 2,
          name: this.$t('problem'),
        },
        {
          id: 3,
          name: this.$t('announcement'),
        },
      ],
    }
  },
  computed: {},
  watch: {
    questionList: {
      handler(newVal) {
        this.questionData = JSON.parse(JSON.stringify(newVal))
      },
      deep: true,
    },
  },
  methods: {
    activtTab(id) {
      this.activateId = id
      this.$emit('activtTab', id)
    },
    chatMessage(value) {
      // this.$emit("chatMessage", value);
    },
    clickQuestion(val) {
      if (this.questionData[val].isShow) {
        this.questionData[val].isShow = !this.questionData[val].isShow
        return
      }
      this.questionData.map((item, index) => {
        if (index === val) {
          item.isShow = true
        } else {
          item.isShow = false
        }
      })
    },
  },
  created() {},
  mounted() {},
}
</script>
<style lang="less" scoped>
.group_list {
  padding: 10px 0;
  overflow: auto;
  height: 90%;
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
}
.question {
  padding: 10px;
  .question_item {
    display: flex;
    align-items: center;
    font-size: 14px;
    line-height: 20px;
    cursor: pointer;
    .iconFont {
      font-size: 12px;
    }
  }
  .question_answer {
    margin-left: 12px;
    padding: 5px;
    color: #585858;
    white-space: pre-line;
    font-size: 0.8rem;
  }
}
</style>
