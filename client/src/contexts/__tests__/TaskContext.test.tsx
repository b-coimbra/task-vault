import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { TaskProvider, useTasks } from '../TaskContext';
import apiClient from '../../api/client';

jest.mock('../../api/client');

const mockTasks = [
  {
    id: '1',
    title: 'Test Task',
    description: 'Test Description',
    status: 'PENDING' as const,
    userId: 'user1',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
  },
];

describe('TaskContext', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <TaskProvider>{children}</TaskProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should fetch tasks on mount', async () => {
    (apiClient.get as jest.Mock).mockResolvedValueOnce(mockTasks);
    
    const { result } = renderHook(() => useTasks(), { wrapper });
    
    expect(result.current.loading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(apiClient.get).toHaveBeenCalledWith('/tasks');
    expect(result.current.tasks).toEqual(mockTasks);
    expect(result.current.error).toBeNull();
  });

  it('should handle fetch error', async () => {
    const errorMessage = 'Failed to fetch tasks';
    (apiClient.get as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));
    
    const { result } = renderHook(() => useTasks(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.error).toBe(errorMessage);
    });
    
    expect(result.current.loading).toBe(false);
  });

  it('should create a new task', async () => {
    const newTask = {
      id: '2',
      title: 'New Task',
      status: 'PENDING' as const,
      userId: 'user1',
      createdAt: '2023-01-02T00:00:00.000Z',
      updatedAt: '2023-01-02T00:00:00.000Z',
    };
    
    (apiClient.get as jest.Mock).mockResolvedValueOnce(mockTasks);
    (apiClient.post as jest.Mock).mockResolvedValueOnce(newTask);
    
    const { result } = renderHook(() => useTasks(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    await act(async () => {
      await result.current.createTask({
        title: 'New Task',
        status: 'PENDING',
      });
    });
    
    expect(apiClient.post).toHaveBeenCalledWith('/tasks', {
      title: 'New Task',
      status: 'PENDING',
    });
    
    expect(result.current.tasks).toContainEqual(newTask);
  });

  it('should update a task', async () => {
    const updatedTask = { ...mockTasks[0], title: 'Updated Task' };
    
    (apiClient.get as jest.Mock).mockResolvedValueOnce(mockTasks);
    (apiClient.put as jest.Mock).mockResolvedValueOnce({});
    
    const { result } = renderHook(() => useTasks(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    await act(async () => {
      await result.current.updateTask('1', { title: 'Updated Task' });
    });
    
    expect(apiClient.put).toHaveBeenCalledWith('/tasks/1', { title: 'Updated Task' });
    expect(result.current.tasks[0].title).toBe('Updated Task');
  });

  it('should delete a task', async () => {
    (apiClient.get as jest.Mock).mockResolvedValueOnce(mockTasks);
    (apiClient.delete as jest.Mock).mockResolvedValueOnce({});
    
    const { result } = renderHook(() => useTasks(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    await act(async () => {
      await result.current.deleteTask('1');
    });
    
    expect(apiClient.delete).toHaveBeenCalledWith('/tasks/1');
    expect(result.current.tasks).toHaveLength(0);
  });
});
