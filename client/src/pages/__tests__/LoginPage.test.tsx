import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import LoginPage from '../LoginPage';
import { AuthProvider } from '../../contexts/AuthContext';
import apiClient from '../../api/client';

jest.mock('../../api/client');

const renderWithRouter = () => {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/home" element={<div>Home</div>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
};

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('renders login form by default', () => {
    renderWithRouter();
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('toggles to register mode and back', () => {
    renderWithRouter();

    const toggle = screen.getByRole('button', { name: /cadastrar/i });
    fireEvent.click(toggle);
    expect(screen.getByRole('heading', { name: /criar conta/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/nome/i)).toBeInTheDocument();

    const toggleBack = screen.getByRole('button', { name: /entrar/i });
    fireEvent.click(toggleBack);
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
  });

  it('logs in successfully and navigates to /home', async () => {
    (apiClient.post as jest.Mock).mockResolvedValueOnce({
      token: 'jwt.token',
      user: { id: 'u1', email: 'test@example.com' },
    });
    (apiClient.get as jest.Mock).mockResolvedValueOnce({ user: { id: 'u1', email: 'test@example.com' } });

    renderWithRouter();

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByText('Home')).toBeInTheDocument();
    });

    expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
      email: 'test@example.com',
      password: 'password123',
    });
    expect(localStorage.getItem('token')).toBe('jwt.token');
  });

  it('registers successfully and navigates to /home', async () => {
    (apiClient.post as jest.Mock).mockResolvedValueOnce({
      token: 'new.token',
      user: { id: 'u1', email: 'new@example.com', name: 'New User' },
    });
    (apiClient.get as jest.Mock).mockResolvedValueOnce({ user: { id: 'u1', email: 'new@example.com', name: 'New User' } });

    renderWithRouter();
    fireEvent.click(screen.getByRole('button', { name: /cadastrar/i }));

    fireEvent.change(screen.getByLabelText(/nome/i), {
      target: { value: 'New User' },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'new@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /criar conta/i }));

    await waitFor(() => {
      expect(screen.getByText('Home')).toBeInTheDocument();
    });

    expect(apiClient.post).toHaveBeenCalledWith('/auth/register', {
      email: 'new@example.com',
      password: 'password123',
      name: 'New User',
    });
    expect(localStorage.getItem('token')).toBe('new.token');
  });

  it('shows API error message on failed login', async () => {
    (apiClient.post as jest.Mock).mockRejectedValueOnce(new Error('Invalid credentials'));

    renderWithRouter();
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'x@x.com' } });
    fireEvent.change(screen.getByLabelText(/senha/i), { target: { value: 'bad' } });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });
});


