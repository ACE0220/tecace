import { DynamicModule } from '@nestjs/common';
import { InitOptions } from './types';
export declare class ConsulModule {
    static register(consulOptions: InitOptions): DynamicModule;
}
