const appData = require("@/assets/emojis.json");
// 压缩图片
export function compressImage (file, success, error) {
  const name = file.name; //文件名
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = e => {
    const src = e.target.result;
    const img = new Image();
    img.src = src;
    // 图片小于1M不压缩
    if (file.size < Math.pow(500, 2)) {
      return success(src, file);
    }
    img.onload = () => {
      const w = img.width;
      const h = img.height;
      const quality = 0.5; // 默认图片质量为0.92
      // 生成canvas
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      // 创建属性节点
      const anw = document.createAttribute("width");
      anw.nodeValue = w;
      const anh = document.createAttribute("height");
      anh.nodeValue = h;
      canvas.setAttributeNode(anw);
      canvas.setAttributeNode(anh);
      // 铺底色 PNG转JPEG时透明区域会变黑色
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      // quality值越小，所绘制出的图像越模糊
      const base64 = canvas.toDataURL("image/jpeg", quality); // 图片格式jpeg或webp可以选0-1质量区间
      success(base64);
    };
    img.onerror = e => {
      error(e);
    };
  };
  reader.onerror = e => {
    error(e);
  };
}
// 判断是pc还是移动端
export function whatPort () {
  if (/Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent)) {
    return true;
  } else {
    return false;
  }
}
// 校验上传图片格式
export function isImage (str) {
  var reg = /\.(png|jpg|gif|jpeg|webp)$/;
  return !reg.test(str);
}
//base64转blob
export function base64ToBlob (code) {
  let parts = code.split(";base64,");
  let contentType = parts[0].split(":")[1];
  let raw = window.atob(parts[1]);
  let rawLength = raw.length;

  let uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }
  return new Blob([uInt8Array], { type: contentType });
}
// 存 取 删 localStorage 修改为永久存储
export function setStorage (name, value) {
  if (typeof value !== "string") {
    value = JSON.stringify(value);
  }
  localStorage.setItem(name, value);
}
export function getStorage (name) {
  if (localStorage.getItem(name)) {
    return localStorage.getItem(name);
  } else return "";
}
export function removeStorage (name) {
  localStorage.removeItem(name);
}
// 表情转化
export function conversion (input) {
  if (!input) return
  const regexTab = [];
  for (let key of Object.keys(appData)) {
    regexTab.push({
      regex: new RegExp(appData[key]["char"], "g"),
      placeholder: "[em_" + key + "]"
    });
  }
  for (let x of regexTab) {
    input = input.replace(x.regex, x.placeholder);
  }
  return input;
}
export function conversionFace (input) {
  if (!input) return
  for (let key of Object.keys(appData)) {
    input = input.replace(
      new RegExp(`\\[em_${key}\\]`, "g"),
      appData[key]["char"]
    );
  }
  return input;
}
// 生成随机字符串
function GetRandomNum (Min, Max) {
  var Range = Max - Min;
  var Rand = Math.random();
  return Min + Math.round(Rand * Range);
}

export function createUserName () {
  var ranNum = Math.ceil(Math.random() * 25);
  var letter = String.fromCharCode(65 + ranNum); //随机字母
  var day = new Date();
  var fullYear = day.getFullYear(); //获取当前年份
  var rand = GetRandomNum(10000, 99999); //随机数字
  return letter + fullYear + rand;
}

export function isIE () {
  if (!!window.ActiveXObject || "ActiveXObject" in window) {
    return true;
  } else {
    return false;
  }
}
// 获取url参数
export function getQueryString (name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
  var r = window.location.search.substr(1).match(reg);
  if (r != null) return decodeURI(r[2]);
  return null;
}
export function segmentation (string) {
  let obj = {}
  var vars = string.split("&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    obj[pair[0]] = pair[1]
  }
  return obj
}
/*
*
* @param str 传入被校验手机号身份证
* @param type 校验类型 'phone','idCard'
* @returns {*} false校验失败， true校验成功
*/
export function check (str, type) {
  let types = {
    phone () { // 校验手机号
      return this.typeCheckFn(/^1\d{10}$/.test(str))
    },
    idCard () { // 校验邮箱
      let checkEmail = /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/
      return this.typeCheckFn(checkEmail.test(str))
    },
    typeCheckFn (reg) { // 校验函数 reg校验规则
      if (reg) return true
      return false
    },
  }

  return types[type]()
}
/**
 * 设置storage里面的数据
 * @param {*} code 商家code
 * @param {*} username 用户名
 * @param {*} group_id 修改的key
 * @param {*} val 修改的值
 */
export function setStorageData (code, username, group_id, val) {
  let obj = {}
  if (Object.keys(getStorage(code)).length) {
    obj = JSON.parse(getStorage(code))
    if (Array.isArray(obj[username]['groupList'])) {
      obj[username]['groupList'].map(item => {
        item.group_id === group_id && (item.isPassword = val)
      })
    }
    setStorage(code, obj)
  }
}
export function rule (data) {
  let str = JSON.parse(JSON.stringify(data))
  str.nickname = eval('(' + str.nickname + ')')
  return str
}