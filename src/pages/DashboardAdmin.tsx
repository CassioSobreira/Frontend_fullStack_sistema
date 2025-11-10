import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/");
    } else if (!isLoading && !isAdmin) {
      navigate("/dashboard/client");
    }
  }, [isAuthenticated, isLoading, isAdmin, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 w-full max-w-4xl mx-auto p-6">
      <div className="w-full bg-gray-800/90 backdrop-blur-md rounded-xl shadow-2xl border border-gray-700/60 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Dashboard do Administrador</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Sair
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-900/50 rounded-lg p-4">
            <h2 className="text-xl font-semibold text-white mb-2">Informações do Administrador</h2>
            <div className="space-y-2 text-gray-300">
              <p><strong className="text-white">Nome:</strong> {user?.name}</p>
              <p><strong className="text-white">Email:</strong> {user?.email}</p>
              <p><strong className="text-white">Data de Nascimento:</strong> {user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('pt-BR') : 'N/A'}</p>
              <p><strong className="text-white">Role:</strong> {user?.role}</p>
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-4">
            <h2 className="text-xl font-semibold text-white mb-2">Painel de Controle</h2>
            <p className="text-gray-300">
              Esta é a área do administrador. Aqui você pode gerenciar usuários, produtos, visualizar análises e muito mais.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

