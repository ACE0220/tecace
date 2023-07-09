import {
  BatchSpanProcessor,
  ConsoleSpanExporter,
} from '@opentelemetry/sdk-trace-base';
import { IPublicInitOptions } from './types/init.type';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
export const DEFAULT_OTEL_CONFIG = {
  serviceName: 'DEFAULT_SERVICE',
  // autoDetectResources: false,
  // resourceDetectors: [
  //   alibabaCloudEcsDetector,
  //   awsEc2Detector,
  //   containerDetector,
  //   gcpDetector,
  //   instanaAgentDetector,
  // ],
  // contextManager: new AsyncLocalStorageContextManager(),
  // resource: new Resource({
  //   lib: '@metinseylan/nestjs-opentelemetry',
  // }),
  instrumentations: [getNodeAutoInstrumentations()],
  // spanProcessor: new BatchSpanProcessor(new ConsoleSpanExporter()),
  // traceExporter: new ConsoleSpanExporter(),
  // textMapPropagator: new CompositePropagator({
  //   propagators: [
  //     new JaegerPropagator(),
  //     new B3Propagator(),
  //     new B3Propagator({
  //       injectEncoding: B3InjectEncoding.MULTI_HEADER,
  //     }),
  //   ],
  // }),
  injectProviderPattern: [/Service$/],
} as IPublicInitOptions;
