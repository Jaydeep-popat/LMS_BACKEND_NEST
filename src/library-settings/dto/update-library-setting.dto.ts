import { PartialType } from '@nestjs/mapped-types';
import { CreateLibrarySettingDto } from './create-library-setting.dto';

export class UpdateLibrarySettingDto extends PartialType(CreateLibrarySettingDto) {}
