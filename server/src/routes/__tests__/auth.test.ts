import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';

const mockFindUnique = jest.fn();
const mockCreate = jest.fn();

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => {
      return {
        user: {
          findUnique: mockFindUnique,
          create: mockCreate,
        },
      };
    }),
  };
});

jest.mock('bcryptjs', () => ({
  hash: jest.fn(async (pwd: string) => `hashed:${pwd}`),
  compare: jest.fn(async (pwd: string, hashed: string) => hashed === `hashed:${pwd}`),
}));

jest.spyOn(jwt, 'sign').mockImplementation(() => 'signed.token' as any);
jest.spyOn(jwt, 'verify').mockImplementation(() => ({ id: 'u1', email: 'a@a.com' }) as any);

import authRouter from '../auth';

const app = express();
app.use(express.json());
app.use('/auth', authRouter);

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'secret';
  });

  describe('POST /auth/register', () => {
    it('creates a new user and returns token + user', async () => {
      mockFindUnique.mockResolvedValueOnce(null);
      mockCreate.mockResolvedValueOnce({ id: 'u1', email: 'new@x.com', name: 'New', password: 'hashed:pass' });

      const res = await request(app).post('/auth/register').send({ email: 'new@x.com', password: 'pass', name: 'New' });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        message: 'User created successfully',
        token: 'signed.token',
        user: { id: 'u1', email: 'new@x.com', name: 'New' },
      });
      expect(mockFindUnique).toHaveBeenCalledWith({ where: { email: 'new@x.com' } });
      expect(mockCreate).toHaveBeenCalled();
    });

    it('rejects if user exists', async () => {
      mockFindUnique.mockResolvedValueOnce({ id: 'u1' });
      const res = await request(app).post('/auth/register').send({ email: 'new@x.com', password: 'pass' });
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ message: 'User already exists' });
    });

    it('validates required fields', async () => {
      const res = await request(app).post('/auth/register').send({});
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ message: 'Email and password are required' });
    });
  });

  describe('POST /auth/login', () => {
    it('authenticates user and returns token + user', async () => {
      mockFindUnique.mockResolvedValueOnce({ id: 'u1', email: 'a@a.com', name: 'A', password: 'hashed:pass' });

      const res = await request(app).post('/auth/login').send({ email: 'a@a.com', password: 'pass' });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        message: 'Login successful',
        token: 'signed.token',
        user: { id: 'u1', email: 'a@a.com', name: 'A' },
      });
    });

    it('fails with invalid credentials', async () => {
      mockFindUnique.mockResolvedValueOnce(null);
      const res = await request(app).post('/auth/login').send({ email: 'a@a.com', password: 'pass' });
      expect(res.status).toBe(401);
      expect(res.body).toEqual({ message: 'Invalid credentials' });
    });

    it('validates required fields', async () => {
      const res = await request(app).post('/auth/login').send({});
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ message: 'Email and password are required' });
    });
  });

  describe('GET /auth/verify', () => {
    it('returns user for valid token', async () => {
      mockFindUnique.mockResolvedValueOnce({ id: 'u1', email: 'a@a.com', name: undefined });
      const res = await request(app).get('/auth/verify').set('Authorization', 'Bearer signed.token');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ user: { id: 'u1', email: 'a@a.com', name: undefined } });
    });

    it('rejects when no token provided', async () => {
      const res = await request(app).get('/auth/verify');
      expect(res.status).toBe(401);
      expect(res.body).toEqual({ message: 'No token provided' });
    });
  });
});


