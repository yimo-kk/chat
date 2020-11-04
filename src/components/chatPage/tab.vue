<template>
  <div class="tabs">
    <ul class="tab">
      <!-- <li
        :class="['tab_item',item.id==activteId ?'tab_item_activte':'']"
        v-for="item in tabs"
        :key="item.id"
        @click="activtTab(item.id)"
        v-show=" chatType == item.id"
      >{{item.name}}</li>-->
      <li
        :class="['tab_item',activteId==1 ?'tab_item_activte':'']"
        @click="activtTab(1)"
        v-show=" chatType == 1"
      >{{$t('problem')}}</li>
      <li
        :class="['tab_item',activteId==2 ?'tab_item_activte':'']"
        @click="activtTab(2)"
        v-show=" chatType == 2"
      >{{this.$t('groupMember')}}</li>
      <!-- <li :class="['tab_item',activteId==3 ?'tab_item_activte':'']" @click="activtTab(3)">公告</li> -->
    </ul>
  </div>
</template>
<script>
export default {
  name: "Tab",
  props: {
    tabs: {
      type: Array
    },
    chatType: {
      type: Number
    }
  },
  data() {
    return {
      activteId: this.chatType
    };
  },
  methods: {
    activtTab(id) {
      this.activteId = id;
      this.$emit("activtTab", id);
    }
  }
};
</script>
<style lang="less" scoped>
.tabs {
  position: relative;
  .tab {
    padding-left: 5px;
    display: flex;
    align-items: center;
    height: 50px;
    .tab_item {
      padding: 8px 5px;
      position: relative;
      cursor: pointer;
      font-size: 14px;
    }
    .tab_item_activte {
      font-size: 16px;
      &::after {
        content: "";
        width: 30px;
        height: 2px;
        background-color: rgb(197, 24, 24);
        position: absolute;
        bottom: -3px;
        left: 50%;
        z-index: 333;
        transform: translateX(-50%);
      }
    }
  }
  &::after {
    content: "";
    width: 100%;
    height: 0.5px;
    background-color: #eee;
    position: absolute;
    bottom: 0;
    left: 0;
  }
}
</style>