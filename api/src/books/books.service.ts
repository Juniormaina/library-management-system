import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { BooksQueryDto } from './dto/books-query.dto';

export interface PaginatedBooks {
  data: unknown[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable()
export class BooksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: BooksQueryDto): Promise<PaginatedBooks> {
    const page = Math.max(query.page ?? 1, 1);
    const limit = Math.min(Math.max(query.limit ?? 10, 1), 100);

    const where: Record<string, unknown> = {};

    if (query.genreId) {
      where.genreId = query.genreId;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { author: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [books, total] = await Promise.all([
      this.prisma.book.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { genre: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.book.count({ where }),
    ]);

    return {
      data: books,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: { genre: true },
    });
    if (!book) {
      throw new NotFoundException(`Book with ID "${id}" not found`);
    }
    return book;
  }

  async create(createBookDto: CreateBookDto) {
    try {
      return await this.prisma.book.create({
        data: {
          title: createBookDto.title,
          author: createBookDto.author,
          isbn: createBookDto.isbn,
          description: createBookDto.description,
          publishedAt: createBookDto.publishedAt
            ? new Date(createBookDto.publishedAt)
            : undefined,
          available: createBookDto.available ?? true,
          genreId: createBookDto.genreId,
        },
        include: { genre: true },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('Book with this ISBN already exists');
      }
      if (error.code === 'P2003') {
        throw new BadRequestException('Invalid genre ID');
      }
      throw error;
    }
  }

  async update(id: string, updateBookDto: UpdateBookDto) {
    const existing = await this.prisma.book.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Book with ID "${id}" not found`);
    }
    try {
      return await this.prisma.book.update({
        where: { id },
        data: {
          ...(updateBookDto.title !== undefined && {
            title: updateBookDto.title,
          }),
          ...(updateBookDto.author !== undefined && {
            author: updateBookDto.author,
          }),
          ...(updateBookDto.isbn !== undefined && { isbn: updateBookDto.isbn }),
          ...(updateBookDto.description !== undefined && {
            description: updateBookDto.description,
          }),
          ...(updateBookDto.publishedAt !== undefined && {
            publishedAt: new Date(updateBookDto.publishedAt),
          }),
          ...(updateBookDto.available !== undefined && {
            available: updateBookDto.available,
          }),
          ...(updateBookDto.genreId !== undefined && {
            genreId: updateBookDto.genreId,
          }),
        },
        include: { genre: true },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('Book with this ISBN already exists');
      }
      if (error.code === 'P2003') {
        throw new BadRequestException('Invalid genre ID');
      }
      throw error;
    }
  }

  async remove(id: string) {
    const existing = await this.prisma.book.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Book with ID "${id}" not found`);
    }
    return this.prisma.book.delete({
      where: { id },
    });
  }
}
