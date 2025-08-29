import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { CreateLibraryItemDto } from './dto/create-library-item.dto';
import { UpdateLibraryItemDto } from './dto/update-library-item.dto';
import {
  CreateBookSpecificDto,
  CreateDVDDto,
  CreateEquipmentDto,
} from './dto/create-specific-items.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole, ItemType } from '../common/enums';

@Controller('library-items')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  // Generic item creation
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.LIBRARIAN, UserRole.ADMIN)
  create(@Body() createItemDto: CreateLibraryItemDto) {
    return this.bookService.createItem(createItemDto);
  }

  // Specific item type creation endpoints
  @Post('book')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.LIBRARIAN, UserRole.ADMIN)
  createBook(@Body() createBookDto: CreateBookSpecificDto) {
    return this.bookService.createBook(createBookDto);
  }

  @Post('dvd')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.LIBRARIAN, UserRole.ADMIN)
  createDVD(@Body() createDVDDto: CreateDVDDto) {
    return this.bookService.createDVD(createDVDDto);
  }

  @Post('equipment')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.LIBRARIAN, UserRole.ADMIN)
  createEquipment(@Body() createEquipmentDto: CreateEquipmentDto) {
    return this.bookService.createEquipment(createEquipmentDto);
  }

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('type') type?: ItemType,
    @Query('status') status?: string,
    @Query('category') category?: string,
  ) {
    return this.bookService.findAll({ search, type, status, category });
  }

  @Get('search/:q')
  search(@Param('q') q: string) {
    return this.bookService.search(q);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.LIBRARIAN, UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateItemDto: UpdateLibraryItemDto) {
    return this.bookService.update(id, updateItemDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.LIBRARIAN, UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.bookService.remove(id);
  }

  @Patch(':id/unarchive')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.LIBRARIAN, UserRole.ADMIN)
  unarchive(@Param('id') id: string) {
    return this.bookService.unarchive(id);
  }
}
