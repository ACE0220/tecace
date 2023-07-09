import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConsulService } from './consul.service';
import { InitOptions } from './types';
@Global()
@Module({})
export class ConsulModule {
  static register(consulOptions: InitOptions): DynamicModule {
    return {
      module: ConsulModule,
      providers: [
        {
          provide: 'consulOptions',
          useValue: consulOptions,
        },
        ConsulService,
      ],
      exports: [
        ConsulService,
        {
          provide: 'consulOptions',
          useValue: consulOptions,
        },
      ],
    } as DynamicModule;
  }
}
