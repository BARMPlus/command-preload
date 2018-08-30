/**
 * Created by Administrator on 2018/8/30.
 */

let colors =require('colors'),    //需要安装
    express=require('express'),    //需要安装
    app=express(),
    port=7071;


function startExpress() {  //开启express服务器
    app.use(express.static('./dist'));
    app.listen(port,()=>{
        console.log(colors.cyan(`http://localhost:${port}`));
    });
}

exports=module.exports={
    start:startExpress
};