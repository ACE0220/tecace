# @tecace/ace-cli

## description

ace-cli 脚手架：基于 typescript 开发，核心模块、工具包、命令包分层管理，独立部署，自动更新，npm 包缓存，拥有高扩展性和维护性。

## install

```sh
npm install -g @tecace/ace-cli@0.0.6-alpha.0
```

## usage

### 用户目录 userhome 和存储目录

注意：下文中使用 ${userhome} 指代用户目录

注意：下文中使用 ${userhome} 指代用户目录

注意：下文中使用 ${userhome} 指代用户目录

**用户目录**

userdir: https://www.npmjs.com/package/userdir?activeTab=readme

存储路径是基于 userdir 工具获取到的 home 目录

```typescript
import { userdir } from 'userdir';
const userhome = userdir(); // Windows: C:\Users\username MACOS: /Users/username
```

**默认缓存路径**

命令包，模板包的下载与缓存由核心模块控制，默认会缓存在 ${userhome}/.ace-cli

**修改位于用户目录下缓存路径**

在 ${userhome} 下新建.cli_env 文件，写入 CLI_HOME_PATH = '.my-cli'

最终缓存路径会被改为 ${userhome}/.my-cli

```text
# userhone/.cli_env
HOME_PATH = '.my-cli'
```

### 插件化机制

脚手架自带默认自带了 init 命令，调用方法

```sh
ace-cli init <project_name>
```

可以通过脚手架提供的插件化机制去扩展新的命令，不用改动原有代码

在${userhome}/.cli_env 文件下**新增**命令

格式 1：COMMANDS\_命令名称大写 = 命令,命令描述,线上 online ,包名@版本名

格式 2：COMMANDS\_命令名称大写 = 命令,命令描述,本地 local ,本地包的绝对地址

例子如下所示：

```env
COMMANDS_CLEAN = clean,clean cache,online,@tecace/command-clean@0.0.2-beta.3
COMMANDS_GENERATE = generate,description of generate command,local,/Users/ace0220/commands/generate
```

### 自定义命令开发

1. - 第一步首先如上示例所示，在${userhome}/.cli_env 新增命令,env 中的 key 如果与命令相关，一定要以 COMMANDS\_开头。

2. - 每个命令的业务逻辑都可以是一个 package，package.json 中必须有 main 属性，指向 index.js 文件
   - 命令业务逻辑开发可以使用 typescript 开发，但是打包后的 index 代码必须为 commonjs 规范

3. - 命令的业务逻辑继承于@tecace/model-command 的 Command 类
   - 必须实现两个方法，init 方法和 exec 方法
   - 必须对外暴露一个 export default 方法

```typescript
import { Command } from '@tecace/model-command';
import { aceLog } from '@tecace/ace-log';
class CleanCommand extends Command {
  // 将参数传入父类
  constructor(argv) {
    super(argv);
  }
  // 必须实现init方法
  init() {
    aceLog.log('verbose', 'cleancommand', 'init');
  }
  // 必须实现exec方法
  async exec() {
    aceLog.log('verbose', 'cleancommand', 'exec');
  }
}

export default function clean() {
  return new CleanCommand(arguments);
}
```

完成以上步骤之后，执行 ace-cli 就可以看到新指令的存在

```sh
ace0220@ace-mbp cli-test % ace-cli
ace-cli info version: 0.0.6
ace-cli info Home path: /Users/ace0220/.ace-cli
Usage: ace-cli <command> [options]

Options:
  -V, --version                 output the version number
  -d, --debug                   debug mode (default: false)
  -lc, --localPath <localPath>  Specifies the local command file path (default: "")
  -h, --help                    display help for command
# 这里显示可以使用的Command和描述，显示出了clean 命令
Commands:
  init [options] [projectName]
  clean                         clean cache
  help [command]                display help for command
```

### 开发新命令流程参考

可以参考笔者的 clean 命令的开发

github：https://github.com/ACE0220/tecace/tree/main/ace-cli/commands/clean
npm: https://www.npmjs.com/package/@tecace/command-clean

笔者采用 typescript 开发，打包工具使用的是 rollup，打包后的代码是 commonjs 规范
