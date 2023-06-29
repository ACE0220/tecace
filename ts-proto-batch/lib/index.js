'use strict';

const { Command } = require('commander');
const { resolve, join, relative } = require("path");
const { statSync, mkdirSync, readdirSync } = require('fs');
const child_process = require('child_process');
const pkg = require('../package.json');
const program = new Command();
const path = require('path');

function core(argv) {
  regisCommand();
}

function regisCommand() {
  program
    .name(Object.keys(pkg.bin)[0])
    .usage('<command> [options]')
    .version(pkg.version);

  // 命令注册
  program
    .command('gen')
    .option("-i --in <inpath>", "proto file or directory")
    .option("-o --out <outpath>", "typescript out directory")
    .action(genPrepare);

  // 对未知命令的监听
  program.on('command:*', function (obj) {
    const availableCommand = program.commands.map(cmd => cmd.name());
    console.log('未知命令:' + obj[0]);
    if (availableCommand.length > 0) {
      console.log('可用命令:' + availableCommand.join(','));
    }
  });

  program.parse(process.argv);

  // 如果不输入任何command，就直接打印帮助文档
  if (program.args && program.args.length < 1) {
    program.outputHelp();
    console.log();
  }
}

function genPrepare() {
  const args = Array.from(arguments);
  const cmd = args[args.length - 1];
  let { in: inpath, out: outpath } = cmd.opts();
  if (!inpath || !outpath) {
    console.error('inpath or outpath is not exists, run ts-pb gen -h to get help');
  }
  inpath = resolve(process.cwd(), inpath);
  outpath = resolve(process.cwd(), outpath);

  let inStat;
  try {
    inStat = statSync(inpath);
  } catch (e) {
    throw new Error(e.message)
    return;
  }

  if (inStat.isFile()) {
    console.error('The value of option -i(--input) is not a directory');
    return;
  } else if (inStat.isDirectory()) {
    gen(inpath, outpath);
    console.log(' Generate typescript files success')
  }
}

function gen(inpath, outpath) {
  mkdirSync(outpath, {recursive: true})
  const sep = path.sep;
  const outPathSplitArray = outpath.split(sep);
  const files = readdirSync(inpath).filter(item => {
    return !outPathSplitArray.includes(item)
  });
  files.forEach(file => {
    let stat = statSync(resolve(inpath, file));
    if (stat.isDirectory()) {
      gen(`${inpath}/${file}`, `${outpath}/${file}`)
    } else if (stat.isFile() && file.endsWith(".proto")) {
      child_process.exec(`protoc --plugin=tsproto -I=${inpath} ${inpath}/${file} --ts_proto_out=${outpath}`, genCallback);
    }
  })
}

function genCallback(error) {
  if (error) {
    console.error(error)
    return;
  }
}

module.exports = core;
