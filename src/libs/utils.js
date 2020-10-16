const appData = require("@/assets/emojis.json");
// 压缩图片
export function compressImage(file, success, error) {
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
export function whatPort() {
  if (/Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent)) {
    return true;
  } else {
    return false;
  }
}
// 校验上传图片格式
export function isImage(str) {
  var reg = /\.(png|jpg|gif|jpeg|webp)$/;
  return !reg.test(str);
}
//base64转blob
export function base64ToBlob(code) {
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
export function setSession(name, value) {
  if (typeof value !== "string") {
    value = JSON.stringify(value);
  }
  localStorage.setItem(name, value);
}
export function getSession(name) {
  if (localStorage.getItem(name)) {
    return localStorage.getItem(name);
  } else return "";
}
export function removeSession(name) {
  localStorage.removeItem(name);
}
// 表情转化
export function conversion(input) {
  if(!input)return
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
export function conversionFace(input) {
  if(!input)return
  for (let key of Object.keys(appData)) {
    input = input.replace(
      new RegExp(`\\[em_${key}\\]`, "g"),
      appData[key]["char"]
    );
  }
  return input;
}
// 生成随机字符串
function GetRandomNum(Min, Max) {
  var Range = Max - Min;
  var Rand = Math.random();
  return Min + Math.round(Rand * Range);
}

export function createUserName() {
  var ranNum = Math.ceil(Math.random() * 25);
  var letter = String.fromCharCode(65 + ranNum); //随机字母
  var day = new Date();
  var fullYear = day.getFullYear(); //获取当前年份
  var rand = GetRandomNum(10000, 99999); //随机数字
  return letter + fullYear + rand;
}

export function isIE() {
	if (!!window.ActiveXObject || "ActiveXObject" in window) {
		return true;
	} else {
		return false;
	}
}