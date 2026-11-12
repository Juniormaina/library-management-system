import { config } from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

// Load Neon environment variables without exposing credentials.
config({ path: '../.env.local' });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is required to run the seed script');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

type SeedBook = {
  title: string;
  author: string;
  isbn: string;
  description: string;
  publishedAt: Date;
  available: boolean;
  totalCopies?: number;
  genreName: string;
};

const genres = [
  {
    name: 'Fiction',
    description:
      'Imaginative narratives that explore character, conflict, and human experience.',
  },
  {
    name: 'Science',
    description:
      'Nonfiction works that explain scientific ideas, discoveries, and methods.',
  },
  {
    name: 'History',
    description:
      'Accounts and analyses of past events, societies, and historical change.',
  },
  {
    name: 'Technology',
    description:
      'Books about computing, software, engineering, and digital innovation.',
  },
] as const;

const books: SeedBook[] = [
  {
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    isbn: '9780061120084',
    description:
      'A novel about justice, empathy, and moral courage in the American South.',
    publishedAt: new Date('1960-07-11'),
    available: true,
    totalCopies: 3,
    genreName: 'Fiction',
  },
  {
    title: '1984',
    author: 'George Orwell',
    isbn: '9780451524935',
    description:
      'A dystopian story examining surveillance, truth, and authoritarian control.',
    publishedAt: new Date('1949-06-08'),
    available: true,
    totalCopies: 2,
    genreName: 'Fiction',
  },
  {
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    isbn: '9780141439518',
    description:
      'A classic novel of manners, family, and personal growth in Regency England.',
    publishedAt: new Date('1813-01-28'),
    available: true,
    genreName: 'Fiction',
  },
  {
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    isbn: '9780743273565',
    description:
      'A portrait of ambition, wealth, and disillusionment during the Jazz Age.',
    publishedAt: new Date('1925-04-10'),
    available: false,
    totalCopies: 0,
    genreName: 'Fiction',
  },
  {
    title: 'A Brief History of Time',
    author: 'Stephen Hawking',
    isbn: '9780553380163',
    description:
      'An accessible exploration of cosmology, black holes, and the nature of time.',
    publishedAt: new Date('1988-04-01'),
    available: true,
    genreName: 'Science',
  },
  {
    title: 'The Selfish Gene',
    author: 'Richard Dawkins',
    isbn: '9780199291151',
    description:
      'A foundational look at evolution through the lens of gene-centered selection.',
    publishedAt: new Date('1976-03-13'),
    available: true,
    genreName: 'Science',
  },
  {
    title: 'Silent Spring',
    author: 'Rachel Carson',
    isbn: '9780618249060',
    description:
      'A landmark environmental science book about pesticides and ecological harm.',
    publishedAt: new Date('1962-09-27'),
    available: true,
    genreName: 'Science',
  },
  {
    title: 'Cosmos',
    author: 'Carl Sagan',
    isbn: '9780345539434',
    description:
      'A sweeping tour of the universe, scientific discovery, and human curiosity.',
    publishedAt: new Date('1980-09-28'),
    available: false,
    totalCopies: 0,
    genreName: 'Science',
  },
  {
    title: 'Guns, Germs, and Steel',
    author: 'Jared Diamond',
    isbn: '9780393317558',
    description:
      'An analysis of how geography and environment shaped the fortunes of societies.',
    publishedAt: new Date('1997-03-01'),
    available: true,
    genreName: 'History',
  },
  {
    title: 'The Diary of a Young Girl',
    author: 'Anne Frank',
    isbn: '9780553296983',
    description:
      'A personal account of life in hiding during the Nazi occupation.',
    publishedAt: new Date('1947-06-25'),
    available: true,
    genreName: 'History',
  },
  {
    title: 'Team of Rivals',
    author: 'Doris Kearns Goodwin',
    isbn: '9780743270755',
    description:
      'A political history of Abraham Lincoln and the cabinet he assembled.',
    publishedAt: new Date('2005-10-25'),
    available: true,
    genreName: 'History',
  },
  {
    title: 'The Wright Brothers',
    author: 'David McCullough',
    isbn: '9781476728759',
    description:
      'The story of Wilbur and Orville Wright and the invention of powered flight.',
    publishedAt: new Date('2015-05-05'),
    available: false,
    totalCopies: 0,
    genreName: 'History',
  },
  {
    title: 'Clean Code',
    author: 'Robert C. Martin',
    isbn: '9780132350884',
    description:
      'Practical guidance for writing readable, maintainable, and professional software.',
    publishedAt: new Date('2008-08-01'),
    available: true,
    genreName: 'Technology',
  },
  {
    title: 'The Pragmatic Programmer',
    author: 'Andrew Hunt and David Thomas',
    isbn: '9780135957059',
    description:
      'Timeless advice on craftsmanship, problem solving, and software delivery.',
    publishedAt: new Date('2019-09-13'),
    available: true,
    genreName: 'Technology',
  },
  {
    title: 'Designing Data-Intensive Applications',
    author: 'Martin Kleppmann',
    isbn: '9781449373320',
    description:
      'A deep guide to data systems, scalability, reliability, and maintainability.',
    publishedAt: new Date('2017-04-18'),
    available: true,
    genreName: 'Technology',
  },
  {
    title: 'Refactoring',
    author: 'Martin Fowler',
    isbn: '9780134757599',
    description:
      'Techniques for improving existing code design without changing behavior.',
    publishedAt: new Date('2018-11-19'),
    available: true,
    genreName: 'Technology',
  },
];

async function main() {
  console.log('Seeding library data (idempotent upserts)...');

  for (const genre of genres) {
    await prisma.genre.upsert({
      where: { name: genre.name },
      update: { description: genre.description },
      create: genre,
    });
  }

  for (const book of books) {
    const genre = await prisma.genre.findUnique({
      where: { name: book.genreName },
      select: { id: true },
    });

    if (!genre) {
      throw new Error(`Missing genre "${book.genreName}" for book "${book.title}"`);
    }

    await prisma.book.upsert({
      where: { isbn: book.isbn },
      update: {
        title: book.title,
        author: book.author,
        description: book.description,
        publishedAt: book.publishedAt,
        available: book.available,
        totalCopies: book.totalCopies ?? 1,
        genreId: genre.id,
      },
      create: {
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        description: book.description,
        publishedAt: book.publishedAt,
        available: book.available,
        totalCopies: book.totalCopies ?? 1,
        genreId: genre.id,
      },
    });
  }

  const [genreCount, bookCount] = await Promise.all([
    prisma.genre.count(),
    prisma.book.count(),
  ]);

  console.log(`Seed complete. Genres: ${genreCount}, Books: ${bookCount}.`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
