import path from 'path';
import { aceLog, colorette } from '@tecace/ace-log';
import { Command } from '@tecace/model-command';
import * as cmdPkgMap from './commandPackageMap';
import Package from '@tecace/model-pkg';
import { getNewtestVersion } from '@tecace/npm-info';

const { red } = colorette;

class ExecCommand extends Command {
  npmPackageName: string;
  npmPackageVersion: string;
  commandLocalPath: string;
  cliHomePath: string;
  cliStorePath: string;
  constructor(argv: ArrayLike<any>) {
    aceLog.log('verbose', 'ExecCommand', 'constructor', argv);
    super(argv);
  }

  getExtendCommands() {
    const commands = [];
    for (const key in process.env) {
      if (key.includes('COMMANDS_')) {
        commands.push({
          commandFlag: key,
          commandValue: process.env[key].split(','),
        });
      }
    }
    return commands;
  }

  /**
   * The init method is mainly responsible for obtaining targetPath and homePath,
   * targetPath is a flag indicating whether to use the local npm.
   * If targetPath does not exist, use the cached npm package
   * or download the package from the npm registry and cache it to the local for use
   */
  init() {
    const { cmdName } = this;
    this.cliHomePath = process.env.CLI_HOME_PATH;
    if (cmdPkgMap[cmdName]) {
      this.commandLocalPath = process.env.COMMAND_LOCAL_PATH;
      this.npmPackageName = cmdPkgMap[cmdName].npmPackageName;
      this.npmPackageVersion = cmdPkgMap[cmdName].npmPackageVersion;
    } else {
      const commands = this.getExtendCommands();
      let commandValue: [string, string, string, string];
      commands.forEach((item) => {
        if (item.commandValue.includes(cmdName)) {
          commandValue = item.commandValue;
        }
      });
      if (commandValue[2] === 'local') {
        this.commandLocalPath = commandValue[3];
      } else if (commandValue[2] === 'online') {
        const pos = commandValue[3].lastIndexOf('@');
        this.npmPackageName = commandValue[3].slice(0, pos);
        this.npmPackageVersion = commandValue[3].slice(
          pos + 1,
          commandValue[3].length,
        );
      }
    }
    aceLog.log(
      'verbose',
      'ExecCommand',
      'init',
      `this.commandLocalPath:${this.commandLocalPath}`,
      `this.cliHomePath:${this.cliHomePath}`,
      `this.npmPackageName:${this.npmPackageName}`,
      `this.npmPackageVersion:${this.npmPackageVersion}`,
    );
  }

  /**
   * The exec method obtains the entry file of the corresponding npm command package
   * and passes the original parameters through to the corresponding npm package responsible
   * for logical processing
   */
  async exec() {
    let pkg: Package = {} as Package;
    if (!this.commandLocalPath) {
      this.commandLocalPath = path.resolve(this.cliHomePath, 'dependencies');
      this.cliStorePath = path.resolve(this.commandLocalPath, 'node_modules');
      this.npmPackageVersion = await getNewtestVersion(this.npmPackageName);
      pkg = new Package({
        npmPackageName: this.npmPackageName,
        npmPackageVersion: this.npmPackageVersion,
        commandLocalPath: this.commandLocalPath,
        cliStorePath: this.cliStorePath,
      });
      aceLog.log(
        'verbose',
        'ExecCommand',
        'exec',
        `this.commandLocalPath:${this.commandLocalPath}`,
        `this.cliHomePath:${this.cliHomePath}`,
        `this.npmPackageName:${this.npmPackageName}`,
        `this.npmPackageVersion:${this.npmPackageVersion}`,
      );
      if (await pkg.exists()) {
        await pkg.update();
      } else {
        await pkg.install();
      }
    } else {
      pkg = new Package({
        npmPackageName: this.npmPackageName,
        npmPackageVersion: this.npmPackageVersion,
        commandLocalPath: this.commandLocalPath,
      });
    }
    const entryJs = await pkg.getEntryJsPath();
    aceLog.log('verbose', 'ExecCommand', 'exec', 'entryjs', entryJs);
    if (entryJs) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require(entryJs).call(null, ...this._argv);
    } else {
      throw new Error(red(`Cannot find entry file in package ${this.cmdName}`));
    }
  }
}

export function exec() {
  return new ExecCommand(arguments);
}
