import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { CreateLibraryItemDto } from './dto/create-library-item.dto';
import { UpdateLibraryItemDto } from './dto/update-library-item.dto';
import { CreateBookSpecificDto, CreateDVDDto, CreateEquipmentDto } from './dto/create-specific-items.dto';
import { PrismaService } from '../../prisma.service';
import { TransactionService } from '../common/transaction.service';
import { randomUUID } from 'crypto';
import { ItemType, ActivityType } from '../common/enums';

@Injectable()
export class BookService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly transactionService: TransactionService,
  ) {}

  // Generic item creation
  async createItem(createItemDto: CreateLibraryItemDto, userId?: string) {
    try {
      const uniqueItemId = randomUUID();
      const created = await this.prisma.libraryItem.create({ 
        data: { 
          uniqueItemId, 
          ...createItemDto 
        },
        include: {
          categories: {
            include: {
              category: true
            }
          }
        }
      });

      // Log transaction if userId is provided
      if (userId) {
        await this.transactionService.logActivity(
          userId,
          ActivityType.ITEM_ADDED,
          `Added ${created.type}: "${created.title}" (ID: ${created.id})`
        );
      }

      return created;
    } catch (error: any) {
      throw new BadRequestException('Failed to create library item');
    }
  }

  // Specific item type creation methods
  async createBook(createBookDto: CreateBookSpecificDto, userId?: string) {
    const itemData: CreateLibraryItemDto = {
      title: createBookDto.title,
      type: ItemType.BOOK,
      publishedAt: createBookDto.publishedAt,
      description: createBookDto.description,
      isbn: createBookDto.isbn,
      barcode: createBookDto.barcode,
      language: createBookDto.language || 'English',
      location: createBookDto.location,
      metadata: {
        author: createBookDto.author,
        genre: createBookDto.genre,
        publisher: createBookDto.publisher,
        pages: createBookDto.pages,
        edition: createBookDto.edition,
      }
    };
    return this.createItem(itemData, userId);
  }

  async createDVD(createDVDDto: CreateDVDDto, userId?: string) {
    const itemData: CreateLibraryItemDto = {
      title: createDVDDto.title,
      type: ItemType.DVD,
      description: createDVDDto.description,
      barcode: createDVDDto.barcode,
      language: createDVDDto.language || 'English',
      location: createDVDDto.location,
      metadata: {
        director: createDVDDto.director,
        duration: createDVDDto.duration,
        rating: createDVDDto.rating,
        year: createDVDDto.year,
        actors: createDVDDto.actors,
        genre: createDVDDto.genre,
      }
    };
    return this.createItem(itemData, userId);
  }

  async createEquipment(createEquipmentDto: CreateEquipmentDto, userId?: string) {
    const itemData: CreateLibraryItemDto = {
      title: createEquipmentDto.title,
      type: ItemType.EQUIPMENT,
      description: createEquipmentDto.description,
      barcode: createEquipmentDto.barcode,
      location: createEquipmentDto.location,
      metadata: {
        brand: createEquipmentDto.brand,
        model: createEquipmentDto.model,
        serialNumber: createEquipmentDto.serialNumber,
        specifications: createEquipmentDto.specifications,
        condition: createEquipmentDto.condition,
      }
    };
    return this.createItem(itemData, userId);
  }

  // Legacy create method for backwards compatibility
  async create(createBookDto: CreateBookDto) {
    try {
      const uniqueItemId = randomUUID();
      const created = await this.prisma.libraryItem.create({ data: { uniqueItemId, ...createBookDto } });
      return created;
    } catch (error: any) {
      throw new BadRequestException('Failed to create book');
    }
  }

  async findAll(filters?: { search?: string; type?: ItemType; status?: string; category?: string }) {
    const where: any = { isArchived: false };

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        // Search in metadata using JSON path
        {
          metadata: {
            path: ['author'],
            string_contains: filters.search
          }
        }
      ];
    }

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.category) {
      where.categories = {
        some: {
          category: {
            name: { contains: filters.category, mode: 'insensitive' }
          }
        }
      };
    }

    return this.prisma.libraryItem.findMany({ 
      where, 
      orderBy: { createdAt: 'desc' },
      include: {
        categories: {
          include: {
            category: true
          }
        },
        loans: {
          where: { returnDate: null },
          include: { user: { select: { name: true, email: true } } }
        }
      }
    });
  }

  async search(query: string) {
    return this.prisma.libraryItem.findMany({
      where: {
        isArchived: false,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          // Search in metadata using JSON path for author
          {
            metadata: {
              path: ['author'],
              string_contains: query
            }
          }
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        categories: {
          include: {
            category: true
          }
        }
      }
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.libraryItem.findUnique({ 
      where: { id },
      include: {
        categories: {
          include: {
            category: true
          }
        },
        loans: {
          where: { returnDate: null },
          include: { user: { select: { name: true, email: true } } }
        }
      }
    });
    if (!item) {
      throw new NotFoundException('Library item not found');
    }
    return item;
  } 

  async update(id: string, updateItemDto: UpdateLibraryItemDto) {
    try {
      return await this.prisma.libraryItem.update({ 
        where: { id }, 
        data: updateItemDto,
        include: {
          categories: {
            include: {
              category: true
            }
          }
        }
      });
    } catch (error: any) {
      if (error?.code === 'P2025') {
        throw new NotFoundException('Library item not found');
      }
      throw new BadRequestException('Failed to update library item');
    }
  }

  async remove(id: string) {
    try {
      // Guard: prevent deleting if currently borrowed; otherwise archive
      const item = await this.prisma.libraryItem.findUnique({ where: { id } });
      if (!item) {
        throw new NotFoundException('Library item not found');
      }
      if (item.status === 'BORROWED') {
        throw new BadRequestException('Cannot delete a borrowed item');
      }

      await this.prisma.libraryItem.update({ where: { id }, data: { isArchived: true } });
      return { message: 'Library item archived successfully' };
    } catch (error: any) {
      if (error?.code === 'P2025') {
        throw new NotFoundException('Library item not found');
      }
      throw new BadRequestException('Failed to archive library item');
    }
  }

  async unarchive(id: string) {
    try {
      const item = await this.prisma.libraryItem.findUnique({ where: { id } });
      if (!item) throw new NotFoundException('Library item not found');
      if (!item.isArchived) return { message: 'Library item is already active' };

      await this.prisma.libraryItem.update({ where: { id }, data: { isArchived: false } });
      return { message: 'Library item unarchived successfully' };
    } catch (error: any) {
      if (error?.code === 'P2025') throw new NotFoundException('Library item not found');
      throw new BadRequestException('Failed to unarchive library item');
    }
  }
}
