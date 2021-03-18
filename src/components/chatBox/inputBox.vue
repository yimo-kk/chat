<template>
  <div class="inputBox2">
    <div class="input_tab">
      <div class="input_box">
        <div class="is-readonly" v-if="readonly"></div>
        <div class="handle_other">
          <van-icon
            class="iconfont faceShow font_size"
            size="1.6rem"
            class-prefix="icon"
            slot="right-icon"
            name="buoumaotubiao49"
            @click.stop="faceContent"
            style="padding:5px"
          ></van-icon>
          <van-uploader
            :after-read="uploadeFileContent"
            accept="*"
            style="padding:5px"
          >
            <van-icon
              class="iconfont font_size"
              size="1.8rem"
              class-prefix="icon"
              name="wenjian1"
            ></van-icon>
          </van-uploader>
          <van-uploader
            style="padding:5px"
            :after-read="uploadeImg"
            accept="image/png, image/gif, image/jpg, image/webp, image/jpeg"
          >
            <van-icon
              class="iconfont font_size"
              size="1.8rem"
              class-prefix="icon"
              name="tupian"
            ></van-icon>
          </van-uploader>
          <van-icon
            style="padding:5px"
            v-if="isIE"
            class="iconfont font_size"
            size="1.8rem"
            class-prefix="icon"
            name="yuyin"
            @click="inputRecordService"
          ></van-icon>
        </div>
        <div
          class="record flex_center"
          @touchstart="inputStartRecordServic"
          @touchend="inputEndRecordService"
          @touchmove="inputSlideRecord"
          v-if="audioBtn"
        >
          {{ btnText }}
        </div>
        <div class="send_text" v-else>
          <div
            :placeholder="$t('sendMsg')"
            id="input"
            ref="inputBox_edit"
            contenteditable="true"
            v-html="nodeValue"
            @keydown="enter"
            @blur="getblur"
            @paste="setPasteImg"
          ></div>
          <div class="mobileFace">
            <van-icon
              class="iconfont"
              size="20px"
              class-prefix="icon"
              slot="right-icon"
              name="buoumaotubiao49"
              @click.stop="faceContent"
            ></van-icon>
          </div>
        </div>
        <!-- 按钮 -->
        <div class="buttom">
          <transition name="van-slide-right">
            <p :class="['btn', 'send_btn']" @click="sendMessage">
              {{ $t('send') }}
            </p>
          </transition>
        </div>
      </div>
      <!-- 表情区域 -->
      <div v-show="faceShow" class="click_head_portrait_emoji">
        <div
          class="mask"
          @click="
            () => {
              faceShow = false
              faceList = []
            }
          "
        ></div>
        <div class="browBoxs">
          <div class="browBox">
            <ul v-show="currentFace == 'emoji'">
              <li
                v-html="faceHtml(item)"
                v-for="(item, index) in faceList"
                :key="index"
                @click.stop="insertEmoji(item)"
              ></li>
            </ul>
            <div class="heart-emoji" v-show="currentFace == 'heart'">
              <div class="loading">
                <van-loading
                  type="spinner"
                  color="#1989fa"
                  v-show="heartEmojiLoading"
                />
              </div>
              <div
                class="heart-emoji-list"
                v-for="item in heartEmoji"
                :key="item.id"
                @click.stop="sendHeartEmoji(item)"
              >
                <img
                  class="phiz_img"
                  :src="item.phiz_img"
                  alt=""
                  :title="item.remarks"
                />
              </div>
            </div>
          </div>
          <div class="select-emoji">
            <div
              :class="['emoji', currentFace == 'emoji' ? 'active-emoji' : '']"
              @click="handleEmoji"
            >
              <van-icon
                class="iconfont faceShow font_size"
                size="1.6rem"
                class-prefix="icon"
                slot="right-icon"
                name="buoumaotubiao49"
                style="padding:5px"
              ></van-icon>
            </div>
            <div
              :class="['emoji', currentFace == 'heart' ? 'active-emoji' : '']"
              @click="handleHeart"
            >
              <van-icon name="like-o" size="1.6rem" style="padding:5px" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import common from '@/mixins/common'
