const mockUser = {
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  password: '$2b$10$hashedpassword',
  role: 'PATRON',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockGenre = {
  id: 'genre-1',
  name: 'Fiction',
  description: 'Imaginative narratives',
  books: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockBook = {
  id: 'book-1',
  title: 'Test Book',
  author: 'Test Author',
  isbn: '9780000000001',
  description: 'A test book',
  publishedAt: new Date(),
  available: true,
  genreId: 'genre-1',
  genre: mockGenre,
  createdAt: new Date(),
  updatedAt: new Date(),
};

jest.mock('@nestjs/common', () => ({
  Injectable: () => (_target) => _target,
  Module: () => (_target) => _target,
  Controller: () => (_target) => {},
  Get: () => (_target, _key, _descriptor) => {},
  Post: () => (_target, _key, _descriptor) => {},
  Body: () => {},
  Param: () => {},
  Patch: () => (_target, _key, _descriptor) => {},
  Delete: () => (_target, _key, _descriptor) => {},
  Query: () => {},
  UseGuards: () => (_target, _key, _descriptor) => {},
  NotFoundException: class NotFoundException extends Error {
    constructor(message) {
      super(message);
      this.name = 'NotFoundException';
    }
  },
  ConflictException: class ConflictException extends Error {
    constructor(message) {
      super(message);
      this.name = 'ConflictException';
    }
  },
  BadRequestException: class BadRequestException extends Error {
    constructor(message) {
      super(message);
      this.name = 'BadRequestException';
    }
  },
  UnauthorizedException: class UnauthorizedException extends Error {
    constructor(message) {
      super(message);
      this.name = 'UnauthorizedException';
    }
  },
  ForbiddenException: class ForbiddenException extends Error {
    constructor(message) {
      super(message);
      this.name = 'ForbiddenException';
    }
  },
}));

jest.mock('@nestjs/jwt', () => ({
  JwtService: jest.fn().mockImplementation(() => ({
    sign: jest.fn().mockReturnValue('fake-jwt-token'),
  })),
}));

jest.mock('./prisma/prisma.service', () => {
  return {
    PrismaService: jest.fn().mockImplementation(() => ({
      genre: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
        upsert: jest.fn(),
      },
      book: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
        upsert: jest.fn(),
      },
      user: {
        create: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn(),
      },
    })),
  };
});

describe('GenresService', () => {
  let service;
  let prisma;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = new (require('./prisma/prisma.service').PrismaService)();
    service = new (require('./genres/genres.service').GenresService)(prisma);
  });

  it('should create a genre', async () => {
    prisma.genre.create.mockResolvedValue(mockGenre);
    const result = await service.create({
      name: 'Fiction',
      description: 'desc',
    });
    expect(result).toEqual(mockGenre);
    expect(prisma.genre.create).toHaveBeenCalledWith({
      data: { name: 'Fiction', description: 'desc' },
    });
  });

  it('should throw ConflictException on duplicate genre name', async () => {
    const error = new Error('Unique constraint');
    error.code = 'P2002';
    prisma.genre.create.mockRejectedValue(error);
    await expect(service.create({ name: 'Fiction' })).rejects.toThrow(
      require('@nestjs/common').ConflictException,
    );
  });

  it('should find all genres', async () => {
    prisma.genre.findMany.mockResolvedValue([mockGenre]);
    const result = await service.findAll();
    expect(result).toEqual([mockGenre]);
  });

  it('should find a genre by id', async () => {
    prisma.genre.findUnique.mockResolvedValue(mockGenre);
    const result = await service.findOne('genre-1');
    expect(result).toEqual(mockGenre);
  });

  it('should throw NotFoundException for missing genre', async () => {
    prisma.genre.findUnique.mockResolvedValue(null);
    await expect(service.findOne('missing')).rejects.toThrow(
      require('@nestjs/common').NotFoundException,
    );
  });

  it('should update a genre', async () => {
    prisma.genre.findUnique.mockResolvedValue(mockGenre);
    prisma.genre.update.mockResolvedValue({ ...mockGenre, name: 'Updated' });
    const result = await service.update('genre-1', { name: 'Updated' });
    expect(result.name).toEqual('Updated');
  });

  it('should throw NotFoundException when updating missing genre', async () => {
    prisma.genre.findUnique.mockResolvedValue(null);
    await expect(service.update('missing', { name: 'X' })).rejects.toThrow(
      require('@nestjs/common').NotFoundException,
    );
  });

  it('should delete a genre with no books', async () => {
    prisma.genre.findUnique.mockResolvedValue({ ...mockGenre, books: [] });
    prisma.genre.delete.mockResolvedValue(mockGenre);
    const result = await service.remove('genre-1');
    expect(result).toEqual(mockGenre);
    expect(prisma.genre.delete).toHaveBeenCalledWith({
      where: { id: 'genre-1' },
    });
  });

  it('should throw BadRequestException when deleting genre with books', async () => {
    prisma.genre.findUnique.mockResolvedValue({
      ...mockGenre,
      books: [mockBook],
    });
    await expect(service.remove('genre-1')).rejects.toThrow(
      require('@nestjs/common').BadRequestException,
    );
  });
});

