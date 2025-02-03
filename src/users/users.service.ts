import { Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma.service';
import * as fs from 'node:fs/promises';
import { User as TUser } from './entities/user';

@Injectable()
export class UsersService {
  constructor(private readonly db: PrismaService) { }

  async findAll(): Promise<TUser[]> {
    return await this.db.user.findMany();
  }

  async findOne(id: number): Promise<TUser> {
    const u = await this.db.user.findUnique({ where: { id } });
    if (!u) {
      throw new NotFoundException(`No user with id ${id}`);
    }
    return u;
  }

  async create(createUserDto: CreateUserDto): Promise<TUser> {
    return this.db.user.create({
      data: createUserDto,
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<TUser> {
    try {
      const u = await this.db.user.update({
        data: updateUserDto,
        where: { id },
      });
      return u;
    } catch {
      throw new NotFoundException(`No user with id ${id}`);
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await this.db.user.delete({
        where: { id },
      });
    } catch {
      throw new NotFoundException(`No user with id ${id}`);
    }
  }

  async getProfile(id: number): Promise<StreamableFile> {
    const user = await this.findOne(id);

    try {
      return new StreamableFile(
        await fs.readFile(`public/pictures/${id}`),
        { type: user.profileMime },
      );
    } catch {
      return new StreamableFile(await fs.readFile(`public/profile.svg`), {
        type: 'image/svg+xml',
      });
    }
  }

  async uploadProfile(id: number, file: Express.Multer.File): Promise<void> {
    const user = await this.findOne(id);

    await fs.writeFile(`public/pictures/${id}`, file.buffer);
    await this.db.user.update({
      data: {
        profileMime: file.mimetype,
      },
      where: { id: user.id },
    });
  }

  async removeProfile(id: number): Promise<void> {
    const user = await this.findOne(id);

    try {
      await fs.unlink(`public/pictures/${id}`);
      await this.db.user.update({
        data: {
          profileMime: null,
        },
        where: { id: user.id },
      });
    } catch {
      throw new NotFoundException('User has no profile picture');
    }
  }
}
