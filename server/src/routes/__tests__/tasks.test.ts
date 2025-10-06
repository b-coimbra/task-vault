import request from 'supertest';
import express from 'express';

const mockFindMany = jest.fn();
const mockCreate = jest.fn();
const mockUpdateMany = jest.fn();
const mockDeleteMany = jest.fn();

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => {
      return {
        task: {
          findMany: mockFindMany,
          create: mockCreate,
          updateMany: mockUpdateMany,
          deleteMany: mockDeleteMany,
        },
      };
    }),
  };
});

import { PrismaClient } from '@prisma/client';
import tasksRouter from '../tasks';

const app = express();
app.use(express.json());
app.use((req: any, res: any, next) => {
  req.user = { id: 'user1' };
  next();
});
app.use('/tasks', tasksRouter);

describe('Task Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('GET /tasks', () => {
    it('should return all tasks for the authenticated user', async () => {
      const mockTasks = [
        { id: '1', title: 'Test Task', userId: 'user1' },
      ];
      
      mockFindMany.mockResolvedValue(mockTasks);
      
      const response = await request(app).get('/tasks');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTasks);
      expect(mockFindMany).toHaveBeenCalledWith({
        where: { userId: 'user1' },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should handle errors', async () => {
      mockFindMany.mockRejectedValue(new Error('Database error'));
      
      const response = await request(app).get('/tasks');
      
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: 'Internal server error' });
    });
  });

  describe('POST /tasks', () => {
    it('should create a new task', async () => {
      const newTask = {
        id: '1',
        title: 'New Task',
        status: 'PENDING',
        userId: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      mockCreate.mockResolvedValue(newTask);
      
      const response = await request(app)
        .post('/tasks')
        .send({ title: 'New Task' });
      
      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        title: 'New Task',
        status: 'PENDING',
      });
      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          title: 'New Task',
          description: null,
          status: 'PENDING',
          expirationDate: null,
          userId: 'user1',
        },
      });
    });

    it('should validate task data', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({});
      
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'Title is required' });
    });
  });

  describe('PUT /tasks/:id', () => {
    it('should update an existing task', async () => {
      mockUpdateMany.mockResolvedValue({ count: 1 } as any);
      
      const response = await request(app)
        .put('/tasks/1')
        .send({ title: 'Updated Task' });
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Task updated successfully' });
      expect(mockUpdateMany).toHaveBeenCalledWith({
        where: {
          id: '1',
          userId: 'user1',
        },
        data: {
          title: 'Updated Task',
        },
      });
    });

    it('should return 404 if task not found', async () => {
      mockUpdateMany.mockResolvedValue({ count: 0 } as any);
      
      const response = await request(app)
        .put('/tasks/999')
        .send({ title: 'Updated Task' });
      
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Task not found' });
    });
  });

  describe('DELETE /tasks/:id', () => {
    it('should delete an existing task', async () => {
      mockDeleteMany.mockResolvedValue({ count: 1 } as any);
      
      const response = await request(app).delete('/tasks/1');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Task deleted successfully' });
      expect(mockDeleteMany).toHaveBeenCalledWith({
        where: {
          id: '1',
          userId: 'user1',
        },
      });
    });

    it('should return 404 if task not found', async () => {
      mockDeleteMany.mockResolvedValue({ count: 0 } as any);
      
      const response = await request(app).delete('/tasks/999');
      
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Task not found' });
    });
  });
});
