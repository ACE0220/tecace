import path from 'path';
import npminstall from 'npminstall';
import pkgDir from 'pkg-dir';
import {
  getDefaultRegistry,
  getNewtestVersion,
  greaterThan,
} from '@tecace/npm-info';
import { mkdirSync, checkPathExists, formatPath } from '@tecace/path';
import { aceLog } from '@tecace/ace-log';

type IniOptions = {
  npmPackageName: string;
  npmPackageVersion: string;
  commandLocalPath: string;
  cliStorePath?: string;
};

export default class Package {
  npmPackageName: string;
  npmPackageVersion: string;
  cliStorePath: string;
  commandLocalPath: string;
  cacheNpmPath: string;

  constructor(options: IniOptions) {
    const {
      npmPackageName,
      npmPackageVersion,
      commandLocalPath,
      cliStorePath,
    } = options;
    this.npmPackageName = npmPackageName;
    this.npmPackageVersion = npmPackageVersion;
    this.cliStorePath = cliStorePath;
    this.commandLocalPath = commandLocalPath;
  }

  async prepare() {
    const pathExists = await checkPathExists(this.cliStorePath);
    if (this.cliStorePath && !pathExists) {
      mkdirSync(this.cliStorePath);
    }

    if (this.npmPackageVersion === 'latest') {
      this.npmPackageVersion = await getNewtestVersion(this.npmPackageName);
    }
  }

  getCacheNpmPath(storeDir, npmPackageName, npmPackageVersion) {
    const pkgName = npmPackageName.replace('/', '+');
    const forPath = formatPath(
      path.resolve(
        storeDir,
        '.store',
        `${pkgName}@${npmPackageVersion}`,
        'node_modules',
        `${npmPackageName}`,
      ),
    );
    this.cacheNpmPath = forPath;
    return forPath;
  }

  async exists() {
    if (this.cliStorePath) {
      await this.prepare();
      return await checkPathExists(
        this.getCacheNpmPath(
          this.cliStorePath,
          this.npmPackageName,
          this.npmPackageVersion,
        ),
      );
    } else {
      return await checkPathExists(this.commandLocalPath);
    }
  }

  async install() {
    await this.prepare();
    aceLog.log(
      'info',
      `${this.npmPackageName}@${this.npmPackageVersion} is not installed`,
    );
    try {
      return await npminstall({
        root: this.commandLocalPath,
        storeDir: this.cliStorePath,
        registry: getDefaultRegistry(true),
        pkgs: [{ name: this.npmPackageName, version: this.npmPackageVersion }],
      });
    } catch (e) {
      aceLog.log('error', e);
    }
  }

  async update() {
    await this.prepare();
    const latestVersion = await getNewtestVersion(this.npmPackageName);
    if (greaterThan(latestVersion, this.npmPackageVersion)) {
      const latestPackagePath = this.getCacheNpmPath(
        this.cliStorePath,
        this.npmPackageName,
        latestVersion,
      );
      this.npmPackageVersion = latestVersion;
      if (!(await checkPathExists(latestPackagePath))) {
        let result = null;
        try {
          result = await npminstall({
            root: this.commandLocalPath,
            storeDir: this.cliStorePath,
            registry: getDefaultRegistry(true),
            pkgs: [
              {
                name: this.npmPackageName,
                version: latestVersion,
              },
            ],
          });
        } catch (e) {
          aceLog.log('error', e);
        } finally {
          if (await checkPathExists(latestPackagePath)) {
            aceLog.log(
              'info',
              `${this.npmPackageName}@${latestVersion} update sucessed`,
            );
            return result;
          }
        }
      } else {
        aceLog.log('info', `${this.npmPackageName}@${latestVersion} is exists`);
        return latestPackagePath;
      }
    } else {
      aceLog.log(
        'info',
        `${this.npmPackageName}@${this.npmPackageVersion} is latest`,
      );
      return this.getCacheNpmPath(
        this.cliStorePath,
        this.npmPackageName,
        this.npmPackageVersion,
      );
    }
  }

  getEntryJsPath() {
    async function _getRootFile(pkgPath) {
      const pkgRootDir = await pkgDir(pkgPath);
      const pkgJsonPath = path.resolve(pkgRootDir, 'package.json');
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const pkgJsonMain = require(pkgJsonPath).main;
      const pkgJsonMainJsPath = path.resolve(pkgRootDir, pkgJsonMain);
      if (pkgJsonMainJsPath) {
        return pkgJsonMainJsPath;
      }
      return null;
    }
    if (this.cliStorePath) {
      return _getRootFile(
        this.getCacheNpmPath(
          this.cliStorePath,
          this.npmPackageName,
          this.npmPackageVersion,
        ),
      );
    }
    return _getRootFile(this.commandLocalPath);
  }
}
