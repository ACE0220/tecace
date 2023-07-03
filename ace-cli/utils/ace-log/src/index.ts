import npmlog, { LogLevels } from 'npmlog';
import colorette, { yellow, white, blue, red } from 'colorette';
// "silly" , "verbose" , "info" , "timing" , "http" , "notice" , "warn" , "error" , "silent"

class Acelog {
  mapping: Record<string, any> = {
    silly: yellow,
    verbose: white,
    info: white,
    timing: white,
    http: blue,
    notice: yellow,
    warn: yellow,
    error: red,
    silent: white,
  };

  static instance: Acelog;
  static getInstance(): Acelog {
    if (!this.instance) this.instance = new Acelog();
    return this.instance;
  }
  constructor() {
    this.setLevel('info');
    this.setHeading('ace-cli');
  }
  setHeading(heading: string) {
    npmlog.heading = heading;
  }
  setLevel(level: LogLevels) {
    npmlog.level = level;
  }
  setLevelColor(level: LogLevels, color: string) {
    if (colorette[color]) {
      this.mapping[level] = colorette[color];
    } else {
      this.log(
        'warn',
        `Color ${color} is not supported. Seeing https://www.npmjs.com/package/colorette?activeTab=readme`,
      );
    }
  }
  log(level: LogLevels, message: string, ...args: any[]): void {
    npmlog.log(level, '', this.mapping[level](message), ...args);
  }
}
export const aceLog = Acelog.getInstance();
export { colorette };
