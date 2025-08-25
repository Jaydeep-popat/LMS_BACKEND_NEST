import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LibrarySettingsService } from './library-settings.service';
import { CreateLibrarySettingDto } from './dto/create-library-setting.dto';
import { UpdateLibrarySettingDto } from './dto/update-library-setting.dto';

@Controller('library-settings')
export class LibrarySettingsController {
  constructor(private readonly librarySettingsService: LibrarySettingsService) {}

  @Post()
  create(@Body() createLibrarySettingDto: CreateLibrarySettingDto) {
    return this.librarySettingsService.create(createLibrarySettingDto);
  }

  @Get()
  findAll() {
    return this.librarySettingsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.librarySettingsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLibrarySettingDto: UpdateLibrarySettingDto) {
    return this.librarySettingsService.update(+id, updateLibrarySettingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.librarySettingsService.remove(+id);
  }
}
