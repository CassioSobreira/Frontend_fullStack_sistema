import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireClient?: boolean;
}

/**
 * Componente que protege rotas baseado na autenticação e role do usuário
 * 
 * @param requireAdmin - Se true, apenas admins podem acessar
 * @param requireClient - Se true, apenas clientes podem acessar
 * @param children - Componente filho a ser renderizado se autorizado
 */
export default function ProtectedRoute({ 
  children, 
  requireAdmin = false,
  requireClient = false 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, isAdmin, isClient } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  // Se não está autenticado, redireciona para login
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Se requer admin mas não é admin, redireciona para dashboard do cliente
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard/client" replace />;
  }

  // Se requer cliente mas não é cliente (é admin), redireciona para dashboard do admin
  if (requireClient && !isClient) {
    return <Navigate to="/dashboard/admin" replace />;
  }

  return <>{children}</>;
}

