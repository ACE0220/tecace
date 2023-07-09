import Consul from 'consul';
import { ConsulOptions } from 'consul';

export type InitOptions = ConsulOptions & {
  autoRegister?: boolean;
  registerOptions: Consul.Agent.Service.RegisterOptions;
  check?: Consul.Agent.Check.RegisterOptions & {
    id: string;
    grpc?: string;
  };
};

export type HealthCheckRegisterOptions = Consul.Agent.Check.RegisterOptions & {
  grpc?: string;
};

export type ConsulServiceDetail = {
  ID: string;
  Service: string;
  Tags: Array<string>;
  Meta: Record<any, any>;
  Port: number | string;
  Address: string;
  Datacenter: string;
};

export type ConsulServiceList = {
  [key: string]: ConsulServiceDetail;
};
