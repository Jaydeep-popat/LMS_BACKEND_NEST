import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { LibrarySettingsService } from './library-settings.service';
import { CreateLibrarySettingDto } from './dto/create-library-setting.dto';
import { UpdateLibrarySettingDto } from './dto/update-library-setting.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../common/enums';

@Controller('library-settings')
@UseGuards(JwtAuthGuard)
export class LibrarySettingsController {
  constructor(private readonly librarySettingsService: LibrarySettingsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() createLibrarySettingDto: CreateLibrarySettingDto, @CurrentUser() user: any) {
    return this.librarySettingsService.create(createLibrarySettingDto, user.id);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.LIBRARIAN, UserRole.ADMIN)
  findAll() {
    return this.librarySettingsService.findAll();
  }

  @Get('summary')
  @UseGuards(RolesGuard)
  @Roles(UserRole.LIBRARIAN, UserRole.ADMIN)
  getSettingsSummary() {
    return this.librarySettingsService.getSettingsSummary();
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.LIBRARIAN, UserRole.ADMIN)
  findOne(@Param('id') id: string) {
    return this.librarySettingsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateLibrarySettingDto: UpdateLibrarySettingDto, @CurrentUser() user: any) {
    return this.librarySettingsService.update(id, updateLibrarySettingDto, user.id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.librarySettingsService.remove(id, user.id);
  }
}
