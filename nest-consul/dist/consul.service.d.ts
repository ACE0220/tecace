import Consul from 'consul';
import { InitOptions } from './types';
export declare class ConsulService {
    private consulOptions;
    consul: Consul.Consul;
    constructor(consulOptions: InitOptions);
    getConsulInstance(): Consul.Consul;
    srvRegistration(): Promise<[err: string]>;
    srvDeregistration(): Promise<[err: string]>;
    kvSet(data: Consul.Kv.SetOptions): Promise<[err: string]>;
    kvGet(data: Consul.Kv.GetOptions): Promise<[err: string, data: any]>;
}
