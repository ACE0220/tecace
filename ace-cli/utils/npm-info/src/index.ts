import semver from 'semver';
import { createRequest } from '@tecace/request';
import { aceLog, colorette } from '@tecace/ace-log';
import {
  spinnerFail,
  spinnerStart,
  spinnerStop,
  spinnerSucced,
} from '@tecace/spinner';

const { red } = colorette;

/**
 * 获取默认的registry，可以通过process.env传入，或在函数中传入一个boolean值，true返回官方，false返回taobao
 * @param isOriginal
 * @returns npmjs url or taobao url
 */
export function getDefaultRegistry(isOriginal?: boolean) {
  if (process.env.NPM_REGISTRY) {
    return process.env.NPM_REGISTRY;
  }
  return isOriginal === true
    ? 'http://registry.npmjs.org'
    : 'https://registry.npm.taobao.org';
}

/**
 * get package's all infomation
 * @param {*} npmPackageName
 * @param {*} registry
 * @returns An array of all versions
 */
export async function getNpmFullVersions(npmPackageName: string) {
  if (!npmPackageName) return null;
  const registryUrl = getDefaultRegistry(true);
  const request = createRequest({
    baseURL: registryUrl,
    timeout: 5000,
  });
  spinnerStart('Checking latest version');
  try {
    const fullInfo = await request.get(npmPackageName);
    spinnerSucced(`Check ${npmPackageName} latest version succed`);
    return Object.keys((fullInfo as any).versions);
  } catch (e) {
    spinnerFail(red(`Check ${npmPackageName} latest version failed`));
    throw new Error(e);
  } finally {
    spinnerStop();
  }
}

/**
 *
 * @param {*} versions
 * @returns returns an array of versions after sort, the first item is latest
 */
export function sortVersions(versions: Array<any>) {
  return versions.sort((a, b) => (semver.gte(a, b) ? -1 : 1));
}

/**
 *
 * @param {*} npmPackageName package name
 * @returns latest version of npm package
 */
export async function getNewtestVersion(npmPackageName: string) {
  try {
    const fullVersions = await getNpmFullVersions(npmPackageName);
    aceLog.log('verbose', 'npm-info', 'getNewtestVersion', fullVersions);
    const sortVers = sortVersions(fullVersions);
    return sortVers[0];
  } catch (e) {
    aceLog.log('error', 'npm-info', 'getNewtestVersion', e);
  }
}

/**
 * compare two version of one package
 * @param {*} newVersion
 * @param {*} oldVersion
 * @returns newVersion is greater then oldVersion ?
 */
export function greaterThan(newVersion: string, oldVersion: string) {
  return semver.gt(newVersion, oldVersion);
}

/**
 * compare two version of one package
 * @param {*} newVersion
 * @param {*} oldVersion
 * @returns newVersion is greater then or equals oldVersion ?
 */
export function greaterThanAndEquals(newVersion: string, oldVersion: string) {
  return semver.gte(newVersion, oldVersion);
}

export function semverValid(version: string) {
  return semver.valid(version);
}

// export {
//   getDefaultRegistry,
//   getNewtestVersion,
//   greaterThan,
//   greaterThanAndEquals,
//   semverValid,
// };
