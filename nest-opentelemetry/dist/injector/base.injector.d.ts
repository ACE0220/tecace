import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import type { Controller, Provider } from '@nestjs/common/interfaces';
import { ModulesContainer } from '@nestjs/core';
import { PublicFunctionType } from '../types/function.type';
export declare class BaseInjector {
    protected readonly modulesContainer: ModulesContainer;
    constructor(modulesContainer: ModulesContainer);
    isDecorated(prototype: PublicFunctionType): boolean;
    isIgnore(prototype: PublicFunctionType): boolean;
    affect(prototype: PublicFunctionType, active?: number): void;
    getControllers(): Promise<InstanceWrapper<Controller>[]>;
    getProviders(): Promise<InstanceWrapper<Provider>[]>;
    protected reDecorate(source: Record<any, any>, destination: Record<any, any>): void;
    protected isAffected(prototype: any): boolean;
    wrap(prototype: PublicFunctionType, traceName: string, attributes: Record<any, any>): (...args: any[]) => any;
}
