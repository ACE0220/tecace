# @tecace/nest-opentelemetry

## description

基于官方 npm 封装 nest-opentelemetry 工具，无侵入式劫持 controller/provider，提供装饰器手动劫持非 nestjs 代码、忽略采集，自动上报 traces 和 metrics

## usage

安装

```sh
npm install @tecace/nest-opentelemetry
```

使用

```typescript

import { OTELModule } from '@tecace/nest-opentelemetry';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';

@Module({
  imports: [
    OTELModule.forRoot({
      serviceName: 'user-service',
      traceExporter: new OTLPTraceExporter({
        url: 'http://otelcol:4318/v1/traces', // 自搭建opentelemetry-collector
      }),
      metricReader: new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({
          url: 'http://otelcol:4317/v1/metrics', // 自搭建opentelemetry-collector
        }),
        exportIntervalMillis: 5000,
      }),
    }),
  ]
})
```

## initOptions

初始化选项在@opentelemetry/sdk-node 初始化选项 NodeSDKConfiguration 基础上扩展了一个 injectProviderPattern，其余选项均与@opentelemetry/sdk-node 初始化选项保持一致

| 选项                                     | 说明                                                                                  | 默认                                                  |
| ---------------------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| injectProviderPattern                    | 通过正则指定哪些 provider 需要追踪，，默认以 Service 结尾的 Provider class 都会被劫持 | injectProviderPattern: [\/Service$\/]                 |
| 其余选项与 NodeSDKConfiguration 保持一致 | @opentelemetry/sdk-node 初始化选项                                                    | https://www.npmjs.com/package/@opentelemetry/sdk-node |

## decorators

### @CustomSpan() 独立 Span

适用于 Controller 或 Provider 类中的方法

```typescript

import { OTELService, CustomSpan } from '@tecace/nest-opentelemetry';

@Controller()
export class UserController {
  constructor(
    private otelService: OTELService,
  ) {}

  @CustomSpan() // 如果需要独立span，必须使用@CustomSpan装饰
  async getUserInfoByName(data: any): SomeUserInfo {
    // 启动一个独立span
    const currentSpan = this.otelService.startSpan(
      'UserController.customGetUserInfo',
    );
    // 业务代码在放这里，业务结束后调用currentSpan.end()
    .......
    currentSpan.end();
    return someUserInfo;
  }
}

```

### @TraceIgnore() 忽略追踪

适用于 Controller，Provider 类，或类中的方法

- 装饰类的时候，整个类中的所有方法都不会追踪
- 装饰方法的时候，不会追踪被装饰的方法

```typescript
import { TraceIgnore } from '@tecace/nest-opentelemetry';

@TraceIgnore() // 忽略此控制器下所有方法的追踪
@Controller()
export class UserController {

  async getUserInfoByName(data: any): SomeUserInfo {
    // 业务代码
    .......
    return someUserInfo;
  }
}
```

```typescript
import { TraceIgnore } from '@tecace/nest-opentelemetry';

@Controller()
export class UserController {
  @TraceIgnore() // 忽略getUserInfoByName方法的追踪
  async getUserInfoByName(data: any): SomeUserInfo {
    // 业务代码
    .......
    return someUserInfo;
  }
}
```

### @CustomTrace() 用于非 nestjs 模块的追踪

非侵入式劫持 controller，provider 的原理是基于 nestjs 的依赖注入，获取到@Controller()，@Injectable()装饰的类及其对应的方法

如果我们封装了其他工具（例如基于 sequelize 封装的 dao 层），是不需要依赖注入的，那么就无法进行扫描，为了提供追踪功能，**非 nestjs 模块的追踪需要实现以下条件**

- **使用@CustomTrace()装饰**
- **必须使用 class，并且实现单例模式，实现无参数的 static getInstance 方法**

#### 注意

**如果一个工具（或模块）依赖于其他实例，同时其实例化要求实现一个不带参数的 static getInstance 方法，该怎么实现呢？**

举一个例子，假设有一个 dao 工具，它是基于 model 实例封装的一层，其中 **userDao.create** 方法依赖于 **userModel 实例的 create 方法**。我们可以设计一个 init 方法，支持链式调用，以传入 userModel 实例并返回一个单例实例。

这种情况为什么会出现呢？在 NestJS 中，Sequelize 的 Model 可以直接在 provider 或 controller 中注入。而对于不使用 NestJS 的工具或模块，如果要基于 Model 封装一层，则需要将 Model 实例作为参数传递。

```typescript
// user.dao.ts
import { CustomTrace } from '@tecace/nest-opentelemetry';

@CustomTrace() // 1.使用CustomTrace装饰
export class UserDao {
  userModelInstance!: typeof UsersModel;

  static instance: UserDao;
  // 2. 实现无参数的static getInstance方法
  static getInstance() {
    if (!this.instance) this.instance = new UserDao();
    return this.instance;
  }
  // 在工具外部就可以进行链式调用
  // const userDao = UserDao.getIntance().init(userModel)
  // userDao.create()
  init(userModelInstance: typeof UsersModel) {
    this.userModelInstance = userModelInstance;
    return UserDao.getInstance();
  }

  async create(data: any): Promise<any> {
    this.userModelInstance.create(data as Optional<any, any>);
    return await to(this.modelInstance.create(data as Optional<any, any>));
  }
}
```

```typescript
// user.service.ts

import UserDao from './user.dao.ts';

@Injectable()
export class UserService {
  private readonly userDao!: UserDao;

  constructor(@InjectModel(UsersModel) private usersModel: typeof UsersModel) {
    this.userDao = UserDao.getInstance().init(this.usersModel); // 链式调用
  }

  async createUser(data: any): any {
    const [err, res] = await this.userDao.create(data);
    if (!err) return res;
  }
}
```
