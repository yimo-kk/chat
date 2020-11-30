import Axios from "@/libs/axios";
import qs from "qs";
/**
 * 获取聊天列表数据
 * @param {*} params
 */
export function getChatListData (params) {
  return Axios({
    url: "/chat/getChatList",
    method: "post",
    data: qs.stringify(params)
  });
}
/**
 * 获取用户信息
 * @param {*} params
 */
export function getUsersData (params) {
  return Axios({
    url: "/users/getUsersData",
    method: "get",
    params: params
  });
}

/**
 * 获取用户和客服聊天记录
 * @param {*} params
 */
export function getServiceChatLog (params) {
  return Axios({
    url: "/chat/getServiceChatLog",
    method: "post",
    data: qs.stringify(params)
  });
}
/**
 * 聊天时上传文件
 * @param {*} params
 */
export function serviceSendChatFile (params) {
  return Axios({
    url: "/chat/serviceSendChatFile",
    headers: {
      "Content-Type": "multipart/form-data"
    },
    method: "post",
    data: params
  });
}

/**
 * 聊天时上传语音
 * @param {*} params
 */
export function uploadVoice ({ params, seller_code }) {
  return Axios({
    url: `/chat/uploadVoice?u=${seller_code}`,
    headers: {
      "Content-Type": "multipart/form-data"
    },
    method: "post",
    data: params
  });
}

/**
 * 客服评价
 * @param {*} params
 */
export function praise (params) {
  return Axios({
    url: `/chat/praise`,
    method: "post",
    data: qs.stringify(params)
  });
}

/**
 *  获取群聊记录
 * @param {*} params
 */
export function getGroupChatLog (params) {
  return Axios({
    url: `/chat/getGroupChatLog`,
    method: "post",
    data: qs.stringify(params)
  });
}
/**
 *  群聊上传文件
 * @param {*} params
 */
export function sendGroupChatFile (params) {
  return Axios({
    url: "/chat/sendGroupChatFile",
    headers: {
      "Content-Type": "multipart/form-data"
    },
    method: "post",
    data: params
  });
}

/**
 *  获取群成员
 * @param {*} params
 */
export function getGroupList (params) {
  return Axios({
    url: `/service/getGroupUsersList`,
    method: "post",
    data: qs.stringify(params)
  });
}

/**
 *  获取用户进入客服聊天页面客服主动发送信息
 * @param {*} params
 */
export function getApiList (params) {
  return Axios({
    url: `/chat/getApiList`,
    method: "post",
    data: qs.stringify(params)
  });
}

/**
 *  用户点击客服主动问题返回数据
 * @param {*} params
 */
export function getApiById (params) {
  return Axios({
    url: `/chat/getApiById`,
    method: "post",
    data: qs.stringify(params)
  });
}

/**
 *  客服常见问题
 * @param {*} params
 */
export function getQuestionList (params) {
  return Axios({
    url: `/question/getQuestionList`,
    method: "post",
    data: qs.stringify(params)
  });
}

/**
 *  公告
 * @param {*} params
 */
export function getNews (params) {
  return Axios({
    url: `/chat/getNews`,
    method: "GET",
    params: params
  });
}
/**
 *  最近十条公告
 * @param {*} params
 */
export function getNewsList (params) {
  return Axios({
    url: `/chat/getNewsList`,
    method: "GET",
    params: params
  });
}
/**
 * 解密参数
 * @param {*} params
 */
export function userDecode (params) {
  return Axios({
    url: `/chat/userDecode`,
    method: "post",
    data: qs.stringify(params)
  });
}
/**
 * 校验进入需要邀请群密码
 * @params {*}params
 */
export function getGroupData (params) {
  return Axios({
    url: '/chat/getGroupData',
    method: 'post',
    data: qs.stringify(params)
  })
}


/**
 * 校验进入需要邀请群密码
 * @params {*}params
 */
export function checkGroupPwd (params) {
  return Axios({
    url: '/chat/checkGroupPwd',
    method: 'post',
    data: qs.stringify(params)
  })
}