export default {
  name: 'inputBox2',
  mixins: [common()],
  components: {},
  props: {
    isName: {
      type: Boolean,
      default: false,
    },
    audioBtn: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      nodeValue: '',
      sel: null,
      range: null,
      currentFace: 'emoji', // 默认选择 表情
      heartEmoji: [],
      heartEmojiLoading: false,
    }
  },
  computed: {},
  watch: {
    nodeValue(newVal) {
      this.$nextTick(() => {
        this.nodeValue = newVal ? newVal : ''
      })
    },
    '$store.state.Socket.activityGroup': {
      handler(newVal) {
        if (Object.keys(newVal).length) {
          document.getElementById('input').innerHTML = ''
        }
      },
      deep: true,
    },
  },
  methods: {
    //获取div内容并转为Node数组
    getNodeList() {
      return Array.from(this.$refs.inputBox_edit.childNodes)
    },
    setPasteImg(event) {
      event.preventDefault()
      if (event.clipboardData || event.originalEvent) {
        var clipboardData =
          event.clipboardData || event.originalEvent.clipboardData
        if (Object.keys(clipboardData.files).length) {
          var blob
          for (var i = 0; i < clipboardData.items.length; i++) {
            if (clipboardData.items[i].type.indexOf('image') !== -1) {
              blob = clipboardData.items[i].getAsFile()
            }
          }
          var render = new FileReader()
          let _this = this
          render.onload = function(evt) {
            //输出base64编码
            var base64 = evt.target.result
            var img = document.createElement('img')
            img.setAttribute('src', base64)
            img.setAttribute('style', 'max-width:120px; max-height:90px')
            _this.$refs.inputBox_edit.focus()
            _this.insertHtmlAtCaret(img)
          }
          render.readAsDataURL(blob)
        } else {
          var text
          // 兼容针对于opera ie等浏览器
          if (clipboardData === undefined || clipboardData === null) {
            text = window.clipboardData.getData('text') || ''
            if (text !== '') {
              if (window.getSelection) {
                // 针对于ie11 10 9 safari
                var newNode = document.createElement('span')
                newNode.innerHTML = text
                window
                  .getSelection()
                  .getRangeAt(0)
                  .insertNode(newNode)
              } else {
                // 兼容ie10 9 8 7 6 5
                document.selection.createRange().pasteHTML(text)
              }
            }
          } else {
            // 兼容chorme或hotfire
            text = clipboardData.getData('text/plain') || ''
            if (text !== '') {
              document.execCommand('insertText', false, text)
            }
          }
        }
      }
      // })
    },
    // 插入文字和图片 节点对象
    insertHtmlAtCaret(html) {
      document.getElementById('input').focus()
      let range, sel
      if (window.getSelection) {
        sel = window.getSelection()
        if (sel.getRangeAt && sel.rangeCount) {
          range = sel.getRangeAt(0)
          range.deleteContents()
          let el = document.createElement('div')
          el.appendChild(html)
          var frag = document.createDocumentFragment(),
            node,
            lastNode
          while ((node = el.firstChild)) {
            lastNode = frag.appendChild(node)
          }
          range.insertNode(frag)
          if (lastNode) {
            range = range.cloneRange()
            range.setStartAfter(lastNode)
            range.collapse(true)
            sel.removeAllRanges()
            sel.addRange(range)
          }
        }
      }
    },
    // 插入表情
    insertEmoji(val) {
      document.getElementById('input').focus()
      this.insertHtml(this.faceHtml(val))
    },
    // 发送
    sendMessage() {
      let sendMessage = ''
      let sendImg = ''
      this.getNodeList().forEach((item, index) => {
        if (
          item.nodeName == '#text' ||
          item.nodeName == 'BR' ||
          item.nodeName == 'SPAN'
        ) {
          sendMessage +=
            item.nodeName == 'BR'
              ? '\n'
              : item.nodeName == 'SPAN'
              ? `[${item.dataset.name}]`
              : item.data
          if (this.getNodeList()[index + 1]) {
            if (!this.getNodeList()[index + 1].nodeName == '#text') {
              this.$emit('sendMessage', this.sendFilterText(sendMessage), 0)
              sendMessage = ''
            }
          } else {
            if (sendMessage.trim()) {
              this.$emit('sendMessage', this.sendFilterText(sendMessage), 0)
              sendMessage = ''
            } else {
              this.$toast('发送内容不能为空！')
            }
          }
        } else if (item.nodeName == 'IMG') {
          this.$emit('sendMessage', this.sendFilterText(sendMessage), 0)
          sendMessage = ''
          this.$emit('sendMessage', item.currentSrc, 1)
          sendImg = ''
        }
      })
      document.getElementById('input').innerHTML = ''
    },
    enter(event) {
      if (event.keyCode === 13 && event.shiftKey) {
        // shitt+回车自带换行
      } else if (event.keyCode === 13) {
        event.preventDefault()
        this.sendMessage()
      }
    },
    // 发送表情图片
    sendHeartEmoji(val) {
      this.$emit('sendMessage', val.phiz_img, 4)
      this.faceShow = false
    },
    // 失去焦点获取光标位置
    getblur() {
      this.sel = window.getSelection()
      this.range = this.sel.getRangeAt(0)
      this.range.deleteContents()
    },
    //插入表情 字符串格式
    insertHtml(html) {
      if (this.sel) {
        if (this.sel.getRangeAt && this.sel.rangeCount) {
          var el = document.createElement('div')
          el.innerHTML = html
          var frag = document.createDocumentFragment(),
            node,
            lastNode
          while ((node = el.firstChild)) {
            lastNode = frag.appendChild(node)
          }
          this.range.insertNode(frag)
          if (lastNode) {
            this.range = this.range.cloneRange()
            this.range.setStartAfter(lastNode)
            this.range.collapse(true)
            this.sel.removeAllRanges()
            this.sel.addRange(this.range)
          }
        }
      } else {
        let sel = window.getSelection(),
          range
        if (sel.getRangeAt && sel.rangeCount) {
          sel.collapseToEnd()
          range = sel.getRangeAt(0)
          range.deleteContents()
          var el = document.createElement('span')
          el.innerHTML = html
          var frag = document.createDocumentFragment(),
            node,
            lastNode
          while ((node = el.firstChild)) {
            lastNode = frag.appendChild(node)
          }
          range.insertNode(frag)
          if (lastNode) {
            range = range.cloneRange()
            range.setStartAfter(lastNode)
            range.collapse(true)
            sel.removeAllRanges()
            sel.addRange(range)
          }
        }
      }
    },
    //  发送文本含有表情 限制长度最后表情不完整问题
    sendFilterText(newVal) {
      if (!newVal) return
      var str = newVal
      if (str.length >= 240) {
        this.$toast(this.$t('overLimit'))
        var string = str.slice(0, 240)
        var arr = string.split('[')
        arr.forEach((item, index) => {
          if (index > 0 && item.indexOf(']') === -1) {
            arr.pop()
          }
        })
        return arr.join('[')
      } else {
        return newVal
      }
    },
    // 获取图片
    uploadeImg(file) {
      this.$emit('uploadeImg', file)
    },
    // 发送文件
    uploadeFileContent(file) {
      this.$emit('uploadeFile', file)
    },
    inputRecordService() {
      this.$emit('recordService')
    },
    // inputContent() {
    //   this.getNodeList().length ? (this.showBtn = true) : (this.showBtn = false)
    // },
    inputStartRecordServic(e) {
      this.$emit('startRecordServic', e)
    },
    inputEndRecordService(e) {
      this.$emit('endRecordService', e)
    },
    inputSlideRecord(e) {
      this.$emit('slideRecord', e)
    },
    // 点击 表情
    handleEmoji() {
      console.log(this.currentFace, 222)
      if (this.currentFace === 'emoji') return
      this.currentFace = 'emoji'
      this.faceContent()
    },
    // 点击 自定义表情tab
    handleHeart() {
      console.log(this.currentFace, 111)
      if (this.currentFace === 'heart') return
      this.currentFace = 'heart'
      this.getPhizListData()
    },
  },
}
</script>
<style lang="less" scoped>
#input {
  // padding: 0 10px;
  border: #7f7f7f;
  height: calc(100% - 18px);
  overflow-y: auto;
  outline: none;
  width: 100%;
  color: #000;
  font-size: 14px;
  font-family: 微软雅黑, serif;
  word-wrap: break-word;
  word-break: break-all;
  overflow-x: hidden;
  background-color: #fff;

  .file {
    cursor: default;
    height: 45px;
    padding: 5px 10px;
    width: 300px;
    position: relative;
    border: 0.5px solid #d0d0d0;
    border-radius: 3px;

    &:hover {
      background: #d0cecd;
    }

    .el-icon-close {
      position: absolute;
      top: 3px;
      right: 5px;
      // cursor: pointer;
      color: #969696;

      &:hover {
        color: #6b6b6b;
      }
    }

    .el-icon-document {
      color: #969696;
      font-size: 40px;
      float: left;
    }

    .info {
      margin-left: 15px;
      font-size: small;
      float: left;

      p {
        margin: 0;
      }
    }
  }
}
.send {
  position: absolute;
  top: 120px;
  bottom: 10px;
  right: 10px;

  /deep/ .ant-checkbox + span {
    padding-left: 0;
    color: #ccc;
  }

  .send_btn {
    display: inline-block;
    width: 50px;
    height: 30px;
    text-align: center;
    line-height: 30px;
    background: #ccc;
    border-radius: 5px;
  }

  .activt_btn {
    background-color: #1890ff;
    color: #fff;
  }
}
.is-readonly {
  width: 100%;
  height: 100%;
  background-color: rgba(243, 243, 243, 0.5);
  position: absolute;
  top: 0;
  left: 0;
  display: block;
  z-index: 1;
}

#input:empty::before {
  color: lightgrey;
  content: attr(placeholder);
}
</style>
