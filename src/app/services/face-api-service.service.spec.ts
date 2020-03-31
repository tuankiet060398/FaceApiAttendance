import { TestBed, inject } from '@angular/core/testing';

import { FaceApiService } from './face-api-service.service';

describe('FaceApiServiceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FaceApiService]
    });
  });

  it('should be created', inject([FaceApiService], (service: FaceApiService) => {
    expect(service).toBeTruthy();
  }));
});
