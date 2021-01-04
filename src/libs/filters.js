
// 换算文件大小
const fileSize = function (num) {
  num = parseInt(num);
  if (num / 1024 > 1024) {
    return `${(num / 1024 / 1024).toFixed(2)}MB`;
  } else {
    return `${(num / 1024).toFixed(2)}KB`;
  }
};
export default {
  fileSize,
};
