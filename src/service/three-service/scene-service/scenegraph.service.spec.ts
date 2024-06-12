import { TestBed } from '@angular/core/testing';

import { ScenegraphService } from './scenegraph.service';

describe('ScenegraphService', () => {
  let service: ScenegraphService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScenegraphService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
