# @tecace/ace-cli

## description

ace-cli 脚手架：基于 typescript 开发，核心模块、工具包、命令包分层管理，独立部署，自动更新，npm 包缓存，拥有高扩展性和维护性。

## install

```sh
npm install -g @tecace/ace-cli
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

在 ${userhome} 下新建.cli_env 文件，写入 HOME_PATH = '.my-cli'

最终缓存路径会被改为 ${userhome}/.my-cli

```text
# userhone/.cli_env
HOME_PATH = '.my-cli'
```
