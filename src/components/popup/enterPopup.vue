<template>
  <van-overlay
    :show="isShow"
    @click="show = false"
    :z-index="222"
    class="overlay"
  >
    <div class="enterPopup ">
      <h4 style="margin: 1.5rem;">{{ this.$t('prompt') }}</h4>
      <van-cell-group>
        <van-field
          v-model="password"
          label-width="20px"
          :type="eye === 'closed-eye' ? 'password' : ''"
          :name="password"
          placeholder="请填写进群密码"
          :right-icon="eye"
          @click-right-icon="viewPasswrod"
        />
      </van-cell-group>
      <div class="my_buttom">
        <van-button type="info" @click="onSubmit" size="small">
          {{ this.$t('submit') }}
        </van-button>
      </div>
    </div>
  </van-overlay>
</template>

<script>
export default {
  name: 'enter-popup',
  props: {
    isShowPopup: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isShow: false,
      password: '',
      eye: 'closed-eye',
    }
  },
  computed: {},
  watch: {
    isShowPopup(val) {
      this.isShow = val
    },
  },
  methods: {
    viewPasswrod(val) {
      this.eye === 'closed-eye' ? (this.eye = 'eye') : (this.eye = 'closed-eye')
    },
    onSubmit() {
      if (!this.password) {
        this.$toast(this.$t('password'))
        return
      }
      this.$emit('onSubmit', this.password)
    },
  },
  created() {},
  mounted() {},
}
</script>
<style lang="less" scoped>
.overlay {
  display: flex;
  justify-content: center;
  // align-items: center;
}
.enterPopup {
  padding: 0 2rem;
  width: 22rem;
  height: 12rem;
  background: #fff;
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  // justify-content: space-around;
  position: relative;
  margin-top: 15rem;
}
.my_buttom {
  position: absolute;
  bottom: 1.5rem;
  right: 2rem;
}
</style>
