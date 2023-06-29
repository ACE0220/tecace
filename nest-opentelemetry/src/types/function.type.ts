export interface Type<T = any> extends Function {
  new (...args: any[]): T;
}

export type PublicFunctionType<T = any> = Type<T> | Function;
