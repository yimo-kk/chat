// export default function() {
//   return {
//     data() {
//       return {
//         isPlaying: false
//       };
//     },
//     methods: {
//       playPrompt() {
//         this.lastRunTime = Date.now();
//         let audio = document.querySelector("#audio");
//         if (!this.isPlaying) {
//           audio.play();
//           this.isPlaying = true;
//         }
//         let timeOut = setTimeout(() => {
//           this.stop(timeOut);
//         }, 1000);
//       },
//       stop(timeOut) {
//         this.currentTime = Date.now();
//         let audio = document.querySelector("#audio");
//         if (this.currentTime - this.lastRunTime < 1000) {
//         } else {
//           if (this.isPlaying) {
//             audio.currentTime = 0;
//             audio.pause();
//             this.isPlaying = false;
//           }
//         }
//         clearTimeout(timeOut);
//       }
//     }
//   };
// }
