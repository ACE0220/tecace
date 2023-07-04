import { aceLog, colorette } from '@tecace/ace-log';
import { getNewtestVersion, greaterThan } from '@tecace/npm-info';
import { userdir } from 'userdir';
import { Command } from 'commander';
import path from 'path';
import fs from 'fs';
import dotEnv from 'dotenv';
import rootCheck from 'root-check';
import pkg from '../package.json';
import { exec } from '@tecace/command-exec';

const { red, yellow } = colorette;
aceLog.setLevel('info');
const program = new Command();

function printCliVersion() {
  aceLog.log('info', `version: ${pkg.version}`);
}

function getUserHome() {
  const userHome = userdir();
  return userHome;
}

function createDefaultConfig() {
  const userhome = getUserHome();
  if (!process.env.CLI_HOME_PATH) {
    process.env.CLI_HOME_PATH = path.join(userhome, '.ace-cli');
  } else {
    process.env.CLI_HOME_PATH = path.join(userhome, process.env.HOME_PATH);
  }
  aceLog.log('info', `Home path: ${process.env.CLI_HOME_PATH}`);
}

function checkEnv() {
  const envPath = path.resolve(getUserHome(), '.cli_env');
  if (fs.existsSync(envPath)) {
    dotEnv.config({
      path: envPath,
    });
  }
  createDefaultConfig();
}

function checkUserHome() {
  if (!getUserHome() || !fs.existsSync(getUserHome())) {
    throw new Error(red('user home is not exsits'));
  }
}

/**
 * check root account
 * 0: root user
 * 501: current user
 * User degradation is performed using the root-check package
 */
function checkRoot() {
  rootCheck();
}

/**
 * check the cli latest version
 */
async function checkUpdate() {
  const currentVersion = pkg.version || '0.0.1';
  try {
    const latestVersion = await getNewtestVersion(pkg.name);
    if (latestVersion && greaterThan(latestVersion, currentVersion)) {
      aceLog.log(
        'warn',
        yellow(`please update ${pkg.name}, latest version is ${latestVersion}`),
      );
      aceLog.log('warn', yellow(`update command: npm install -g ${pkg.name}`));
    }
  } catch (e) {
    aceLog.log('error', red(e));
  }
}

async function prepare() {
  printCliVersion();
  checkEnv();
  checkUserHome();
  checkRoot();
  await checkUpdate();
}

async function registerCommand() {
  // registration ace-cli
  program
    .name(Object.keys(pkg.bin)[0])
    .usage('<command> [options]')
    .version(pkg.version)
    .option('-d, --debug', 'debug mode', false)
    .option(
      '-lc, --localPath <localPath>',
      'Specifies the local command file path',
      '',
    );

  // registration init command
  program
    .command('init [projectName]')
    .option('-f, --force', 'force init project', false)
    .action(exec as any);

  // monitor --debug option
  program.on('option:debug', function () {
    const debug = program.opts().debug;
    if (debug) {
      process.env.CLI_LOG_LEVEL = 'verbose';
    } else {
      process.env.CLI_LOG_LEVEL = 'info';
    }
    aceLog.setLevel('verbose');
    aceLog.log('verbose', yellow('cli now is in debug mode'));
  });

  // monitor -lc --localPath
  program.on('option:localPath', function () {
    const localPath = program.opts().localPath;
    if (localPath) {
      process.env.COMMAND_LOCAL_PATH = localPath;
    }
  });

  // monitor unknown command
  // System displays a message indicating that the command is unavailable, and the available commands are displayed
  program.on('command:*', function (cmdObj) {
    const availableCommand = program.commands.map((cmd) => cmd.name());
    aceLog.log('error', red(`unavailable command: ${cmdObj[0]}`));
    if (availableCommand.length > 0) {
      aceLog.log(
        'error',
        red(`available commands: [${availableCommand.join(',')}]`),
      );
    }
  });

  program.parse(process.argv);

  // Print help document without any entering command
  if (program.args && program.args.length < 1) {
    program.outputHelp();
    console.log();
  }
}

async function entry() {
  try {
    await prepare();
    registerCommand();
  } catch (e) {
    aceLog.log('error', e);
  }
}

export default entry;
