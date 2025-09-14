import { TestBed } from '@angular/core/testing';

import { Meteo } from './meteo';

describe('Meteo', () => {
  let service: Meteo;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Meteo);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
