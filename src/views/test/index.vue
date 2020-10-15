<template>
<div>
    <div class='test' @click="start">开始</div>
<div class='test' @click="end">结束</div>
</div>
</template>

<script>
import Recorder from './and'
let recorder = new Recorder({
        type:"wav",   //此处的type类型是可修改的
        bitRate:16,      
        sampleRate:16000,
        bufferSize:8192,
    })
export default {
name:'test',
components: {},
data() {
return {

}
},
computed: {},
watch: {},
methods: {
start(){ recorder.start();},
end(){ recorder.stop();
 // 手动获取录音时长
 console.log(recorder.duration);
//获取WAV音频文件
// recorder.getWAVBlob()
console.log(recorder.getWAVBlob(),333)
//获取WAV音频文件MP4
// recorder.getMP4Blob()
console.log(recorder.getMP4Blob(),333)
//获取WAV音频文件pcm
// recorder.getPCMBlob()
console.log(recorder.getPCMBlob(),333)
}
/**
 *
 *  
 * // 开始录音
 recorder.start();
 // 结束录音
 recorder.stop();
 // 暂停录音
 recorder.pause();

 // 继续录音
 recorder.resume()
 // 录音播放
 recorder.play();
 // 销毁录音实例，释放资源，fn为回调函数，
 recorder.destroy(fn);
 recorder = null;
 // 下载功能
 // 下载pcm文件
 recorder.downloadPCM();
 // 下载wav文件
 recorder.downloadWAV();
 // 重命名pcm文件，wav也支持
 recorder.downloadPCM('重命名');
 // 获取录音时长
 // 回调持续输出时长
 recorder.onprocess = function (duration) {
            console.log(duration);
        }
 // 手动获取录音时长
 console.log(recorder.duration);
//获取WAV音频文件
recorder.getWAVBlob()
//获取WAV音频文件MP4
recorder.getMP4Blob()
//获取WAV音频文件pcm
recorder.getPCMBlob()

*/
},
created() {

},
mounted() {

},
}
</script>
<style lang='less' scoped>

</style>