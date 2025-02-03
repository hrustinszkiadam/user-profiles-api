import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
  HttpCode,
  Put,
  UploadedFile,
  ParseFilePipeBuilder,
  HttpStatus,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  async findAll() {
    return await this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const idInt = parseInt(id);
    if (isNaN(idInt)) {
      throw new BadRequestException(['Invalid id']);
    }
    return await this.usersService.findOne(idInt);
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const idInt = parseInt(id);
    if (isNaN(idInt)) {
      throw new BadRequestException(['Invalid id']);
    }
    return await this.usersService.update(idInt, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    const idInt = parseInt(id);
    if (isNaN(idInt)) {
      throw new BadRequestException(['Invalid id']);
    }
    await this.usersService.remove(idInt);
  }

  @Put(':id/profile')
  @HttpCode(204)
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfile(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /^image/,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ) {
    const idInt = parseInt(id);
    if (isNaN(idInt)) {
      throw new BadRequestException(['Invalid id']);
    }
    await this.usersService.uploadProfile(idInt, file);
  }

  @Delete(':id/profile')
  @HttpCode(204)
  async removeProfile(@Param('id') id: string) {
    const idInt = parseInt(id);
    if (isNaN(idInt)) {
      throw new BadRequestException(['Invalid id']);
    }
    await this.usersService.removeProfile(idInt);
  }

  @Get(':id/profile')
  async getProfile(@Param('id') id: string) {
    const idInt = parseInt(id);
    if (isNaN(idInt)) {
      throw new BadRequestException(['Invalid id']);
    }
    return await this.usersService.getProfile(idInt);
  }
}
