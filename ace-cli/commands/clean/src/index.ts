import { Command } from '@tecace/model-command';
import { aceLog } from '@tecace/ace-log';
import { userdir } from 'userdir';
import { rimraf } from 'rimraf';
import path from 'path';
import fs from 'fs';
import { mkdirp } from 'mkdirp';
class CleanCommand extends Command {
  constructor(argv) {
    super(argv);
  }

  emptyDir(directory: string) {
    if (!fs.existsSync(directory)) {
      return;
    }
    fs.readdirSync(directory).forEach((file) => {
      const filePath = path.join(directory, file);
      if (fs.statSync(filePath).isDirectory()) {
        this.emptyDir(filePath);
        fs.rmdirSync(filePath);
      } else {
        fs.unlinkSync(filePath);
      }
    });
  }

  init() {
    aceLog.log('verbose', 'cleancommand', 'init');
  }

  async exec() {
    aceLog.log('verbose', 'cleancommand', 'exec');
    const cliHomePath = process.env.CLI_HOME_PATH;
    const userhome = userdir();
    const homePath = path.resolve(userhome, cliHomePath);
    try {
      await rimraf(homePath);
      await mkdirp(homePath);
      aceLog.log('info', 'Clean Cache succed');
    } catch (e) {
      aceLog.log('error', 'CleanCommand', 'exec', e);
    }
  }
}

export default function clean() {
  return new CleanCommand(arguments);
}
