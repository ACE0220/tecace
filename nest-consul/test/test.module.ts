import { Module } from '@nestjs/common';
import { ConsulModule } from '../src/consul.module';

@Module({
  imports: [
    ConsulModule.forRoot({
      host: 'localhost',
      port: '8500',
    }),
  ],
})
export class TestModule {}
