import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';
import { ItemStatus } from '../common/enums';
import { MailerService } from '../auth/mailer.service';
import { ReservationService } from '../reservation/reservation.service';

@Injectable()
export class LoanService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailer: MailerService,
    private readonly reservationService: ReservationService,
  ) {}

  async borrow(createLoanDto: CreateLoanDto) {
    const { userId, itemId } = createLoanDto;

    // Ensure book is available
    const item = await this.prisma.libraryItem.findUnique({ where: { id: itemId } });
    if (!item) throw new NotFoundException('Book not found');
    if (item.isArchived) throw new BadRequestException('Book is archived and cannot be borrowed');
    if (item.status !== 'AVAILABLE') throw new BadRequestException('Book already borrowed');

    const now = new Date();
    const due = new Date(now);
    due.setDate(due.getDate() + 14);

    return this.prisma.$transaction(async (tx) => {
      const loan = await tx.loan.create({
        data: {
          userId,
          itemId,
          loanDate: now,
          dueDate: due,
        },
        include: {
          user: true,
          item: true,
        },
      });

      await tx.libraryItem.update({
        where: { id: itemId },
        data: { status: 'BORROWED' },
      });

      await tx.transaction.create({
        data: {
          userId,
          action: 'LOAN_CREATED',
          details: `Loan ${loan.id} created for item ${itemId}`,
        },
      });

      // Send email notification
      await this.mailer.sendLoanEmail(
        loan.user.email,
        loan.user.name,
        loan.item.title,
        loan.dueDate,
      );

      return loan;
    });
  }

  async return(loanId: string) {
    const existing = await this.prisma.loan.findUnique({ 
      where: { id: loanId },
      include: { user: true, item: true },
    });
    if (!existing) throw new NotFoundException('Loan not found');

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.loan.update({
        where: { id: loanId },
        data: { returnDate: new Date() },
        include: { user: true, item: true },
      });

      await tx.libraryItem.update({
        where: { id: updated.itemId },
        data: { status: 'AVAILABLE' },
      });

      await tx.transaction.create({
        data: {
          userId: existing.userId,
          action: 'LOAN_RETURNED',
          details: `Loan ${loanId} returned for item ${updated.itemId}`,
        },
      });

      // Send email notification
      await this.mailer.sendReturnEmail(
        updated.user.email,
        updated.user.name,
        updated.item.title,
      );

      // Check for pending reservations
      await this.reservationService.checkAndFulfillReservations(updated.itemId);

      return updated;
    });
  }

  async renew(loanId: string) {
    const existing = await this.prisma.loan.findUnique({ where: { id: loanId } });
    if (!existing) throw new NotFoundException('Loan not found');
    if (existing.returnDate) throw new BadRequestException('Cannot renew a returned loan');

    const newDue = new Date(existing.dueDate);
    newDue.setDate(newDue.getDate() + 14);

    const updated = await this.prisma.loan.update({
      where: { id: loanId },
      data: { dueDate: newDue, renewalCount: (existing.renewalCount ?? 0) + 1 },
    });

    await this.prisma.transaction.create({
      data: {
        userId: existing.userId,
        action: 'LOAN_RENEWED',
        details: `Loan ${loanId} renewed, due ${newDue.toISOString()}`,
      },
    });

    return updated;
  }

  async getAllLoans() {
    return this.prisma.loan.findMany({
      include: { item: true, user: true },
    });
  }

  async getOverdueLoans() {
    return this.prisma.loan.findMany({
      where: { dueDate: { lt: new Date() }, returnDate: null },
      include: { item: true, user: true },
    });
  }

  async getUserLoans(userId: string) {
    return this.prisma.loan.findMany({
      where: { userId },
      include: { item: true },
    });
  }

  async sendDueDateReminders() {
    // Send reminders 1 day before due date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    const loansDueTomorrow = await this.prisma.loan.findMany({
      where: {
        dueDate: {
          gte: tomorrow,
          lt: dayAfterTomorrow,
        },
        returnDate: null,
      },
      include: {
        user: true,
        item: true,
      },
    });

    for (const loan of loansDueTomorrow) {
      await this.mailer.sendDueDateReminderEmail(
        loan.user.email,
        loan.user.name,
        loan.item.title,
        loan.dueDate,
      );
    }

    return { message: `Sent ${loansDueTomorrow.length} due date reminders` };
  }

  async sendOverdueNotifications() {
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

    for (const loan of overdueLoans) {
      const daysOverdue = Math.floor((new Date().getTime() - loan.dueDate.getTime()) / (1000 * 60 * 60 * 24));
      const fineAmount = daysOverdue * 1.0; // $1 per day

      await this.mailer.sendOverdueEmail(
        loan.user.email,
        loan.user.name,
        loan.item.title,
        loan.dueDate,
        fineAmount,
      );
    }

    return { message: `Sent ${overdueLoans.length} overdue notifications` };
  }
}
