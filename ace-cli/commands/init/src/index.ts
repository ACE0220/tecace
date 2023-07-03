import fs from 'fs';
import fsExtra from 'fs-extra';
import inquirer from 'inquirer';
import { glob } from 'glob';
import ejs from 'ejs';
import { Command } from '@tecace/model-command';
import Package from '@tecace/model-pkg';
import { aceLog, colorette } from '@tecace/ace-log';
import { semverValid } from '@tecace/npm-info';
import templatesMap from './templatesMap';
import path from 'path';

const { red } = colorette;

class InitCommand extends Command {
  projectName: string;
  force: boolean;
  localPath: string;
  templates: Array<any>;
  cwdEmpty: boolean;
  newProjectInfo: any;
  templatePackage: Package;
  constructor(argv) {
    super(argv);
  }

  /**
   * obtains the projectName
   * obtains if force to init
   * obtains templates, if templates.length is 0, stop processing;
   * check whether the cwd is empty, if is not empty, use the force option to confirm whether to overwrite
   */
  init() {
    try {
      aceLog.log('verbose', 'InitCommand', 'init method');
      this.projectName = this.cmdValue;
      this.force = this.cmdOptions.force;
      const templates = this.getTemplates();
      this.templates = templates;
      this.localPath = process.cwd();
      this.cwdEmpty = this.isCwdEmpty(this.localPath);
    } catch (e) {
      aceLog.log('error', red(e));
    }
  }

  /**
   * Returns templates or throw new error to stop processing
   * @returns temapltes
   */
  getTemplates() {
    if (!templatesMap || templatesMap.length === 0) {
      throw new Error(red('There are no templates, stop processing'));
    }
    return templatesMap;
  }

  /**
   * Check whether the path is empty
   * @param {*} localPath
   * @returns boolean
   */
  isCwdEmpty(localPath: string) {
    let fileList = fs.readdirSync(localPath);
    fileList = fileList.filter((file) => {
      return !file.startsWith('.') && ['node_modules'].indexOf(file) < 0;
    });

    return !fileList || fileList.length <= 0;
  }

  /**
   * clear cwd with not empty
   * return item information entered or selected by the user
   * @returns  {
   *  projectName: string,
   *  projectVersion: string,
   *  author: string,
   *  projectTemplate: string
   * }
   */
  async prepare() {
    if (!this.cwdEmpty) {
      let ifcontinue = false;
      if (!this.force) {
        ifcontinue = (
          await inquirer.prompt({
            type: 'confirm',
            name: 'ifcontinue',
            message:
              'Current working directory is not empty, whether to continue?',
            default: false,
          })
        ).ifcontinue;
        if (!ifcontinue) return;
      }
      if (this.force || ifcontinue) {
        const { confirmDelete } = await inquirer.prompt({
          type: 'confirm',
          name: 'confirmDelete',
          message:
            'Clear the current workspace directory? (dangerous operation)',
          default: false,
        });
        if (confirmDelete) {
          aceLog.log(
            'warn',
            'The user selected clear current workspace directory',
          );
          fsExtra.emptyDirSync(this.localPath);
        } else {
          return;
        }
      }
    }
    return this.getProjectInfo();
  }

  async getProjectInfo() {
    const newProjectInfo = await inquirer.prompt([
      {
        type: 'input',
        message: 'Project name',
        name: 'projectName',
        default: this.projectName,
        validate: function (v) {
          const done = this.async();
          setTimeout(function () {
            if (
              !/^(@[a-z]+[a-z0-9]+\/)?[a-z]+([-][a-z][a-z0-9]*|[_][a-z][a-z0-9]*|[a-z][a-z0-9])$/.test(
                v,
              )
            ) {
              done('Invalid project name');
              return;
            }
            return done(null, true);
          }, 0);
        },
      },
      {
        type: 'input',
        message: 'Project version, example: 1.0.0 ',
        name: 'projectVersion',
        default: '1.0.0',
        validate: function (v) {
          const done = this.async();
          setTimeout(function () {
            if (!!!semverValid(v)) {
              done('Invalid project version');
              return;
            }
            return done(null, true);
          }, 0);
        },
        filter: function (v) {
          if (!!semverValid(v)) {
            return semverValid(v);
          }
          return v;
        },
      },
      {
        type: 'input',
        message: 'author',
        name: 'projectAuthor',
        default: '',
      },
      {
        type: 'input',
        message: 'description',
        name: 'projectDescription',
        default: '',
      },
      {
        type: 'list',
        message: 'Choose templates',
        name: 'projectTemplate',
        choices: this.createTemplateChoices(),
      },
    ]);
    aceLog.log('verbose', 'getProjectInfo', newProjectInfo);
    return newProjectInfo;
  }

  createTemplateChoices() {
    return this.templates.map((item) => ({
      name: item.name,
      value: item.npmPackageName,
    }));
  }

  async exec() {
    this.newProjectInfo = await this.prepare();
    if (this.newProjectInfo) {
      // 2. download template
      await this.downloadTemplate();
      // 3. install template
      await this.installTemplate();
    }
  }

  async downloadTemplate() {
    const cliHomePath = process.env.CLI_HOME_PATH;
    const templateTargetPath = path.resolve(cliHomePath, 'templates');
    const templateStorePath = path.resolve(templateTargetPath, 'node_modules');
    const { projectTemplate } = this.newProjectInfo;
    const { npmPackageName, npmPackageVersion } = this.templates.find(
      (item) => item.npmPackageName === projectTemplate,
    );
    const templatePackage = new Package({
      npmPackageName,
      npmPackageVersion,
      commandLocalPath: templateTargetPath,
      cliStorePath: templateStorePath,
    });
    if (!(await templatePackage.exists())) {
      try {
        await templatePackage.install();
      } catch (e) {
        aceLog.log('error', e);
      } finally {
        if (await templatePackage.exists()) {
          aceLog.log('info', 'download template success');
          this.templatePackage = templatePackage;
        }
      }
    } else {
      try {
        aceLog.log('info', `${npmPackageName} exists, start to check update`);
        await templatePackage.update();
      } catch (e) {
        aceLog.log('error', e);
      } finally {
        if (templatePackage.exists()) {
          this.templatePackage = templatePackage;
        }
      }
    }
  }

  async installTemplate() {
    try {
      const templatePath = path.resolve(
        this.templatePackage.cacheNpmPath,
        'template',
      );
      const targetPath = process.cwd();
      fsExtra.ensureDirSync(templatePath);
      fsExtra.ensureDirSync(targetPath);
      fsExtra.copySync(templatePath, targetPath);
      await this.ejsRender({
        cwd: process.cwd(),
        ignore: [
          'node_modules/**',
          '**/__test__/**',
          'public',
          '**/*.{png,jpeg,gif,ico}',
          'mock/**',
        ],
        nodir: true,
        dot: true,
      });
      aceLog.log('info', 'Init project success');
    } catch (e) {
      aceLog.log('error', 'installTemplate function', e);
    }
  }

  async ejsRender(options: any = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        const fileList = await glob('**', options);
        Promise.all(
          fileList.map(async (file) => {
            const filePath = path.join(options.cwd, file);
            aceLog.log('verbose', filePath);
            const res = await ejs.renderFile(filePath, this.newProjectInfo);
            await fsExtra.writeFile(filePath, res as string);
            return res;
          }),
        )
          .then((res) => {
            resolve(res);
          })
          .catch((err) => {
            reject(err);
          });
      } catch (e) {
        aceLog.log('error', 'ejsRender function', e);
      }
    });
  }
}

export default function init() {
  return new InitCommand(arguments);
}
