<template>
  <div class="record_content" @click="audio">
    <p
      class="time"
      style="marginleft:10px"
      v-if="playdata.from_name === $store.state.username && time"
    >
      {{ playdata.file_duration || playdata.message.duration }}"
    </p>
    <div
      :class="[
        'cricleplay',
        playdata.from_name === $store.state.username ? 'different' : '',
      ]"
      status="stop"
      no="1"
    >
      <div class="small"></div>
      <div :class="['middle', play ? '' : 'stopanimate']"></div>
      <div :class="['large', play ? '' : 'stopanimate']"></div>
    </div>
    <p class="time" v-if="playdata.from_name !== $store.state.username && time">
      {{ playdata.file_duration || playdata.message.duration }}"
    </p>
  </div>
</template>

<script>
export default {
  name: 'Audio',
  props: {
    data: {
      type: Object,
      default: () => {
        return {}
      },
    },
    isPlay: {
      type: Boolean,
      default: false,
    },
    time: Boolean,
  },
  data() {
    return {
      playdata: JSON.parse(JSON.stringify(this.data)),
      play: JSON.parse(JSON.stringify(this.isPlay)),
    }
  },
  computed: {},
  watch: {
    isPlay(val) {
      this.play = this.isPlay
    },
    data: {
      handler: function(val) {
        this.playdata = JSON.parse(JSON.stringify(val))
      },
      deep: true,
    },
  },
  methods: {
    audio() {
      this.$emit('play', this.isPlay)
    },
  },
  created() {},
  mounted() {},
}
</script>
<style lang="less" scoped>
.record_content {
  display: flex;
  align-items: center;
  .time {
    font-size: 16px;
    min-width: 24px;
    margin-left: 10px;
  }
}
.small {
  width: 16px;
  height: 16px;
  border-style: solid;
  border-top-color: transparent;
  border-left-color: transparent;
  border-bottom-color: transparent;
  border-radius: 50%;
  box-sizing: border-box;
  vertical-align: middle;
  display: inline-block;
  color: #a2a2a2;
  border-width: 1px;
}

.middle {
  width: 28px;
  height: 27px;
  border-style: solid;
  border-top-color: transparent;
  border-left-color: transparent;
  border-bottom-color: transparent;
  border-radius: 50%;
  box-sizing: border-box;
  vertical-align: middle;
  display: inline-block;
  margin-left: -22px;
  animation: show2 3s ease-in-out infinite;
  opacity: 1;
  color: #a2a2a2;
  border-width: 1px;
}
@keyframes show2 {
  0% {
    opacity: 0;
  }
  30% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
.cricleplay {
  width: 2.5rem;
}

.different {
  transform: rotate(180deg);
}
.large {
  width: 39px;
  height: 38px;
  border-style: solid;
  border-top-color: transparent; //大专栏 纯css3配合vue实现微信语音播放效果;
  border-left-color: transparent;
  border-bottom-color: transparent;
  border-radius: 50%;
  box-sizing: border-box;
  vertical-align: middle;
  display: inline-block;
  margin-left: -32px;
  animation: show3 3s ease-in-out infinite;
  opacity: 1;
  color: #a2a2a2;
  border-width: 1px;
}
@keyframes show3 {
  0% {
    opacity: 0;
  }
  60% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
.stopanimate {
  -moz-animation-name: none;
  -webkit-animation-name: none;
  -ms-animation-name: none;
  animation-name: none;
}
</style>
