import { Test, TestingModule } from '@nestjs/testing';
import { ConsulModule } from '../src/consul.module';
import { ConsulService } from '../src/consul.service';
import Consul from 'consul';

describe('AppController (e2e)', () => {
  let consulService: ConsulService;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConsulModule.register({
          host: 'localhost',
          port: '8500',
          promisify: true,
          autoRegister: true,
          registerOptions: {
            id: 'user-service',
            name: 'user-service',
            port: 5001,
            address: 'localhost',
          },
          check: {
            id: 'user_health_check',
            name: 'user_health_check',
            grpc: 'host.docker.internal:5001/grpc_health.Health/Check',
            interval: '15s',
            ttl: '10s',
          },
        }),
      ],
    }).compile();

    consulService = moduleFixture.get<ConsulService>(ConsulService);
  });

  it('get consul instance', () => {
    expect(consulService).toBeDefined();
    expect(consulService.getConsulInstance() instanceof Consul).toBe(true);
  });

  it('Registration service', async () => {
    const [err] = await consulService.srvRgistration();
    expect(err).toBe(null);
  });

  afterAll(async () => {
    await consulService.srvDeregistration();
  });
});
