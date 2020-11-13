
import Axios from "@/libs/axios";
import qs from "qs";
/**
 * 获取留言是否需要电话和邮箱
 * @param {*} params
 */
export function getSellerLeave(params) {
  return Axios({
    url: "/chat/getSellerLeave",
    method: "get",
    params: params
  });
}
/**
 * 提交留言
 * @param {*} params
 */
export function userLeave(params) {
    return Axios({
      url: "/chat/userLeave",
      method: "post",
      data: qs.stringify(params)
    });
  }
