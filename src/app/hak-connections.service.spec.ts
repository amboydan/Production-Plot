import { TestBed } from '@angular/core/testing';

import { HakConnectionsService } from './hak-connections.service';

describe('HakConnectionsService', () => {
  let service: HakConnectionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HakConnectionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
