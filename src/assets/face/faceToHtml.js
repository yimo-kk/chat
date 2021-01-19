import Vue from 'vue';
import { emojisAmap } from './index.js'

// 解析emoji表情 以及换行回车
Vue.prototype.faceHtml = function (value) {
  var reg = RegExp(/b/);
  return `<span contenteditable='false' class="${value} ${reg.test(value) ? ' emoji_b' : 'emoji_a'}" data-name='${value}'></span>`
}
Vue.prototype.conversionFace = function (input) {
  for (const key in emojisAmap) {
    var reg = RegExp(/b/);
    let re = {
      regex: new RegExp(`\\[${emojisAmap[key]}\\]`, "g"),
      placeholder: `<span contenteditable='false' class="${emojisAmap[key]} ${reg.test(emojisAmap[key]) ? ' emoji_b' : 'emoji_a'}" data-name='${emojisAmap[key]}'></span>`
    }
    input = input.replace(re.regex, re.placeholder);
  }
  return input
}
