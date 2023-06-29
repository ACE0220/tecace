import { Inject, Injectable } from '@nestjs/common';
import { Constants } from './Constants';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { trace, Span, context } from '@opentelemetry/api';
import { TraceIgnore } from './decorator';
@Injectable()
@TraceIgnore()
export class OTELService {
  constructor(@Inject(Constants.SDK) private readonly sdk: NodeSDK) {}

  async beforeApplicationShutdown() {
    await this.sdk
      ?.shutdown()
      .then(
        () => {
          console.log('OTEL_NODE_SDK shutdown successfully');
        },
        (err) => {
          console.log('OTEL_NODE_SDK shutdown err', err);
        },
      )
      .finally(() => {
        process.exit(0);
      });
  }

  public getTracer() {
    return trace.getTracer('default');
  }

  public getSpan(): Span {
    return trace.getSpan(context.active());
  }

  public startSpan(name: string): Span {
    const tracer = trace.getTracer('default');
    return tracer.startSpan(name);
  }
}
