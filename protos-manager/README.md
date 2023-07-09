# @tecace/protos-manager

## 注意

内部使用，先克隆再自行替换proto文件到src/protos下

## 描述

多服务间的proto管理解决方案，通过npm或git进行管理，支持基于proto文件生成对应.d.ts

## 功能

- 自动转换proto文件，生成.d.ts，可以通过import { SomeType } from '@tecace/protos-manager' 进行引入，类型与proto文件内的message，rpc相对应
- 提供api获取所有proto文件的package name
- 提供api获取所有的proto文件绝对路径

## 生成路径数组，包名数组和类型文件

建议使用pnpm

在其他项目的根目录内执行以下命令，执行完成后可以移动protos-manager去其他位置（或不移动也行）

```sh
git clone --sparse git@github.com:ACE0220/tecace.git tecace
cd tecace
git sparse-checkout init --cone
git sparse-checkout set protos-manager
```

安装依赖

```sh
# path/to/protos-manager
pnpm install
# or
npm install
```

在tecace/protos-manager/src/protos替换自己所需的proto文件，执行以下命令

```sh
npm run build
# of
pnpm build
```

## 使用

笔者的是 nestjs 项目

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
import { protosLoader } from '@tecace/protos-manager'; // 包名由使用者定义，修改/path/to/protos-manager/package.json中的name即可
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