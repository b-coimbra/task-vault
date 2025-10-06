import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TaskProvider } from '../../contexts/TaskContext';
import TaskList from '../TaskList';
import apiClient from '../../api/client';

jest.mock('../../api/client');

const mockTasks = [
  {
    id: '1',
    title: 'Test Task 1',
    description: 'Description 1',
    status: 'PENDING' as const,
    userId: 'user1',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    title: 'Test Task 2',
    description: 'Description 2',
    status: 'DONE' as const,
    userId: 'user1',
    expirationDate: '2023-12-31T23:59:59.999Z',
    createdAt: '2023-01-02T00:00:00.000Z',
    updatedAt: '2023-01-02T00:00:00.000Z',
  },
];

describe('TaskList', () => {
  const renderTaskList = () => {
    return render(
      <TaskProvider>
        <TaskList />
      </TaskProvider>
    );
  };

  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (apiClient.get as jest.Mock).mockResolvedValue(mockTasks);
  });

  it('should render loading state', async () => {
    renderTaskList();
    expect(screen.getByText(/carregando/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText(/carregando/i)).not.toBeInTheDocument();
    });
  });

  it('should display tasks after loading', async () => {
    renderTaskList();
    
    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
      expect(screen.getByText('Test Task 2')).toBeInTheDocument();
    });
  });

  it('should filter tasks by status', async () => {
    renderTaskList();
    
    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    });
    
    const filterSelect = screen.getByLabelText(/filtrar por status/i);
    fireEvent.change(filterSelect, { target: { value: 'DONE' } });
    
    expect(screen.queryByText('Test Task 1')).not.toBeInTheDocument();
    expect(screen.getByText('Test Task 2')).toBeInTheDocument();
  });

  it('should sort tasks by title', async () => {
    renderTaskList();
    
    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    });
    
    const sortSelect = screen.getByLabelText(/ordenar por/i);
    fireEvent.change(sortSelect, { target: { value: 'title' } });
    
    const tasks = screen.getAllByText(/Test Task \d/);
    expect(tasks[0]).toHaveTextContent('Test Task 1');
    expect(tasks[1]).toHaveTextContent('Test Task 2');
    
    const sortOrderButton = screen.getByTitle(/ordenar decrescente/i);
    fireEvent.click(sortOrderButton);
    
    const reversedTasks = screen.getAllByText(/Test Task \d/);
    expect(reversedTasks[0]).toHaveTextContent('Test Task 2');
    expect(reversedTasks[1]).toHaveTextContent('Test Task 1');
  });

  it('should delete a task', async () => {
    (apiClient.delete as jest.Mock).mockResolvedValueOnce({});
    
    renderTaskList();
    
    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    });
    
    const deleteButtons = screen.getAllByTitle('Excluir tarefa');
    fireEvent.click(deleteButtons[0]);
    
    const confirmButton = await screen.findByText('Excluir');
    fireEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(apiClient.delete).toHaveBeenCalledWith('/tasks/1');
    });
  });

  it('should show empty state when no tasks', async () => {
    (apiClient.get as jest.Mock).mockResolvedValueOnce([]);
    
    renderTaskList();
    
    await waitFor(() => {
      expect(screen.getByText(/nenhuma tarefa ainda/i)).toBeInTheDocument();
    });
  });
});
