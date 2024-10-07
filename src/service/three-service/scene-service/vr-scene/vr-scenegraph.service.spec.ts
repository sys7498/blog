import { TestBed } from '@angular/core/testing';

import { VrScenegraphService } from './vr-scenegraph.service';

describe('VrScenegraphService', () => {
  let service: VrScenegraphService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VrScenegraphService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
