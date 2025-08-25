import { Injectable } from '@nestjs/common';
import { CreateLibrarySettingDto } from './dto/create-library-setting.dto';
import { UpdateLibrarySettingDto } from './dto/update-library-setting.dto';

@Injectable()
export class LibrarySettingsService {
  create(createLibrarySettingDto: CreateLibrarySettingDto) {
    return 'This action adds a new librarySetting';
  }

  findAll() {
    return `This action returns all librarySettings`;
  }

  findOne(id: number) {
    return `This action returns a #${id} librarySetting`;
  }

  update(id: number, updateLibrarySettingDto: UpdateLibrarySettingDto) {
    return `This action updates a #${id} librarySetting`;
  }

  remove(id: number) {
    return `This action removes a #${id} librarySetting`;
  }
}
