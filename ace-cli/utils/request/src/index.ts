'use strict';

import axios from 'axios';
import { aceLog, colorette } from '@tecace/ace-log';
const { red } = colorette;

export function createRequest(options) {
  if (!options.baseURL) {
    throw new Error(red('options.BASE_URL is undefined'));
  }
  try {
    const request = axios.create(options);

    request.interceptors.request.use((config) => {
      return config;
    });

    request.interceptors.response.use(
      (response) => {
        if (response.status === 200) {
          return response.data;
        }
      },
      (error) => {
        return Promise.reject(error);
      },
    );
    return request;
  } catch (e) {
    aceLog.log('error', e);
  }
}
