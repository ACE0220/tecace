import fsExtra from 'fs-extra';
import pathExists from 'path-exists';
import path from 'path';

export function checkPathExists(fullPath) {
  return pathExists(fullPath);
}

export function mkdirSync(fullPath) {
  fsExtra.mkdirSync(fullPath, {
    recursive: true,
  });
}

export function resolvePathBaseOnCwd(partOfPath) {
  return path.resolve(process.cwd(), partOfPath);
}

export function formatPath(p) {
  if (p) {
    const sep = path.sep;
    if (sep === '/') {
      return p;
    }
    return p.replace(/\\/g, '/');
  }
  return p;
}
