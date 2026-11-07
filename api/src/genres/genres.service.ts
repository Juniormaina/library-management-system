import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';

@Injectable()
export class GenresService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createGenreDto: CreateGenreDto) {
    try {
      return await this.prisma.genre.create({
        data: {
          name: createGenreDto.name,
          description: createGenreDto.description,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('Genre name already exists');
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.genre.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const genre = await this.prisma.genre.findUnique({
      where: { id },
      include: { books: true },
    });
    if (!genre) {
      throw new NotFoundException(`Genre with ID "${id}" not found`);
    }
    return genre;
  }

  async update(id: string, updateGenreDto: UpdateGenreDto) {
    const existing = await this.prisma.genre.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Genre with ID "${id}" not found`);
    }
    try {
      return await this.prisma.genre.update({
        where: { id },
        data: {
          ...(updateGenreDto.name !== undefined && {
            name: updateGenreDto.name,
          }),
          ...(updateGenreDto.description !== undefined && {
            description: updateGenreDto.description,
          }),
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('Genre name already exists');
      }
      throw error;
    }
  }

  async remove(id: string) {
    const existing = await this.prisma.genre.findUnique({
      where: { id },
      include: { books: true },
    });
    if (!existing) {
      throw new NotFoundException(`Genre with ID "${id}" not found`);
    }
    if (existing.books && existing.books.length > 0) {
      throw new BadRequestException(
        'Cannot delete genre that is associated with existing books',
      );
    }
    return this.prisma.genre.delete({
      where: { id },
    });
  }
}
