# @tecace/nest-consul

**请注意：本工具的主要目的是为了帮助 NestJS 用户更轻松地进行 consul 服务注册和健康检查，而不是为了封装 Consul 的 API。使用该工具时，可以选择自动或手动注册服务，然后通过 api 获取 Consul 实例，可以像使用官方 API 一样使用它来管理服务或进行二次封装。**

base on node-consul@1.2.0 https://www.npmjs.com/package/consul/v/1.2.0

基于 node-consul 的 1.2.0 版本封装的 nestjs 版本，封装了服务和健康检查注册/注销，kv 存储操作等功能，绑定了自动注册服务/健康检查，可以手动注销服务和健康检查。

# Documentation

## install

```sh
npm install @tecace/nest-consul
# or
pnpm add @tecace/nest-consul
```

## use

这里只是核心的代码，当中还涉及了微服务的创建，运行等，参考官方文档 https://docs.nestjs.com/microservices/grpc#grpc

```typescript
// app.modules.ts or any.modules.ts
import { ConsulModule, ConsulService } from '@tecace/nest-consul';

@Module({
  imports: [
    // 参数类型是InitOptions, 下文会提到InitOptions的类型
    ConsulModule.register({
      host: 'localhost',
      port: '8500',
      promisify: true,
      autoRegister: true, // 自动注册服务与健康检查
      registerOptions: {
        // 服务配置
        id: 'user-service',
        name: 'user-service',
        port: 5001,
        address: 'localhost',
      },
      check: {
        // 可选，健康检查配置，要注册健康检查，需要开发好对应接口，consul会根据提供的grpc/http等类型进行检查
        id: 'user_health_check',
        name: 'user_health_check',
        // http: 'localhost:5001/health/check'
        grpc: 'localhost:5001',
        interval: '15s',
        ttl: '10s',
      },
    }),
  ],
  controllers: [AppController],
  providers: [ConsulService], // 需要提供ConsulService，在AppController中才能使用consulService
})
export class AppModule {}
```

```typescript
// app.controller.ts or any.controller.ts
import { Controller, Inject } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ConsulService } from '@tecace/nest-consul';
@Controller()
export class AppController {
  // 这里注入了consulService的实例，会基于在app.module.ts中导入模块的配置进行操作
  constructor(@Inject(ConsulService) private consulService: ConsulService) {}

  // 这里需要实现grpc健康检查
  @GrpcMethod('Health', 'Check')
  healthCheck() {
    return {
      status: 1,
    };
  }

  // 实现服务和健康检查的注销
  @GrpcMethod('Health', 'Deregister')
  async deregister() {
    const [err] = await this.consulService.srvDeregistration();
    if (err) {
      console.error(err);
    }
  }

  // 实现服务和检查检查的注册
  @GrpcMethod('Health', 'Register')
  async register() {
    const [err] = await this.consulService.srvRegistration();
    if (err) {
      console.error(err);
    }
  }
}
```

**注意：如果使用 grpc 进行健康检查，这个包名不可以改动**
**注意：如果使用 grpc 进行健康检查，这个包名不可以改动**
**注意：如果使用 grpc 进行健康检查，这个包名不可以改动**

PS: I don't know why, 每次改了健康检查它就是不行。

protofile 官方原代码：https://github.com/grpc/grpc/blob/master/doc/health-checking.md

下面的 proto 文件是笔者增加了一些

```proto
syntax = "proto3";

package grpc.health.v1;

message HealthCheckRequest {
  string service = 1;
}

message HealthCheckResponse {
  enum ServingStatus {
    UNKNOWN = 0;
    SERVING = 1;
    NOT_SERVING = 2;
    SERVICE_UNKNOWN = 3;  // Used only by the Watch method.
  }
  ServingStatus status = 1;
}

message Empty {}

service Health {
  rpc Check(HealthCheckRequest) returns (HealthCheckResponse);
  rpc Deregister(Empty) returns (Empty);
  rpc Register(Empty) returns (Empty);
  rpc Watch(HealthCheckRequest) returns (stream HealthCheckResponse);
}
```

## api

#### getConsulInstance(): Consul.Consul; 核心 api

返回初始化后的 consul 实例，从而像使用官方 API 一样使用，初始化 Consul 阶段基于 InitOptions 中的 ConsulOptions 部分，InitOptions 请查看下一小节

```
const consul = consulService.getConsulInstance();
// 假如要使用catalog
consul.catalog.register(options)
// 要使用session
consul.session.create();
```

#### constructor(consulOptions: InitOptions);

ConsulModule.register(consulOptions: InitOptions)

```typescript
// InitOptions是基于官方提供的类型进行合并或者扩展
export type InitOptions = ConsulOptions & {
  autoRegister?: boolean; //是否自动注册
  registerOptions: Consul.Agent.Service.RegisterOptions; // 服务配置
  // 健康检查配置
  check?: Consul.Agent.Check.RegisterOptions & {
    id: string;
    grpc?: string;
  };
};
```

#### srvRegistration(): Promise<[err: string]>;

服务和健康检查注册，如果在 InitOptions 中提供了 autoRegister，那么这个 api 在初始化阶段会自动调用

```typescript
const [err] = await consulService.srvRegistration();
```

#### srvDeregistration(): Promise<[err: string]>;

服务和健康检查注销

```typescript
const [err] = await consulService.srvDeregistration();
```

#### kvSet(data: Consul.Kv.SetOptions): Promise<[err: string]>;

k/v 存的设置，data 类型是 Consul.kv.SetOptions

```typescript
const [err] = await consulService.kvSet({
  key: 'someKey',
  value: 'someValue',
  dc: 'datacenter in your defination',
  ...
});
```

#### kvGet(data: Consul.Kv.GetOptions): Promise<[err: string, data: any]>;

k/v 获取的设置，data 类型是 Consul.kv.GetOptions

```typescript
const [err, res] = await consulService.kvGet({
  key: 'someKey',
  dc: 'datacenter in your defination',
  ...
});
```
