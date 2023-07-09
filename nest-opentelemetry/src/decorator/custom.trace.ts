import { GLOBAL_TARGET } from 'src/global.target';
export const CustomTrace = () => {
  return (target: Function) => {
    Reflect.defineMetadata(
      target.prototype.constructor.name,
      target,
      GLOBAL_TARGET,
    );
  };
};
