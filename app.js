var express = require('express');
var webpackHandle = require("./webpack/webpackHandle");
app = express();

webpackHandle(app);

app.set('port', process.env.PORT || 3333);

app.use(express.static('./dist'));

app.listen(app.get('port'), function() {
  console.log(`服务启动 http://localhost: ${app.get('port')}`);
});
