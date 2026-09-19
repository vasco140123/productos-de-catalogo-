"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

export default function NuevoProducto() {
  const router = useRouter();
  const [guardando, setGuardando] = useState(false);
  const [categorias, setCategorias] = useState<{id: string, name: string}[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    base_price: "",
    category_id: "",
  });
  const [archivo, setArchivo] = useState<File | null>(null);

  // Cargar categorías disponibles
  useEffect(() => {
    async function loadCategories() {
      const { data } = await supabase.from('categories').select('id, name');
      if (data) setCategorias(data);
    }
    loadCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);

    try {
      // 1. Generar un "slug" automático a partir del nombre
      const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

      // 2. Guardar el producto principal en la Base de Datos
      const { data: prodData, error: prodError } = await supabase
        .from('products')
        .insert([{
          name: formData.name,
          slug: slug,
          description: formData.description,
          base_price: parseFloat(formData.base_price),
          category_id: formData.category_id || null,
          is_active: true
        }])
        .select()
        .single();

      if (prodError) throw prodError;

      // 3. Subir la imagen (si se seleccionó una)
      if (archivo && prodData) {
        const fileExt = archivo.name.split('.').pop();
        const fileName = `${prodData.id}-${Math.random()}.${fileExt}`;
        
        // Subir a la carpeta (bucket) "product-images"
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, archivo);

        if (uploadError) {
          alert("El producto se guardó, pero la foto falló por permisos de seguridad en Supabase: " + uploadError.message);
        } else {
          // Obtener la URL pública de la imagen
          const { data: urlData } = supabase.storage
            .from('product-images')
            .getPublicUrl(fileName);
            
          // Guardar la URL en la tabla product_images
          await supabase.from('product_images').insert([{
            product_id: prodData.id,
            url: urlData.publicUrl
          }]);
        }
      }

      alert("¡Producto creado con éxito!");
      router.push("/admin/productos");
      
    } catch (error: any) {
      alert("Error al guardar: " + error.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/productos" className="text-gray-400 hover:text-gray-900">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-serif font-bold text-gray-900">Crear Nuevo Producto</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Producto</label>
          <input 
            type="text" required
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full border border-gray-300 rounded-lg p-2.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            placeholder="Ej. Perfume Floral 50ml"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Precio Normal (S/.)</label>
          <input 
            type="number" step="0.10" required
            value={formData.base_price}
            onChange={(e) => setFormData({...formData, base_price: e.target.value})}
            className="w-full border border-gray-300 rounded-lg p-2.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            placeholder="Ej. 45.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
          <select
            value={formData.category_id}
            onChange={(e) => setFormData({...formData, category_id: e.target.value})}
            className="w-full border border-gray-300 rounded-lg p-2.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          >
            <option value="">-- Seleccionar categoría (opcional) --</option>
            {categorias.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea 
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full border border-gray-300 rounded-lg p-2.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            placeholder="Describe el producto..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Imagen Principal</label>
          <input 
            type="file" 
            accept="image/*"
            onChange={(e) => setArchivo(e.target.files?.[0] || null)}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-red-50 file:text-primary hover:file:bg-red-100"
          />
          <p className="text-xs text-gray-500 mt-2">
            Nota: Asegúrate de haber creado el bucket público "product-images" en Supabase Storage.
          </p>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <button 
            type="submit" 
            disabled={guardando}
            className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-lg font-medium flex justify-center items-center gap-2 transition-colors disabled:opacity-50"
          >
            {guardando ? 'Guardando...' : <><Save size={20} /> Guardar Producto</>}
          </button>
        </div>
      </form>
    </div>
  );
}
