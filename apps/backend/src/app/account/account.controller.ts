import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { AccountService } from './account.service';
import { Account, AccountRole } from '../entities/account.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@ApiTags('accounts')
@Controller('api/accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new account' })
  @ApiResponse({
    status: 201,
    description: 'Account created successfully',
    type: Account,
  })
  async createAccount(@Body() createAccountDto: CreateAccountDto) {
    return this.accountService.createAccount(
      createAccountDto.email,
      createAccountDto.passwordHash,
      createAccountDto.role || AccountRole.CANDIDATE
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all accounts' })
  @ApiResponse({
    status: 200,
    description: 'List of all accounts',
    type: [Account],
  })
  async getAllAccounts() {
    return this.accountService.getAllAccounts();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get account by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Account found',
    type: Account,
  })
  async getAccountById(@Param('id', ParseIntPipe) id: number) {
    return this.accountService.findAccountById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update account' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Account updated successfully',
    type: Account,
  })
  async updateAccount(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAccountDto: UpdateAccountDto
  ) {
    return this.accountService.updateAccount(id, updateAccountDto);
  }

  @Post(':id/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify account email' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Account verified successfully',
    type: Account,
  })
  async verifyAccount(@Param('id', ParseIntPipe) id: number) {
    return this.accountService.verifyAccount(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete account' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 204,
    description: 'Account deleted successfully',
  })
  async deleteAccount(@Param('id', ParseIntPipe) id: number) {
    return this.accountService.deleteAccount(id);
  }
}
