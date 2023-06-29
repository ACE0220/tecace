import { Injectable, Inject } from '@nestjs/common';
import Consul from 'consul';
import { InitOptions } from './types';
/**
 *
 * @api {} import 将模块导入到module
 * @apiVersion 0.0.1
 * @apiName import
 * @apiGroup Consul
 * @apiDescription
 *
 * 在module中
 * imports: [
      ConsulModule.register({
        host: 'localhost',
        port: '8500',
        promisify: true,
      }),
    ],
 */
@Injectable()
export class ConsulService {
  consul!: Consul.Consul;
  /**
   *
   * @api {} new 初始化
   * @apiVersion 0.0.1
   * @apiName new
   * @apiGroup Consul
   * @apiDescription
   *
   * 在控制器中
   * constructor(@Inject(ConsulService) private consulService: ConsulService){}
   */
  constructor(@Inject('consulOptions') private consulOptions: InitOptions) {
    this.consul = new Consul(this.consulOptions);
    if (consulOptions.autoRegister) {
      this.srvRegistration();
    }
  }

  /**
   * @api {} getConsulInstance 获取consul实例
   * @apiVersion 0.0.1
   * @apiName getConsulInstance
   * @apiGroup Consul
   * @apiExample {curl} Example usage:
   *  consulService.getConsulInstance()
   */
  getConsulInstance() {
    return this.consul;
  }

  /**
   * @api {} srvRgistration 服务注册
   * @apiVersion 0.0.1
   * @apiName srvRgistration
   * @apiGroup Consul
   * @apiExample {curl} Example usage:
   *  consulService.srvRgistration()
   */
  async srvRegistration(): Promise<[err: string]> {
    if (!this.consulOptions.registerOptions) {
      throw new Error('Please provide registerOptions in InitOptions');
    }
    let err = null;
    try {
      if (this.consulOptions.check) {
        await this.consul.agent.check.register(this.consulOptions.check);
      }
      await this.consul.agent.service.register(
        this.consulOptions.registerOptions,
      );
    } catch (e) {
      err = e;
    }
    return [err];
  }

  /**
   * @api {} srvDeregistration 服务取消注册
   * @apiVersion 0.0.1
   * @apiName srvDeregistration
   * @apiGroup Consul
   * @apiExample {curl} Example usage:
   *  consulService.srvDeregistration()
   */
  async srvDeregistration(): Promise<[err: string]> {
    if (!this.consulOptions.registerOptions) {
      throw new Error('Please provide registerOptions in InitOptions');
    }
    let err = null;
    try {
      if (this.consulOptions.check) {
        await this.consul.agent.check.deregister(this.consulOptions.check.id);
      }
      await this.consul.agent.service.deregister({
        id: this.consulOptions.registerOptions.id,
      });
    } catch (e) {
      err = e;
    }
    return [err];
  }

  /**
   * @api {} kvSet k/v存储-设置存储
   * @apiVersion 0.0.1
   * @apiName kvSet
   * @apiGroup Consul
   * @apiExample {curl} Example usage:
   *  consulService.kvSet({key: "somekey", value: "someValue"})
   */
  async kvSet(data: Consul.Kv.SetOptions): Promise<[err: string]> {
    let err = null;
    try {
      await this.consul.kv.set(data);
    } catch (e) {
      err = e;
    }
    return [err];
  }

  /**
   * @api {} kvGet k/v存储-获取存储
   * @apiVersion 0.0.1
   * @apiName kvGet
   * @apiGroup Consul
   * @apiExample {curl} Example usage:
   *  consulService.kvGet({key: "somekey"})
   */
  async kvGet(data: Consul.Kv.GetOptions): Promise<[err: string, data: any]> {
    let err = null;
    let res = null;
    try {
      res = await this.consul.kv.get(data);
    } catch (e) {
      err = e;
    }
    return [err, res];
  }
}
