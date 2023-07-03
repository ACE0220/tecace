import axios, { InternalAxiosRequestConfig } from 'axios';
import md5 from 'md5';
import { LRUCache } from './lru';
import { InitOptions } from './types';

const originalHttp = axios.create();
const http = axios.create();
const cache = new LRUCache();

// let globalOptions: InitOptions;

function sortKey(obj = {}) {
  const ret = {};
  Object.keys(obj)
    .sort()
    .forEach((key) => {
      ret[key] = obj[key];
    });
}

function genHashByConfig(config: InternalAxiosRequestConfig) {
  const target = {
    method: config.method,
    url: config.url,
    params:
      config.method.toLowerCase() === 'get' ? sortKey(config.params) : null,
    data:
      config.method.toLocaleLowerCase() === 'post'
        ? sortKey(config.data)
        : null,
  };
  return md5(JSON.stringify(target));
}

http.interceptors.response.use(
  (response) => {
    // 设置缓存
    const hashKey = genHashByConfig(response.config);
    cache.set(hashKey, { data: response.data });
    return response.data;
  },
  function (error) {
    return Promise.reject(error);
  },
);

http.interceptors.request.use((config) => {
  const source = axios.CancelToken.source();
  config.cancelToken = source.token;

  const hashKey = genHashByConfig(config);
  if (cache.has(hashKey)) {
    const result = cache.get(hashKey);
    source.cancel(JSON.stringify(result.data));
  }
  return config;
});

// export { http };

export function createHttp(initOptions: InitOptions) {
  if (!initOptions.cache) return originalHttp;
  // globalOptions = initOptions;
  return http;
}