describe('BooksService', () => {
  let service;
  let prisma;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = new (require('./prisma/prisma.service').PrismaService)();
    service = new (require('./books/books.service').BooksService)(prisma);
  });

  it('should find all books with pagination', async () => {
    prisma.book.findMany.mockResolvedValue([mockBook]);
    prisma.book.count.mockResolvedValue(1);
    const result = await service.findAll({ page: 1, limit: 10 });
    expect(result.data).toEqual([mockBook]);
    expect(result.meta.total).toEqual(1);
    expect(result.meta.page).toEqual(1);
    expect(result.meta.limit).toEqual(10);
    expect(result.meta.totalPages).toEqual(1);
  });

  it('should filter by genreId', async () => {
    prisma.book.findMany.mockResolvedValue([mockBook]);
    prisma.book.count.mockResolvedValue(1);
    await service.findAll({ genreId: 'genre-1' });
    expect(prisma.book.findMany).toHaveBeenCalledWith({
      where: { genreId: 'genre-1' },
      skip: 0,
      take: 10,
      include: { genre: true },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('should search by title and author', async () => {
    prisma.book.findMany.mockResolvedValue([mockBook]);
    prisma.book.count.mockResolvedValue(1);
    await service.findAll({ search: 'test' });
    expect(prisma.book.findMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { title: { contains: 'test', mode: 'insensitive' } },
          { author: { contains: 'test', mode: 'insensitive' } },
        ],
      },
      skip: 0,
      take: 10,
      include: { genre: true },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('should find one book', async () => {
    prisma.book.findUnique.mockResolvedValue(mockBook);
    const result = await service.findOne('book-1');
    expect(result).toEqual(mockBook);
  });

  it('should throw NotFoundException for missing book', async () => {
    prisma.book.findUnique.mockResolvedValue(null);
    await expect(service.findOne('missing')).rejects.toThrow(
      require('@nestjs/common').NotFoundException,
    );
  });

  it('should create a book', async () => {
    prisma.book.create.mockResolvedValue(mockBook);
    const result = await service.create({
      title: 'Test Book',
      author: 'Test Author',
      isbn: '9780000000001',
      genreId: 'genre-1',
    });
    expect(result).toEqual(mockBook);
    expect(prisma.book.create).toHaveBeenCalledWith({
      data: {
        title: 'Test Book',
        author: 'Test Author',
        isbn: '9780000000001',
        description: undefined,
        publishedAt: undefined,
        available: true,
        genreId: 'genre-1',
      },
      include: { genre: true },
    });
  });

  it('should throw ConflictException on duplicate ISBN', async () => {
    const error = new Error('Unique constraint');
    error.code = 'P2002';
    prisma.book.create.mockRejectedValue(error);
    await expect(
      service.create({ title: 'T', author: 'A', isbn: 'dup', genreId: 'g' }),
    ).rejects.toThrow(require('@nestjs/common').ConflictException);
  });

  it('should update a book', async () => {
    prisma.book.findUnique.mockResolvedValue(mockBook);
    prisma.book.update.mockResolvedValue({ ...mockBook, title: 'Updated' });
    const result = await service.update('book-1', { title: 'Updated' });
    expect(result.title).toEqual('Updated');
  });

  it('should delete a book', async () => {
    prisma.book.findUnique.mockResolvedValue(mockBook);
    prisma.book.delete.mockResolvedValue(mockBook);
    const result = await service.remove('book-1');
    expect(result).toEqual(mockBook);
  });
});

describe('AuthService', () => {
  let service;
  let prisma;
  let jwtService;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = new (require('./prisma/prisma.service').PrismaService)();
    jwtService = { sign: jest.fn().mockReturnValue('fake-jwt-token') };
    const AuthService = require('./auth/auth.service').AuthService;
    service = new AuthService(prisma, jwtService);
  });

  it('should register a user and default role to PATRON', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue(mockUser);
    const result = await service.register({
      name: 'Test',
      email: 'test@example.com',
      password: 'plainpassword',
      role: 'LIBRARIAN',
    });
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: 'test@example.com',
          role: 'PATRON',
        }),
      }),
    );
    expect(result.password).toBeUndefined();
  });

  it('should throw ConflictException on duplicate email', async () => {
    prisma.user.findUnique.mockResolvedValue(mockUser);
    await expect(
      service.register({
        name: 'Test',
        email: 'test@example.com',
        password: 'password',
      }),
    ).rejects.toThrow(require('@nestjs/common').ConflictException);
  });

  it('should login and return JWT', async () => {
    prisma.user.findUnique.mockResolvedValue(mockUser);
    jest.spyOn(require('bcrypt'), 'compare').mockResolvedValue(true);
    jwtService.sign.mockReturnValue('fake-token');
    const result = await service.login({
      email: 'test@example.com',
      password: 'password',
    });
    expect(result.access_token).toEqual('fake-token');
    expect(result.user.password).toBeUndefined();
  });

  it('should reject wrong password', async () => {
    prisma.user.findUnique.mockResolvedValue(mockUser);
    jest.spyOn(require('bcrypt'), 'compare').mockResolvedValue(false);
    await expect(
      service.login({ email: 'test@example.com', password: 'wrong' }),
    ).rejects.toThrow();
  });
});
