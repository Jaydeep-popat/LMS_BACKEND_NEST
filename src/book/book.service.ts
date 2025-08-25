import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { PrismaService } from '../../prisma.service';
import { randomUUID } from 'crypto';

@Injectable()
export class BookService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createBookDto: CreateBookDto) {
    try {
      const uniqueItemId = randomUUID();
      const created = await this.prisma.libraryItem.create({ data: { uniqueItemId, ...createBookDto } });
      // Optional: log activity if a user context is later provided
      return created;
    } catch (error: any) {
      throw new BadRequestException('Failed to create book');
    }
  }

  async findAll() {
    return this.prisma.libraryItem.findMany({ where: { isArchived: false }, orderBy: { createdAt: 'desc' } });
  }

  async search(query: string) {
    return this.prisma.libraryItem.findMany({
      where: {
        isArchived: false,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { author: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const book = await this.prisma.libraryItem.findUnique({ where: { id } });
    if (!book) {
      throw new NotFoundException('Book not found');
    }
    return book;
  } 

  async update(id: string, updateBookDto: UpdateBookDto) {
    try {
      return await this.prisma.libraryItem.update({ where: { id }, data: updateBookDto });
    } catch (error: any) {
      if (error?.code === 'P2025') {
        throw new NotFoundException('Book not found');
      }
      throw new BadRequestException('Failed to update book');
    }
  }

  async remove(id: string) {
    try {
      // Guard: prevent deleting if currently borrowed; otherwise archive
      const item = await this.prisma.libraryItem.findUnique({ where: { id } });
      if (!item) {
        throw new NotFoundException('Book not found');
      }
      if (item.status === 'BORROWED') {
        throw new BadRequestException('Cannot delete a borrowed book');
      }

      await this.prisma.libraryItem.update({ where: { id }, data: { isArchived: true } });
      return { message: 'Book archived successfully' };
    } catch (error: any) {
      if (error?.code === 'P2025') {
        throw new NotFoundException('Book not found');
      }
      throw new BadRequestException('Failed to archive book');
    }
  }

  async unarchive(id: string) {
    try {
      const item = await this.prisma.libraryItem.findUnique({ where: { id } });
      if (!item) throw new NotFoundException('Book not found');
      if (!item.isArchived) return { message: 'Book is already active' };

      await this.prisma.libraryItem.update({ where: { id }, data: { isArchived: false } });
      return { message: 'Book unarchived successfully' };
    } catch (error: any) {
      if (error?.code === 'P2025') throw new NotFoundException('Book not found');
      throw new BadRequestException('Failed to unarchive book');
    }
  }
}
