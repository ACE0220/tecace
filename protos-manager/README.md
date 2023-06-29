# @tecace/protos-manager

# 注意

内部使用

## 描述

多服务间的proto管理解决方案，通过npm或git进行管理，支持基于proto文件生成对应.d.ts

## 功能

- 自动转换proto文件，生成.d.ts，可以通过import { SomeType } from '@tecace/protos-manager' 进行引入，类型与proto文件内的message，rpc相对应
- 提供api获取所有proto文件的package name
- 提供api获取所有的proto文件绝对路径

## 使用

建议使用pnpm

在protos-manager根目录

```sh
pnpm install
```

```sh
pnpm build
```

在其他项目文件内，笔者使用的是 nestjs

```proto
syntax = "proto3";

package acemall_user.user;

message ReqUserNameAndPassword {
  required string user_name = 1;
  required string user_password = 2;
}

message UserInfo {
  int32 user_id = 1;
  required string userName = 2;
  string token = 3;
}

message ResUserInfo {
  required int32 code = 1;
  required string message = 2;
  UserInfo data = 3;
}

service UserService {
  rpc Register(ReqUserNameAndPassword) returns (ResUserInfo){}
}
```


```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { protosLoader } from '@acemall/protos';
async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        url: 'localhost:5001',
        package: protosLoader.getPackages(), // 获取所有包名数组
        protoPath: protosLoader.getProtos(), // 获取所有protos路径数组
      },
    },
  );
  await app.listen();
}
bootstrap();
```

```typescript
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UserService } from './user.service';

// 上面的proto文件中的package是acemall_user.user，对应的ts中的顶层namespace就是acemall_user
import { acemall_user } from '@tecace/protos-manager'; 

@Controller()
export class UserController {
  constructor(
    private userService: UserService,
  ) {}

  @GrpcMethod('UserService', 'register')
  // 传入的data类型是acemall_user.user.ReqUserNameAndPassword
  // 对应proto文件中 package acemall_user.user 下的message ReqUserNameAndPassword
  async register(data: acemall_user.user.ReqUserNameAndPassword): Promise<acemall_user.user.ResUserInfo> {
    const res = await this.userService.createUser(data);
    return res;
  }

}

```

## api

### protosLoader.getPackages() 

返回所有proto文件中的package名称数组

```typescript
const packageNames: Array<string> = protosLoader.getPackage() // ["health", "acemall_user.user"]
```

### protosLoader.getProtos() 

返回所有proto文件绝对路径数据

```typescript
// ['/path/to/user.proto', '/path/to/category.proto']
const protoAbsolutPaths: Array<string> = protosLoader.getProtos()
```