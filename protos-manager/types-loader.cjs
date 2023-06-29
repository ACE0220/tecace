const { readdirSync, statSync, writeFileSync } = require('fs');
const { resolve, relative } = require('path');

const currentDir = resolve(__dirname, 'src/proto-types/protos');

function scanTs(currentDir) {
  const files = readdirSync(currentDir);
  let paths = [];
  files.forEach((item) => {
    const fullPath = resolve(currentDir, item);
    const stat = statSync(fullPath);
    if (stat.isFile()) {
      paths.push(fullPath);
    } else if (stat.isDirectory()) {
      paths = [...paths, ...scanTs(fullPath)];
    }
  });
  return paths;
}

const exec = async () => {
  const paths = scanTs(currentDir).map((item) => {
    const lastIndex = item.lastIndexOf('.');
    return item.slice(0, lastIndex);
  });
  const indexDir = resolve(currentDir, '../index.ts');
  const relatives = paths.map((item) => {
    return relative(resolve(indexDir, '../'), item);
  });
  const content = relatives
    .map((item) => `export * from './${item}';`)
    .join('\n');
  writeFileSync(indexDir, content);
};

exec();
