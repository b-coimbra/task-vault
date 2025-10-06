import React, { useState, useMemo } from 'react';
import { useTasks } from '../contexts/TaskContext';
import { Task } from '../contexts/TaskContext';
import EditTaskModal from './EditTaskModal';
import ConfirmDialog from './ConfirmDialog';

const TaskList: React.FC = () => {
  const { tasks, loading, error, deleteTask } = useTasks();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<string>('asc');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '#f59e0b';
      case 'IN_PROGRESS':
        return '#3b82f6';
      case 'DONE':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pendente';
      case 'IN_PROGRESS':
        return 'Em Andamento';
      case 'DONE':
        return 'Concluída';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const dateOnly = dateString.split('T')[0];
    const [year, month, day] = dateOnly.split('-');
    return `${day}/${month}/${year}`;
  };

  const filteredAndSortedTasks = useMemo(() => {
    let filteredTasks = tasks;

    if (statusFilter !== 'ALL')
      filteredTasks = tasks.filter(task => task.status === statusFilter);

    const sortedTasks = [...filteredTasks].sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'expirationDate') {
        if (!a.expirationDate && !b.expirationDate) return 0;
        if (!a.expirationDate) return 1;
        if (!b.expirationDate) return -1;
        comparison = new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime();
      } else if (sortBy === 'createdAt') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === 'title') {
        comparison = a.title.localeCompare(b.title);
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sortedTasks;
  }, [tasks, statusFilter, sortBy, sortOrder]);

  const handleTaskClick = (task: Task) => {
    setEditingTask(task);
  };

  const handleDeleteClick = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    setDeletingTask(task);
  };

  const handleConfirmDelete = async () => {
    if (deletingTask) {
      try {
        await deleteTask(deletingTask.id);
        setDeletingTask(null);
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const handleCloseEdit = () => setEditingTask(null);

  const handleCloseDelete = () => setDeletingTask(null);

  if (loading) {
    return (
      <div className="task-list-loading">
        <div className="loading-spinner">Carregando tarefas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="task-list-error">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="task-list-empty">
        <p>Nenhuma tarefa ainda. Crie sua primeira tarefa!</p>
      </div>
    );
  }

  return (
    <div className="task-list-container">
      <div className="task-controls">
        <div className="filter-controls">
          <label htmlFor="status-filter">Filtrar por status:</label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="ALL">Todos</option>
            <option value="PENDING">Pendente</option>
            <option value="IN_PROGRESS">Em Andamento</option>
            <option value="DONE">Concluída</option>
          </select>
        </div>
        
        <div className="sort-controls">
          <label htmlFor="sort-select">Ordenar por:</label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="createdAt">Data de Criação</option>
            <option value="expirationDate">Data de Vencimento</option>
            <option value="title">Título</option>
          </select>
        </div>

        <div className="sort-order-controls">
          <label>Ordem:</label>
          <button
            className="sort-order-button"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            title={sortOrder === 'asc' ? 'Ordenar decrescente' : 'Ordenar crescente'}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      <div className="task-count">
        {filteredAndSortedTasks.length} de {tasks.length} tarefa(s)
      </div>

      <div className="task-list">
        {filteredAndSortedTasks.map((task) => (
        <div key={task.id} className="task-item" onClick={() => handleTaskClick(task)}>
          <div className="task-header">
            <h3 className="task-title">{task.title}</h3>
            <div className="task-actions">
              <span 
                className="task-status"
                style={{ backgroundColor: getStatusColor(task.status) }}
              >
                {getStatusLabel(task.status)}
              </span>
              <button 
                className="delete-task-button"
                onClick={(e) => handleDeleteClick(e, task)}
                title="Excluir tarefa"
              >
                ×
              </button>
            </div>
          </div>
          
          {task.description && (
            <p className="task-description">{task.description}</p>
          )}
          
          <div className="task-footer">
            <span className="task-date">
              Criado: {formatDate(task.createdAt)}
            </span>
            {task.expirationDate && (
              <span className="task-expiration">
                Vence: {formatDate(task.expirationDate)}
              </span>
            )}
          </div>
        </div>
      ))}
      </div>

      <EditTaskModal 
        isOpen={!!editingTask}
        onClose={handleCloseEdit}
        task={editingTask}
      />

      <ConfirmDialog
        isOpen={!!deletingTask}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
        title="Excluir Tarefa"
        message={`Tem certeza que deseja excluir a tarefa "${deletingTask?.title}"?`}
        confirmText="Excluir"
        cancelText="Cancelar"
      />
    </div>
  );
};

export default TaskList;
