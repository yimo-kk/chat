import axios from "axios";
import {
  Toast
} from 'vant';
// const baseUrl = process.env.VUE_APP_BASE_URL + "/api";
const baseUrl = process.env.VUE_APP_BASE_URL;
axios.defaults.baseURL = baseUrl;
axios.defaults.timeout = 50000;
axios.defaults.headers = {
  "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
};
// 添加请求拦截器
axios.interceptors.request.use(
  function (config) {
    // 在发送请求之前做些什么
    return config;
  },
  function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

// 添加响应拦截器
axios.interceptors.response.use(
  function (response) {
    // 对响应数据做点什么
    // if(!response.data.data){
    //   Toast('参数错误!')
    //   return Promise.reject(new Error('参数错误'
    //   ));
    // }else {
    return response;
    // }
  },
  function (error) {
    // 对响应错误做点什么
    return Promise.reject(error);
  }
);
export default axios;
