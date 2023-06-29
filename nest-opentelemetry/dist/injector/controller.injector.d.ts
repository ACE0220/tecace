import { MetadataScanner, ModulesContainer } from '@nestjs/core';
import { BaseInjector } from './base.injector';
import { PublicTypeInjector } from '../types/injector.type';
export declare class ControllerInjector extends BaseInjector implements PublicTypeInjector {
    protected readonly modulesContainer: ModulesContainer;
    private readonly loggerService;
    protected readonly metadataScanner: MetadataScanner;
    constructor(modulesContainer: ModulesContainer);
    inject(): Promise<void>;
}
