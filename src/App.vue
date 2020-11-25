<template>
  <div id="app">
    <router-view />
    <audio id="audio" preload="auto">
      <source src="./assets/voice.mp3" type="audio/mp3" autoplay />
    </audio>
  </div>
</template>
<script>
export default {
  methods: {},
  mounted() {
    let that = this
    document.addEventListener('click', () => {
      that.$store.commit('closeTitleScrolling', '妮姬客服')
      this.$store.commit('setNum', 0)
    })
    document.addEventListener('touchstart', () => {
      that.$store.commit('closeTitleScrolling', '妮姬客服')
      this.$store.commit('setNum', 0)
    })
  },
}
</script>

<style lang="less">
#app {
  overflow: hidden;
  width: 100%;
  height: 100%;
}
@import './styles/chatStyle.less';
</style>
