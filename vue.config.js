
const path = require('path')
const resolve = dir => {
  return path.join(__dirname, dir)
}
const baseUrl = process.env.VUE_APP_BASE_URL;
module.exports = {
  devServer: {
    // 设置跨域问题
    proxy: {
      "/api": {
        target: baseUrl,
        ws: true,
        changeOrigin: true,
        pathRewrite: {
          "^/api": ""
        }
      },

      "/socket.io": {
        target: baseUrl,
        ws: true,
        changeOrigin: true
      },
      "sockjs-node": {
        target: baseUrl,
        ws: false,
        changeOrigin: true
      }
    },
  },
  transpileDependencies: ['vue-socket.io', 'socket.io-client'],
  // 兼容ie 配置
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.worker\.js$/,
          use: { loader: 'worker-loader' }
        },
        {
          test: /\.m?js$/,
          // exclude用上面配置的话，默认是过滤不编译node_modules 路径下的文件
          // exclude: /(node_modules|bower_components)/,
          // include 指定需要编译的文件路径
          include: [
            resolve('src'),
            // resolve('node_modules') // 指定打包单个文件不行,把依赖文件全部打包
            resolve('node_modules/debug'),
          ],
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        }
      ]
    }
  }
}
