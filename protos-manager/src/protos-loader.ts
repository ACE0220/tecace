import { glob } from 'glob';
import { resolve } from 'path';
import * as protoLoader from '@grpc/proto-loader';

interface TypeData {
  packages?: Array<string>;
  protos?: Array<string>;
  types?: Array<string>;
}

export function scanProtos(): TypeData {
  const packageNames = new Set<string>();
  const protoFiles = glob
    .sync(resolve(__dirname, '../', '**/*.proto'), {
      ignore: ['node_modules/**'],
      nodir: true,
      absolute: true,
    })
    .filter((item) => item.includes('dist'));
  const packageDefinition = protoLoader.loadSync(protoFiles, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });
  for (const key in packageDefinition) {
    const splitArr = key.split('.');
    const packageName = splitArr.slice(0, splitArr.length - 1).join('.');
    packageNames.add(packageName);
  }
  return {
    packages: Array.from<string>(packageNames),
    protos: protoFiles,
  };
}

class ProtosLoader {
  private datas: TypeData;
  private static instance: ProtosLoader;
  static getInstance() {
    if (!this.instance) {
      this.instance = new ProtosLoader();
    }
    return this.instance;
  }

  constructor() {
    this.datas = scanProtos();
  }

  getTypes() {
    return this.datas.types;
  }

  getProtos() {
    return this.datas.protos;
  }

  getPackages() {
    return this.datas.packages;
  }
}

export const protosLoader = ProtosLoader.getInstance();
