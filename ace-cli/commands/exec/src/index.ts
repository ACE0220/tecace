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
    aceLog.log('verbose', 'ExecCommand', 'constructor');
    super(argv);
  }

  /**
   * The init method is mainly responsible for obtaining targetPath and homePath,
   * targetPath is a flag indicating whether to use the local npm.
   * If targetPath does not exist, use the cached npm package
   * or download the package from the npm registry and cache it to the local for use
   */
  init() {
    aceLog.log('verbose', 'ExecCommand', 'init');
    const { cmdName } = this;
    this.npmPackageName = cmdPkgMap[cmdName].npmPackageName;
    this.npmPackageVersion = cmdPkgMap[cmdName].npmPackageVersion;
    this.commandLocalPath = process.env.COMMAND_LOCAL_PATH;
    this.cliHomePath = process.env.CLI_HOME_PATH;
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
      aceLog.log('verbose', 'init commandLocalPath', this.commandLocalPath);
      this.cliStorePath = path.resolve(this.commandLocalPath, 'node_modules');
      aceLog.log('verbose', 'init cliStorePath', this.cliStorePath);
      this.npmPackageVersion = await getNewtestVersion(this.npmPackageName);
      pkg = new Package({
        npmPackageName: this.npmPackageName,
        npmPackageVersion: this.npmPackageVersion,
        commandLocalPath: this.commandLocalPath,
        cliStorePath: this.cliStorePath,
      });
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
    aceLog.log('verbose', 'ExecCommand', 'exec', entryJs);
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
