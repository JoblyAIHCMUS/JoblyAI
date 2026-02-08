import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account, AccountRole } from '../entities/account.entity';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
  ) {}

  async createAccount(
    email: string,
    passwordHash: string,
    role: AccountRole = AccountRole.CANDIDATE,
  ): Promise<Account> {
    const existingAccount = await this.accountRepository.findOne({
      where: { email },
    });

    if (existingAccount) {
      throw new ConflictException(`Account with email ${email} already exists`);
    }

    const account = this.accountRepository.create({
      email,
      passwordHash,
      role,
      isVerified: false,
    });

    return this.accountRepository.save(account);
  }

  async findAccountById(id: number): Promise<Account> {
    const account = await this.accountRepository.findOne({
      where: { id },
    });

    if (!account) {
      throw new NotFoundException(`Account with id ${id} not found`);
    }

    return account;
  }

  async findAccountByEmail(email: string): Promise<Account | null> {
    return this.accountRepository.findOne({
      where: { email },
    });
  }

  async updateAccount(id: number, updates: Partial<Account>): Promise<Account> {
    const account = await this.findAccountById(id);

    Object.assign(account, updates);

    return this.accountRepository.save(account);
  }

  async verifyAccount(id: number): Promise<Account> {
    return this.updateAccount(id, { isVerified: true });
  }

  async deleteAccount(id: number): Promise<void> {
    const result = await this.accountRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Account with id ${id} not found`);
    }
  }

  async getAllAccounts(): Promise<Account[]> {
    return this.accountRepository.find();
  }
}
