import { PublicTypeInjector } from 'src/types/injector.type';
import { BaseInjector } from './base.injector';
import { MetadataScanner, ModulesContainer } from '@nestjs/core';
import { IPublicInitOptions } from '../types/init.type';
export declare class ProvidersInjector extends BaseInjector implements PublicTypeInjector {
    protected readonly modulesContainer: ModulesContainer;
    constructor(modulesContainer: ModulesContainer);
    protected readonly metadataScanner: MetadataScanner;
    inject(options?: Partial<IPublicInitOptions>): Promise<void>;
}
