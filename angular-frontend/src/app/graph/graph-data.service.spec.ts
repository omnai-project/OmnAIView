import { TestBed } from '@angular/core/testing';

import { DataSourceService } from './graph-data.service';
import {signal} from '@angular/core';
import {DataBounds} from '../source-selection/data-source-selection.service';
import {provideHttpClient} from '@angular/common/http';

describe('GraphDataService', () => {
  let service: DataSourceService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient()
      ]
    }).compileComponents();
    service = TestBed.inject(DataSourceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('should correctly scale axis based on data', () => {
    let bounds = new DataBounds();
    bounds.minValue = 10;
    bounds.maxValue = 20;
    bounds.minTimestamp = 1000;
    bounds.maxTimestamp = 2000;

    (service as any).dataSourceSelectionService._currentSource.set({
      id: 'test-source',
      name: 'Testing Source',
      description: 'Data-Source used for testing',
      connect: ()=> {},
      data: signal({
        data: new Map(),
        bounds
      }),
    });

    const domain = service.domain();
    const xDomain = domain.xDomain;
    const yDomain = domain.yDomain;

    // xDomain und yDomain sollten angepasst sein
    expect(xDomain[0].getTime()).toBeLessThanOrEqual(1000);
    expect(xDomain[1].getTime()).toBeGreaterThanOrEqual(2000);
    expect(yDomain[0]).toBeLessThanOrEqual(10);
    expect(yDomain[1]).toBeGreaterThanOrEqual(20);
  });
});
