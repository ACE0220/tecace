import { aceLog, colorette } from '@tecace/ace-log';
import { greaterThanAndEquals } from '@tecace/npm-info';
const LOWTEST_NODE_VERSION = '18.16.1';

const { red } = colorette;

export class Command {
  argv: ArrayLike<any>;
  _argv: Array<any>;
  cmdValue: string;
  cmdOptions: Record<any, any>;
  cmdObj: any;
  cmdName: any;
  constructor(argv: ArrayLike<any>) {
    if (typeof argv !== 'object' || !argv.length) {
      throw new Error('Command line arguments is not array like');
    }

    if (!argv || argv.length < 1) {
      throw new Error('Command line arguments cannot be empty');
    }

    this.argv = argv;
    this._argv = Array.from(argv);

    new Promise(() => {
      let chain = Promise.resolve();
      chain = chain.then(() => {
        this.checkNodeVersion();
      });
      chain = chain.then(() => {
        this.initCMDArgs();
      });
      chain = chain.then(() => {
        this.init();
      });
      chain = chain.then(() => {
        this.exec();
      });
      chain.catch((err) => {
        aceLog.log('error', red(err));
      });
    });
  }

  checkNodeVersion() {
    const version = process.version;
    const res = greaterThanAndEquals(version, LOWTEST_NODE_VERSION);
    if (!res)
      aceLog.log(
        'warn',
        red(
          `Upgrade the node version. The minimum version is ${LOWTEST_NODE_VERSION}. The current version is ${version}`,
        ),
      );
  }

  /**
   * init cmd args
   * this._argv is an array, first argument being the value immediately following command,
   * the second argument being option,
   * third argument being the command instance of program.
   *
   * example:
   * ace-cli init testProject --force
   * this._argv[0] is testProject
   * this._argv[1] is { force: true };
   */
  initCMDArgs() {
    this.cmdValue = this._argv[0];
    this.cmdOptions = this._argv[1];
    this.cmdObj = this._argv[this._argv.length - 1];
    this.cmdName = this.cmdObj.name();
  }

  init() {
    throw new Error(red('please implement the init method'));
  }
  exec() {
    throw new Error(red('please implement the exec method'));
  }
}
