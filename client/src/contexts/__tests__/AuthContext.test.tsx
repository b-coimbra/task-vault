import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import apiClient from '../../api/client';

jest.mock('../../api/client');

describe('AuthContext', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('initializes without token', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
  });

  it('verifies token on mount when token exists', async () => {
    localStorage.setItem('token', 'abc');
    (apiClient.get as jest.Mock).mockResolvedValueOnce({ user: { id: 'u1', email: 'a@a.com' } });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(apiClient.get).toHaveBeenCalledWith('/auth/verify');
    expect(result.current.user).toEqual({ id: 'u1', email: 'a@a.com' });
  });

  it('handles verify token failure by logging out', async () => {
    localStorage.setItem('token', 'abc');
    (apiClient.get as jest.Mock).mockRejectedValueOnce(new Error('Invalid token'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('logs in and stores token/user', async () => {
    (apiClient.post as jest.Mock).mockResolvedValueOnce({
      token: 'jwt',
      user: { id: 'u1', email: 'x@y.com' },
    });
    (apiClient.get as jest.Mock).mockResolvedValueOnce({ user: { id: 'u1', email: 'x@y.com' } });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('x@y.com', 'pass');
    });

    expect(apiClient.post).toHaveBeenCalledWith('/auth/login', { email: 'x@y.com', password: 'pass' });
    expect(result.current.token).toBe('jwt');
    expect(result.current.user).toEqual({ id: 'u1', email: 'x@y.com' });
    expect(localStorage.getItem('token')).toBe('jwt');
  });

  it('registers and stores token/user', async () => {
    (apiClient.post as jest.Mock).mockResolvedValueOnce({
      token: 'new',
      user: { id: 'u2', email: 'new@x.com', name: 'New' },
    });
    (apiClient.get as jest.Mock).mockResolvedValueOnce({ user: { id: 'u2', email: 'new@x.com', name: 'New' } });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.register('new@x.com', 'pass', 'New');
    });

    expect(apiClient.post).toHaveBeenCalledWith('/auth/register', { email: 'new@x.com', password: 'pass', name: 'New' });
    expect(result.current.token).toBe('new');
    expect(result.current.user).toEqual({ id: 'u2', email: 'new@x.com', name: 'New' });
    expect(localStorage.getItem('token')).toBe('new');
  });

  it('logout clears token and user', async () => {
    (apiClient.post as jest.Mock).mockResolvedValueOnce({ token: 'jwt', user: { id: 'u1', email: 'x@y.com' } });
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('x@y.com', 'pass');
    });

    act(() => result.current.logout());

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });
});


