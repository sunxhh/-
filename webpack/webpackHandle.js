let webpack = require('webpack');

let config = require('./webpack.dev.js');

module.exports = function(app) {
  let compiler = webpack(config);
  // compiler.run((err, stats) => {
  //     if (err || stats.hasErrors()) {}
  // });
  /*
      发现问题，当 run 和watch同时存在时，第一次编译后会报错  Uncaught TypeError: __webpack_require__(...) is not a function
      当只有run的时候一切正常
      当加上 watching.invalidate(); 的时候也会变得正常
      查阅资料发现
      (
          https://github.com/pigcan/blog/issues/6
          对于今天我们想要了解的 watch 过程我们这边只需要知道，当构建参数中含有明确开启 watch 配置项时整个流程的走向是 compiler.watch(watchOptions, callback); 而非 compiler.run(callback);。
      )
      发现是第一次触发watch的时候异常了。。没找出原因，就暂且吧第一次的watch 中止掉就好了 watching.invalidate();中止本轮的watch。
  */
  let watching = compiler.watch({}, (err, stats) => {
    if (err) {
      console.error(err);
    }
    console.log(stats.toString({
      chunks: true, // 使构建过程更静默无输出
      colors: true // 在控制台展示颜色
    }));
    console.log('watch 修改成功');
  });
  watching.invalidate();
  return compiler;
};
