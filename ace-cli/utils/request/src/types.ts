export interface InitOptions {
  retry?: number;
  expires?: number;
  cache?: boolean;
}

export interface CacheValue {
  data: any;
  expires?: Date;
}
