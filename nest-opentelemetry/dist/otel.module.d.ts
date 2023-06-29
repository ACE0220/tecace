import { DynamicModule } from '@nestjs/common';
import { IPublicInitOptions } from './types/init.type';
export declare class OTELModule {
    static forRoot(options: IPublicInitOptions): DynamicModule;
}
