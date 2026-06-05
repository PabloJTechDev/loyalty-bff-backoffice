import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(() => {
    const appService = {
      getHealth: jest.fn().mockReturnValue({
        status: 'ok',
        service: 'bff-backoffice',
        domain: 'backoffice',
      }),
      getReadiness: jest.fn().mockResolvedValue({ status: 'ready', service: 'bff-backoffice' }),
    } as unknown as AppService;

    appController = new AppController(appService);
  });

  it('should return service health', () => {
    expect(appController.getHealth()).toEqual({
      status: 'ok',
      service: 'bff-backoffice',
      domain: 'backoffice',
    });
  });
});
