<template>
  <div id="app">
    <router-view />
    <audio id="audio" preload="auto">
      <source src="./assets/voice.mp3" type="audio/mp3" autoplay />
    </audio>
  </div>
</template>
<script>
import { mapState } from 'vuex'
export default {
  methods: {},
  data() {
    return {
      isClose: false,
    }
  },
  computed: {
    ...mapState(['username']),
  },
  mounted() {
    let that = this
    document.addEventListener('click', () => {
      that.$store.commit('closeTitleScrolling', '尊敬的用户,欢迎您')
      this.$store.commit('setNum', 0)
    })
    document.addEventListener('touchstart', () => {
      that.$store.commit('closeTitleScrolling', '尊敬的用户,欢迎您')
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
