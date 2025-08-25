import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateFineDto } from './dto/create-fine.dto';
import { UpdateFineDto } from './dto/update-fine.dto';
import { FineStatus } from '@prisma/client';

@Injectable()
export class FinesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateFineDto) {
    const { userId, loanId, amount, reason } = dto;

    // Verify user exists
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Verify loan exists if provided
    if (loanId) {
      const loan = await this.prisma.loan.findUnique({ where: { id: loanId } });
      if (!loan) throw new NotFoundException('Loan not found');
    }

    const fine = await this.prisma.fine.create({
      data: {
        userId,
        loanId,
        amount,
        reason: reason || 'Overdue fine',
        status: 'PENDING',
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        loan: { select: { id: true, item: { select: { title: true } } } },
      },
    });

    // Log activity
    await this.prisma.transaction.create({
      data: {
        userId,
        action: 'FINE_APPLIED',
        details: `Fine ${fine.id} applied: $${amount} - ${reason || 'Overdue fine'}`,
      },
    });

    return fine;
  }

  async findAll() {
    return this.prisma.fine.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        loan: { select: { id: true, item: { select: { title: true } } } },
        waivedBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.fine.findMany({
      where: { userId },
      include: {
        loan: { select: { id: true, item: { select: { title: true } } } },
        waivedBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const fine = await this.prisma.fine.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        loan: { select: { id: true, item: { select: { title: true } } } },
        waivedBy: { select: { id: true, name: true } },
      },
    });

    if (!fine) throw new NotFoundException('Fine not found');
    return fine;
  }

  async update(id: string, dto: UpdateFineDto) {
    const fine = await this.prisma.fine.findUnique({ where: { id } });
    if (!fine) throw new NotFoundException('Fine not found');

    const updatedFine = await this.prisma.fine.update({
      where: { id },
      data: dto,
      include: {
        user: { select: { id: true, name: true, email: true } },
        loan: { select: { id: true, item: { select: { title: true } } } },
        waivedBy: { select: { id: true, name: true } },
      },
    });

    return updatedFine;
  }

  async markAsPaid(id: string) {
    const fine = await this.prisma.fine.findUnique({ where: { id } });
    if (!fine) throw new NotFoundException('Fine not found');
    if (fine.status === 'PAID') throw new BadRequestException('Fine is already paid');
    if (fine.status === 'WAIVED') throw new BadRequestException('Fine is already waived');

    const updatedFine = await this.prisma.fine.update({
      where: { id },
      data: { status: 'PAID' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        loan: { select: { id: true, item: { select: { title: true } } } },
      },
    });

    // Log activity
    await this.prisma.transaction.create({
      data: {
        userId: fine.userId,
        action: 'FINE_PAID',
        details: `Fine ${id} marked as paid`,
      },
    });

    return updatedFine;
  }

  async waiveFine(id: string, waivedById: string) {
    const fine = await this.prisma.fine.findUnique({ where: { id } });
    if (!fine) throw new NotFoundException('Fine not found');
    if (fine.status === 'PAID') throw new BadRequestException('Cannot waive a paid fine');
    if (fine.status === 'WAIVED') throw new BadRequestException('Fine is already waived');

    const updatedFine = await this.prisma.fine.update({
      where: { id },
      data: { 
        status: 'WAIVED',
        waivedById,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        loan: { select: { id: true, item: { select: { title: true } } } },
        waivedBy: { select: { id: true, name: true } },
      },
    });

    // Log activity
    await this.prisma.transaction.create({
      data: {
        userId: waivedById,
        action: 'FINE_WAIVED',
        details: `Fine ${id} waived by ${waivedById}`,
      },
    });

    return updatedFine;
  }

  async remove(id: string) {
    const fine = await this.prisma.fine.findUnique({ where: { id } });
    if (!fine) throw new NotFoundException('Fine not found');

    await this.prisma.fine.delete({ where: { id } });
    return { message: 'Fine deleted successfully' };
  }

  async calculateOverdueFines() {
    // Get all overdue loans
    const overdueLoans = await this.prisma.loan.findMany({
      where: {
        dueDate: { lt: new Date() },
        returnDate: null,
      },
      include: {
        user: true,
        item: true,
      },
    });

    // Get library settings for fine calculation
    const settings = await this.prisma.librarySettings.findFirst();
    const finePerDay = settings?.overdueFinePerDay || 1.0;

    for (const loan of overdueLoans) {
      const daysOverdue = Math.floor((new Date().getTime() - loan.dueDate.getTime()) / (1000 * 60 * 60 * 24));
      const fineAmount = daysOverdue * Number(finePerDay);

      // Check if fine already exists for this loan
      const existingFine = await this.prisma.fine.findFirst({
        where: {
          loanId: loan.id,
          status: 'PENDING',
        },
      });

      if (!existingFine && fineAmount > 0) {
        await this.create({
          userId: loan.userId,
          loanId: loan.id,
          amount: fineAmount,
          reason: `Overdue fine for ${daysOverdue} days`,
        });
      }
    }
  }
}
