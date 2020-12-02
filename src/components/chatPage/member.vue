<template>
  <div class="member">
    <img class="member_img" :src="name.headimg" alt="" />
    <!-- <i class="icon iconfont icon-yonghuguanli1"></i> -->
    <p v-if="name.type" class="name dwote">
      {{ name.username
      }}{{
        (name.groupKefu && name.groupKefu.length) || name.isAdmin | isAdmin
      }}
    </p>
    <p v-else class="name dwote">
      {{ name.nickname[code] }}
    </p>
  </div>
</template>

<script>
import { type } from 'os'
import { mapState } from 'vuex'
export default {
  name: 'Member',
  props: {
    name: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  data() {
    return {
      code: this.$route.query.code || this.userInfo.seller.seller_code,
    }
  },
  watch: {},
  computed: {
    ...mapState(['userInfo']),
  },
  filters: {
    isAdmin(val) {
      if (typeof name.isAdmin == 'object') {
        let bool = val.groupKefu.some((item) => {
          return item == this.$store.state.Socket.gid
        })
        return bool ? '(管理员)' : ''
      } else {
        return val ? '(管理员)' : ''
      }
    },
  },
  methods: {},
}
</script>
<style lang="less" scoped>
.member {
  margin: 10px 10px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  height: 30px;
  cursor: pointer;
  // border-bottom: 1px solid #ccc;
  .name {
    margin: 0 10px;
  }
  .member_img {
    width: 2rem;
    height: 2rem;
    border-radius: 0.5rem;
  }
}
</style>
