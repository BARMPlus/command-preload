#!/usr/bin/env node





let program = require('commander'),//需要安装
    co = require('co'),//需要安装
    preload=require('./bin/preload'),
    server=require('./bin/server');



program.version('v' + require('./package.json').version)
       .description('Manipulate asar archive files');


program.command('server').action(function () {co(function*() {
            server.start();
        });
    });
program.command('preload').action(function () {co(function*() {
            server.start();
            preload.js();
            preload.css();
        });
    });
program.parse(process.argv);























