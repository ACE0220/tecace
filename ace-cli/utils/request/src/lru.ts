export class LRUCache {
  capacity: number;
  cache: Map<string, any>;
  constructor(capacity = 50) {
    if (typeof capacity !== 'number' || capacity < 0) {
      throw new TypeError('capacity 必须为数字且大于0，默认为60');
    }
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key: string) {
    if (!this.cache.has(key)) {
      return -1;
    }
    const tmp = this.cache.get(key);
    // 将当前的缓存移动到最常用的位置
    this.cache.delete(key);
    this.cache.set(key, tmp);
    return tmp;
  }

  set(key: string, value: any) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      this.cache.keys();
      this.cache.delete(this.cache.keys().next().value);
    }
    this.cache.set(key, value);
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }
}
