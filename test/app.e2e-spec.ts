import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/api/health (GET)', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];
    await request(httpServer).get('/api/health').expect(200).expect({ status: 'ok', service: 'bff-backoffice', domain: 'backoffice' });
  });

  it('/api/ready (GET)', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];
    const response = await request(httpServer).get('/api/ready').expect(200);
    expect(response.body).toMatchObject({
      status: 'ready',
      service: 'bff-backoffice',
      domain: 'backoffice',
      integrations: {
        backofficeEngine: { available: true, mode: 'mock' },
        coreBackoffice: { available: false, mode: 'pending' },
        corePoints: { available: false, mode: 'pending' },
      },
    });
  });

  it('/api/v1/backoffice/dashboard (GET)', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];
    const response = await request(httpServer).get('/api/v1/backoffice/dashboard').expect(200);
    expect(response.body.source).toBe('mock');
    expect(response.body.kpis.length).toBeGreaterThan(0);
    expect(response.body.customerSnapshots.length).toBeGreaterThan(0);
    expect(response.body.recentOrders.length).toBeGreaterThan(0);
  });

  it('/api/v1/backoffice/customers/:customerId (GET)', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];
    const response = await request(httpServer).get('/api/v1/backoffice/customers/cust_001').expect(200);
    expect(response.body.item).toMatchObject({ customerId: 'cust_001', fullName: 'María Pérez' });
  });

  it('/api/v1/backoffice/orders/:orderId (GET)', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];
    const response = await request(httpServer).get('/api/v1/backoffice/orders/ord_mock_002').expect(200);
    expect(response.body.item).toMatchObject({ orderId: 'ord_mock_002', status: 'placed' });
  });
});
