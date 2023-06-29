import { NodeSDK } from '@opentelemetry/sdk-node';
import { Span } from '@opentelemetry/api';
export declare class OTELService {
    private readonly sdk;
    constructor(sdk: NodeSDK);
    beforeApplicationShutdown(): Promise<void>;
    getTracer(): import("@opentelemetry/api").Tracer;
    getSpan(): Span;
    startSpan(name: string): Span;
}
