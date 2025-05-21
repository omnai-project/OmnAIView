import { TestBed } from '@angular/core/testing';

import { DataSourceService } from './graph-data.service';

describe('GraphDataService', () => {
  let service: DataSourceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataSourceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('should correctly scale axis based on data', () => {
    (service as any).info.set({
      minValue: 10,
      maxValue: 20,
      minTimestamp: 1000,
      maxTimestamp: 2000,
    });

    const domain = service['$domain']();
    const xDomain = domain.xDomain;
    const yDomain = domain.yDomain;

    // xDomain und yDomain sollten angepasst sein
    expect(xDomain[0].getTime()).toBeLessThanOrEqual(1000);
    expect(xDomain[1].getTime()).toBeGreaterThanOrEqual(2000);
    expect(yDomain[0]).toBeLessThanOrEqual(10);
    expect(yDomain[1]).toBeGreaterThanOrEqual(20);
  });
});
