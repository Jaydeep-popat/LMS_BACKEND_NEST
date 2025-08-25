import { Module } from '@nestjs/common';
import { LibrarySettingsService } from './library-settings.service';
import { LibrarySettingsController } from './library-settings.controller';

@Module({
  controllers: [LibrarySettingsController],
  providers: [LibrarySettingsService],
})
export class LibrarySettingsModule {}
