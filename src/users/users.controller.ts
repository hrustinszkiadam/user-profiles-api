import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  BadRequestException,
  HttpCode,
  Put,
  UploadedFile,
  ParseFilePipeBuilder,
  HttpStatus,
  UseInterceptors,
  StreamableFile,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma.service';
import * as fs from 'node:fs/promises';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly db: PrismaService,
  ) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.db.user.create({
      data: createUserDto,
    });
  }

  @Get()
  findAll() {
    return this.db.user.findMany();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const idInt = parseInt(id);
    if (isNaN(idInt)) {
      throw new BadRequestException(['Invalid id']);
    }
    const u = await this.db.user.findUnique({ where: { id: idInt } });
    if (!u) {
      throw new NotFoundException(`No user with id ${id}`);
    }
    return u;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const idInt = parseInt(id);
    if (isNaN(idInt)) {
      throw new BadRequestException(['Invalid id']);
    }
    try {
      const u = await this.db.user.update({
        data: updateUserDto,
        where: { id: idInt },
      });
      return u;
    } catch {
      throw new NotFoundException(`No user with id ${id}`);
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    const idInt = parseInt(id);
    if (isNaN(idInt)) {
      throw new BadRequestException(['Invalid id']);
    }
    try {
      await this.db.user.delete({
        where: { id: idInt },
      });
    } catch {
      throw new NotFoundException(`No user with id ${id}`);
    }
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
    // Validate
    const user = await this.findOne(id);

    await fs.writeFile(`public/pictures/${id}`, file.buffer);
    await this.db.user.update({
      data: {
        profileMime: file.mimetype
      },
      where: { id: user.id }
    })
  }

  @Delete(':id/profile')
  @HttpCode(204)
  async removeProfile(@Param('id') id: string) {
    // Validate
    await this.findOne(id);

    try {
      await fs.unlink(`public/pictures/${id}`);
    } catch {
      throw new NotFoundException('User has no profile picture');
    }
  }

  @Get(':id/profile')
  async getProfile(
    @Param('id') id: string,
  ) {
    // Validate
    const user = await this.findOne(id);

    try {
      return new StreamableFile(
        await fs.readFile(`public/pictures/${id}`),
        { type: user.profileMime }
      );
    } catch {
      return new StreamableFile(await fs.readFile(`public/profile.svg`), {
        type: 'image/svg+xml',
      });
    }
  }
}
