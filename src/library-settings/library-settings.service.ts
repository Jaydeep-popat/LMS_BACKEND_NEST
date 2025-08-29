import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { CreateLibrarySettingDto } from './dto/create-library-setting.dto';
import { UpdateLibrarySettingDto } from './dto/update-library-setting.dto';
import { PrismaService } from '../../prisma.service';
import { TransactionService } from '../common/transaction.service';
import { ActivityType } from '../common/enums';

@Injectable()
export class LibrarySettingsService {
  private readonly logger = new Logger(LibrarySettingsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly transactionService: TransactionService,
  ) {}

  /**
   * Create library settings (only if none exist)
   * Library should have only one settings record
   */
  async create(createLibrarySettingDto: CreateLibrarySettingDto, userId: string) {
    try {
      // Check if settings already exist
      const existingSettings = await this.prisma.librarySettings.findFirst();
      if (existingSettings) {
        throw new ConflictException('Library settings already exist. Use update instead.');
      }

      const settings = await this.prisma.librarySettings.create({
        data: {
          loanDurationDays: createLibrarySettingDto.loanDurationDays ?? 14,
          overdueFinePerDay: createLibrarySettingDto.overdueFinePerDay ?? 1.00,
          maxItemsPerUser: createLibrarySettingDto.maxBooksPerUser ?? 5,
          maxDVDsPerUser: createLibrarySettingDto.maxDVDsPerUser ?? 3,
          maxMagazinesPerUser: createLibrarySettingDto.maxMagazinesPerUser ?? 10,
        },
      });

      // Log the activity
      await this.transactionService.logActivity(
        userId,
        ActivityType.LIBRARY_SETTINGS_CREATED,
        'Library settings created'
      );

      this.logger.log(`Library settings created by user ${userId}`);
      return settings;
    } catch (error) {
      this.logger.error(`Failed to create library settings: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get current library settings
   * Returns the single settings record or creates default if none exist
   */
  async findAll() {
    try {
      let settings = await this.prisma.librarySettings.findFirst();
      
      // If no settings exist, create default settings
      if (!settings) {
        settings = await this.prisma.librarySettings.create({
          data: {
            loanDurationDays: 14,
            overdueFinePerDay: 1.00,
            maxItemsPerUser: 5,
            maxDVDsPerUser: 3,
            maxMagazinesPerUser: 10,
          },
        });
        this.logger.log('Default library settings created');
      }

      return settings;
    } catch (error) {
      this.logger.error(`Failed to retrieve library settings: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get library settings by ID
   */
  async findOne(id: string) {
    try {
      const settings = await this.prisma.librarySettings.findUnique({
        where: { id },
      });

      if (!settings) {
        throw new NotFoundException(`Library settings with ID ${id} not found`);
      }

      return settings;
    } catch (error) {
      this.logger.error(`Failed to find library settings ${id}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update library settings
   */
  async update(id: string, updateLibrarySettingDto: UpdateLibrarySettingDto, userId: string) {
    try {
      const existingSettings = await this.findOne(id);

      const updatedSettings = await this.prisma.librarySettings.update({
        where: { id },
        data: {
          ...(updateLibrarySettingDto.loanDurationDays && {
            loanDurationDays: updateLibrarySettingDto.loanDurationDays
          }),
          ...(updateLibrarySettingDto.overdueFinePerDay && {
            overdueFinePerDay: updateLibrarySettingDto.overdueFinePerDay
          }),
          ...(updateLibrarySettingDto.maxBooksPerUser && {
            maxItemsPerUser: updateLibrarySettingDto.maxBooksPerUser
          }),
          ...(updateLibrarySettingDto.maxDVDsPerUser && {
            maxDVDsPerUser: updateLibrarySettingDto.maxDVDsPerUser
          }),
          ...(updateLibrarySettingDto.maxMagazinesPerUser && {
            maxMagazinesPerUser: updateLibrarySettingDto.maxMagazinesPerUser
          }),
        },
      });

      // Log the activity
      await this.transactionService.logActivity(
        userId,
        ActivityType.LIBRARY_SETTINGS_UPDATED,
        `Library settings updated: ${Object.keys(updateLibrarySettingDto).join(', ')}`
      );

      this.logger.log(`Library settings ${id} updated by user ${userId}`);
      return updatedSettings;
    } catch (error) {
      this.logger.error(`Failed to update library settings ${id}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Remove library settings (soft delete by resetting to defaults)
   * We don't actually delete settings as the library needs configuration
   */
  async remove(id: string, userId: string) {
    try {
      const existingSettings = await this.findOne(id);

      const resetSettings = await this.prisma.librarySettings.update({
        where: { id },
        data: {
          loanDurationDays: 14,
          overdueFinePerDay: 1.00,
          maxItemsPerUser: 5,
          maxDVDsPerUser: 3,
          maxMagazinesPerUser: 10,
        },
      });

      // Log the activity
      await this.transactionService.logActivity(
        userId,
        ActivityType.LIBRARY_SETTINGS_RESET,
        'Library settings reset to defaults'
      );

      this.logger.log(`Library settings ${id} reset to defaults by user ${userId}`);
      return resetSettings;
    } catch (error) {
      this.logger.error(`Failed to reset library settings ${id}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get current settings for loan duration
   */
  async getLoanDuration(): Promise<number> {
    const settings = await this.findAll();
    return settings.loanDurationDays;
  }

  /**
   * Get current settings for overdue fine per day
   */
  async getOverdueFinePerDay(): Promise<number> {
    const settings = await this.findAll();
    return Number(settings.overdueFinePerDay);
  }

  /**
   * Get maximum items per user limits
   */
  async getMaxItemsPerUser(): Promise<{
    books: number;
    dvds: number;
    magazines: number;
    total: number;
  }> {
    const settings = await this.findAll();
    return {
      books: settings.maxItemsPerUser,
      dvds: settings.maxDVDsPerUser,
      magazines: settings.maxMagazinesPerUser,
      total: settings.maxItemsPerUser + settings.maxDVDsPerUser + settings.maxMagazinesPerUser,
    };
  }

  /**
   * Check if user has reached borrowing limits for specific item type
   */
  async checkBorrowingLimit(userId: string, itemType: string): Promise<boolean> {
    const settings = await this.findAll();
    
    // Count current active loans by item type
    const activeLoanCount = await this.prisma.loan.count({
      where: {
        userId,
        returnDate: null,
        item: {
          type: itemType as any,
        },
      },
    });

    // Check against appropriate limit
    let limit: number;
    switch (itemType.toLowerCase()) {
      case 'dvd':
        limit = settings.maxDVDsPerUser;
        break;
      case 'magazine':
        limit = settings.maxMagazinesPerUser;
        break;
      default:
        limit = settings.maxItemsPerUser;
    }

    return activeLoanCount < limit;
  }

  /**
   * Get library settings summary for dashboard
   */
  async getSettingsSummary() {
    try {
      const settings = await this.findAll();
      const totalUsers = await this.prisma.user.count();
      const totalActiveLoans = await this.prisma.loan.count({
        where: { returnDate: null },
      });
      const totalOverdueLoans = await this.prisma.loan.count({
        where: {
          returnDate: null,
          dueDate: { lt: new Date() },
        },
      });

      return {
        settings: {
          loanDurationDays: settings.loanDurationDays,
          overdueFinePerDay: Number(settings.overdueFinePerDay),
          maxItemsPerUser: settings.maxItemsPerUser,
          maxDVDsPerUser: settings.maxDVDsPerUser,
          maxMagazinesPerUser: settings.maxMagazinesPerUser,
          lastUpdated: settings.updatedAt,
        },
        statistics: {
          totalUsers,
          totalActiveLoans,
          totalOverdueLoans,
          overdueRate: totalActiveLoans > 0 ? (totalOverdueLoans / totalActiveLoans * 100).toFixed(2) : '0',
        },
      };
    } catch (error) {
      this.logger.error(`Failed to get settings summary: ${error.message}`);
      throw error;
    }
  }
}
