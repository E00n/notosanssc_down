// /https://fonts.gstatic.*?.woff/

//文件下载
var fs = require("fs");
var path = require("path");
var request = require("request");
var readline = require("readline");

// 删除非空文件夹
function deleteFolderRecursive(path, callback) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function(file) {
      var curPath = path + "/" + file;
      if (fs.statSync(curPath).isDirectory()) {
        // recurse
        deleteFolderRecursive(curPath);
      } else {
        // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
  callback();
}

//创建notosanssc字体存放目录
var dirPath = path.join(__dirname, "notosanssc");
if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath);
  console.log("文件夹创建成功");
} else {
  console.log("文件夹已存在正在删除");
  deleteFolderRecursive(dirPath, () => {
    console.log(dirPath + "已删除");
    fs.mkdirSync(dirPath);
    console.log("文件夹创建成功");
  });
}

//下载字体文件
var downloadFile = (url, fileName) => {
  let stream = fs.createWriteStream(path.join(dirPath, fileName));
  request(url)
    .pipe(stream)
    .on("close", function(err) {
      console.log("文件[" + fileName + "]下载完毕");
    });
};

//创建readline接口实例
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var cdnName = "";
// question方法
rl.question("cdn域名是:", function(answer) {
  cdnName = answer;
  // 不加close，则不会结束
  rl.close();
});

// close事件监听
rl.on("close", function() {
  // 读取最新notosanssc.css 并下载所有字体文件
  fs.unlink("notosanssc.css", () => {
    console.log("notosanssc.css已删除");
    request({
      url:
        "https://fonts.googleapis.com/css?family=Noto+Sans+SC:400,500,700,900&subset=chinese-simplified",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36"
      }
    })
      .pipe(fs.createWriteStream("notosanssc.css"))
      .on("close", () => {
        console.log("notosanssc.css已更新");
        //循环多线程下载
        const data = fs.readFileSync("notosanssc.css", "utf8");
        data
          .match(/https:\/\/fonts.gstatic.*?.woff2/g)
          .forEach(url =>
            downloadFile(url, url.substring(url.lastIndexOf("/")))
          );
        // 替换链接地址
        fs.writeFile(
          "notosanssc.css",
          data.replace(/https:\/\/fonts.gstatic.*?.*\//g, cdnName + "/"),
          "utf8",
          () => {
            console.log("地址替换成功");
          }
        );
      });
  });
});
