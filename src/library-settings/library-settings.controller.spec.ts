import { Test, TestingModule } from '@nestjs/testing';
import { LibrarySettingsController } from './library-settings.controller';
import { LibrarySettingsService } from './library-settings.service';

describe('LibrarySettingsController', () => {
  let controller: LibrarySettingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LibrarySettingsController],
      providers: [LibrarySettingsService],
    }).compile();

    controller = module.get<LibrarySettingsController>(LibrarySettingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
