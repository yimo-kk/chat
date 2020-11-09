
import Vue from 'vue';
import VueI18n from 'vue-i18n'
Vue.use(VueI18n);
// 引入各个语言配置文件
import LangENUS from './lang/en_US' 
import LangZHCN from './lang/zh_CN'
// 创建vue-i18n实例i18n 
const i18n = new VueI18n({
    // 设置默认语言
    // locale:'zh-CN', // 语言标识 
    locale: window.navigator.language || 'zh-CN',
    // 添加多语言（每一个语言标示对应一个语言文件）
    messages: {
        'zh-CN': LangZHCN,  //
        'en-US':   LangENUS
    },
    silentTranslationWarn: true
})
// 暴露i18n
export default i18n;