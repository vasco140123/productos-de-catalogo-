"use client";

import Link from "next/link";
import { Package, ListOrdered, LayoutDashboard, Lock } from "lucide-react";
import { useState, useEffect } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [autenticado, setAutenticado] = useState(false);
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(true);

  // Clave temporal (luego la pasaremos a variables de entorno)
  const CLAVE_ADMIN = "admin123";

  useEffect(() => {
    const authStatus = localStorage.getItem("admin_auth");
    if (authStatus === "true") {
      setAutenticado(true);
    }
    setCargando(false);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === CLAVE_ADMIN) {
      localStorage.setItem("admin_auth", "true");
      setAutenticado(true);
    } else {
      alert("Contraseña incorrecta");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_auth");
    setAutenticado(false);
  };

  if (cargando) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Cargando...</div>;

  if (!autenticado) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-50 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-serif font-bold text-gray-900 mb-2">Acceso Restringido</h1>
          <p className="text-gray-500 mb-6">Ingresa la contraseña para gestionar tu tienda.</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              className="w-full border border-gray-300 rounded-lg p-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
            <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-lg font-medium transition-colors">
              Ingresar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent flex">
      {/* Sidebar Lateral */}
      <aside className="w-64 glass-effect border-r border-white flex flex-col z-10 relative">
        <div className="h-16 flex items-center px-6 border-b border-white/50">
          <span className="font-serif font-bold text-xl text-primary">Panel Admin</span>
        </div>
        <nav className="flex-1 p-4 space-y-2 text-sm font-medium">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-white/50 rounded-lg transition-colors">
            <LayoutDashboard size={18} /> Resumen
          </Link>
          <Link href="/admin/productos" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-white/50 rounded-lg transition-colors">
            <Package size={18} /> Productos
          </Link>
          <Link href="/admin/categorias" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-white/50 rounded-lg transition-colors">
            <ListOrdered size={18} /> Categorías
          </Link>
          <Link href="/admin/pedidos" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-white/50 rounded-lg transition-colors">
            <ListOrdered size={18} /> Ventas y Stock
          </Link>
        </nav>
        <div className="p-4 border-t border-white/50">
          <button onClick={handleLogout} className="text-red-500 text-sm font-medium hover:underline w-full text-left">
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 p-8 relative z-0">
        <div className="glass-effect rounded-2xl p-6 min-h-full shadow-sm">
          {children}
        </div>
      </main>
    </div>
  );
}
