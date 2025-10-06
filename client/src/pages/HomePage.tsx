import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { TaskProvider } from '../contexts/TaskContext';
import TaskList from '../components/TaskList';
import CreateTaskModal from '../components/CreateTaskModal';
import '../styles/TasksPage.css';

const HomePage: React.FC = () => {
  const { user, logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogout = () =>
    logout();

  const handleCreateTask = () =>
    setIsModalOpen(true);

  const handleCloseModal = () =>
    setIsModalOpen(false);

  return (
    <TaskProvider>
      <div className="home-container">
        <header className="home-header">
          <h1>Task Vault</h1>
          <div className="user-info">
            <span>{user?.name || user?.email}</span>
            <button onClick={handleLogout} className="logout-button">
              Sair
            </button>
          </div>
        </header>

        <main className="home-main">
          <div className="tasks-section">
            <div className="tasks-header">
              <h2>Suas Tarefas</h2>
              <button
                onClick={handleCreateTask}
                className="create-task-button"
              >
                + Criar Tarefa
              </button>
            </div>

            <TaskList />
          </div>
        </main>

        <CreateTaskModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      </div>
    </TaskProvider>
  );
};

export default HomePage;
