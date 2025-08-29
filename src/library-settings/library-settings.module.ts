import { Module } from '@nestjs/common';
import { LibrarySettingsService } from './library-settings.service';
import { LibrarySettingsController } from './library-settings.controller';
import { PrismaModule } from '../../prisma.module';
import { TransactionService } from '../common/transaction.service';

@Module({
  imports: [PrismaModule],
  controllers: [LibrarySettingsController],
  providers: [LibrarySettingsService, TransactionService],
  exports: [LibrarySettingsService],
})
export class LibrarySettingsModule {}
