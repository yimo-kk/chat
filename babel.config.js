module.exports = {
  //  presets: ["@vue/cli-plugin-babel/preset"],
  presets: [
    ["@vue/app", {useBuiltIns: "entry",}]
  ],
  plugins: [
    ['import', {
      libraryName: 'vant',
      libraryDirectory: 'es',
      style: true
    }, 'vant']
  ]
};
