"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2 } from "lucide-react";

type Category = {
  id: string;
  name: string;
  slug: string;
};

export default function AdminCategorias() {
  const [categorias, setCategorias] = useState<Category[]>([]);
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  async function fetchCategorias() {
    setCargando(true);
    const { data, error } = await supabase.from('categories').select('*').order('name');
    if (data) setCategorias(data);
    setCargando(false);
  }

  useEffect(() => {
    fetchCategorias();
  }, []);

  const handleAgregar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaCategoria.trim()) return;
    
    setGuardando(true);
    const slug = nuevaCategoria.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const { error } = await supabase.from('categories').insert([{ name: nuevaCategoria, slug }]);
    
    if (error) {
      alert("Error al crear categoría: " + error.message);
    } else {
      setNuevaCategoria("");
      fetchCategorias();
    }
    setGuardando(false);
  };

  const eliminarCategoria = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar esta categoría? Los productos que la tengan se quedarán sin categoría asignada.")) return;
    
    await supabase.from('categories').delete().eq('id', id);
    fetchCategorias();
  };

  return (
    <div>
      <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">Tus Categorías</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Formulario Crear */}
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl border border-white/50 shadow-sm h-fit">
          <h2 className="text-lg font-bold mb-4 text-gray-900">Agregar Nueva</h2>
          <form onSubmit={handleAgregar} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Categoría</label>
              <input 
                type="text" required
                value={nuevaCategoria}
                onChange={(e) => setNuevaCategoria(e.target.value)}
                placeholder="Ej. Labiales, Perfumes..."
                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none bg-white focus:border-primary"
              />
            </div>
            <button 
              type="submit" disabled={guardando}
              className="w-full bg-primary hover:bg-primary-hover text-white py-2 rounded-lg font-medium flex justify-center items-center gap-2"
            >
              {guardando ? 'Guardando...' : <><Plus size={18} /> Crear Categoría</>}
            </button>
          </form>
        </div>

        {/* Lista de Categorías */}
        <div className="md:col-span-2 bg-white/80 backdrop-blur-md rounded-xl border border-white/50 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/50 text-gray-900 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-medium">Nombre</th>
                <th className="px-6 py-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cargando ? (
                <tr><td colSpan={2} className="px-6 py-8 text-center text-gray-500">Cargando...</td></tr>
              ) : categorias.length === 0 ? (
                <tr><td colSpan={2} className="px-6 py-8 text-center text-gray-500">Aún no hay categorías.</td></tr>
              ) : (
                categorias.map((cat) => (
                  <tr key={cat.id} className="hover:bg-white/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{cat.name}</td>
                    <td className="px-6 py-4 flex justify-end">
                      <button onClick={() => eliminarCategoria(cat.id)} className="text-gray-400 hover:text-red-600">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
