import { Test, TestingModule } from '@nestjs/testing';
import { LibrarySettingsService } from './library-settings.service';

describe('LibrarySettingsService', () => {
  let service: LibrarySettingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LibrarySettingsService],
    }).compile();

    service = module.get<LibrarySettingsService>(LibrarySettingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
