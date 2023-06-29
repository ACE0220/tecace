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
