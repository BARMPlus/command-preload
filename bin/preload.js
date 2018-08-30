/**
 * Created by Administrator on 2018/8/30.
 */



let path = require('path'),
    fs = require('fs'),
    colors =require('colors'),    //需要安装
    request = require('request'),//需要安装
    cheerio = require('cheerio'),  //需要安装
    criticalcss = require("criticalcss"), //需要安装
    tmpDir = require('os').tmpdir(),
    port=7071,
    cssInterimFile = `http://localhost:${port}/static/css`,
    indexFile = './dist/index.html',
    data = fs.readFileSync(indexFile),
    $ = cheerio.load(data),
    cssUrlData = [];

function preloadJs() {
    each($('script'), function (item) {  //添加js的link为preload的标签
        let scriptUrl = item.attribs.src;
        if (scriptUrl && scriptUrl.indexOf('static') !== -1) {
            let link = `<link rel='preload' as='script' href=${scriptUrl} >`;
            $('head').append(link);
        }
    });
    fs.writeFileSync(indexFile, $.html());
    console.log(colors.blue('js preload success'));
}
function preloadCss() {
    each($('link'), function (item) {   //将css的link标签改变成preload
        let cssUrl = item.attribs.href;
        if (cssUrl && cssUrl.indexOf('static') !== -1 && item.attribs.rel === 'stylesheet') {
            cssUrl = cssUrl.replace(/^(.*?)\/static\/css/, cssInterimFile);
            cssUrlData.push(cssUrl);
            item.attribs.rel = 'preload';
            item.attribs.as = "style";
            item.attribs.onload = "this.rel='stylesheet'";
        }
    });
    if(cssUrlData.length===0)process.exit();
    cssUrlData.map(function (url,index,array) {
        criticalStyle(url,index,array);
    });

}
function each(target, callback) {
    Array.prototype.map.call(target, function (item) {
        callback(item);
    })
}
function criticalStyle(url,index,array) {   //生成首屏内联css
    let cssPath = path.join(tmpDir, 'style.css');
    request(url).pipe(fs.createWriteStream(cssPath)).on('close', function () {
        let buffer = 8000 * 1024;
        criticalcss.getRules(cssPath, {buffer}, function (err, output) {
            if (err)throw new Error(err);
            console.log('loading...');
            criticalcss.findCritical(cssInterimFile, {rules: JSON.parse(output), buffer}, function (err, output) {
                if (err)throw new Error(err);
                let styleElement = `<style rel="stylesheet">${output}</style>`;
                $('head').append(styleElement);
                fs.writeFileSync(indexFile, $.html());
                if(index===array.length-1){
                    console.log(colors.blue('css preload success'));
                    process.exit();
                }
                //  console.log(output);
            });
        });
    });
}

exports=module.exports={
    js:preloadJs,
    css:preloadCss
};