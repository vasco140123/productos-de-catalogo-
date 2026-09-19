"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2 } from "lucide-react";

export default function EditarProducto({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [categorias, setCategorias] = useState<{id: string, name: string}[]>([]);
  const [imagenesExistentes, setImagenesExistentes] = useState<{id: string, url: string}[]>([]);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    features: "",
    base_price: "",
    discount_price: "",
    stock: "10",
    is_active: true,
    category_id: ""
  });
  
  const [nuevosArchivos, setNuevosArchivos] = useState<FileList | null>(null);

  useEffect(() => {
    async function loadData() {
      // Cargar categorías
      const { data: catData } = await supabase.from('categories').select('id, name');
      if (catData) setCategorias(catData);

      // Cargar producto e imágenes
      const { data, error } = await supabase
        .from('products')
        .select(`*, product_images(id, url)`)
        .eq('id', params.id)
        .single();
      
      if (data) {
        setFormData({
          name: data.name,
          description: data.description || "",
          features: data.features || "",
          base_price: data.base_price.toString(),
          discount_price: data.discount_price ? data.discount_price.toString() : "",
          stock: data.stock ? data.stock.toString() : "0",
          is_active: data.is_active,
          category_id: data.category_id || ""
        });
        if (data.product_images) {
           setImagenesExistentes(data.product_images);
        }
      }
      setCargando(false);
    }
    loadData();
  }, [params.id]);

  const eliminarImagen = async (imageId: string) => {
    if(!confirm("¿Seguro que deseas eliminar esta imagen?")) return;
    await supabase.from('product_images').delete().eq('id', imageId);
    setImagenesExistentes(imagenesExistentes.filter(i => i.id !== imageId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);

    try {
      const updates = {
        name: formData.name,
        description: formData.description,
        features: formData.features,
        base_price: parseFloat(formData.base_price),
        discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
        stock: parseInt(formData.stock),
        is_active: formData.is_active,
        category_id: formData.category_id || null
      };

      const { error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', params.id);

      if (error) throw error;

      // Subir nuevas imágenes si hay
      if (nuevosArchivos && nuevosArchivos.length > 0) {
        const uploads = Array.from(nuevosArchivos).map(async (archivo, index) => {
          const fileExt = archivo.name.split('.').pop();
          const fileName = `${params.id}-new-${index}-${Math.random()}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(fileName, archivo);

          if (!uploadError) {
            const { data: urlData } = supabase.storage
              .from('product-images')
              .getPublicUrl(fileName);
              
            await supabase.from('product_images').insert([{
              product_id: params.id,
              url: urlData.publicUrl,
              position: imagenesExistentes.length + index
            }]);
          }
        });
        await Promise.all(uploads);
      }

      alert("¡Producto actualizado!");
      router.push("/admin/productos");
    } catch (error: any) {
      alert("Error al actualizar: " + error.message);
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) return <div className="p-8 text-center text-gray-500">Cargando datos del producto...</div>;

  return (
    <div className="max-w-3xl mx-auto bg-white/80 backdrop-blur-md p-8 rounded-xl border border-white/50 shadow-sm my-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/productos" className="text-gray-400 hover:text-gray-900">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-serif font-bold text-gray-900">Editar Producto</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
          <input 
            type="text" required
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full border border-gray-300 rounded-lg p-2.5 outline-none bg-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio Normal (S/.)</label>
            <input 
              type="number" step="0.10" required
              value={formData.base_price}
              onChange={(e) => setFormData({...formData, base_price: e.target.value})}
              className="w-full border border-gray-300 rounded-lg p-2.5 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-red-600 mb-1">Precio Oferta (S/.) (Opcional)</label>
            <input 
              type="number" step="0.10"
              value={formData.discount_price}
              onChange={(e) => setFormData({...formData, discount_price: e.target.value})}
              className="w-full border border-red-200 rounded-lg p-2.5 bg-red-50 focus:ring-red-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock Disponible</label>
            <input 
              type="number" required
              value={formData.stock}
              onChange={(e) => setFormData({...formData, stock: e.target.value})}
              className="w-full border border-gray-300 rounded-lg p-2.5 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({...formData, category_id: e.target.value})}
              className="w-full border border-gray-300 rounded-lg p-2.5 bg-white"
            >
              <option value="">-- Seleccionar categoría --</option>
              {categorias.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción Breve</label>
          <textarea 
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full border border-gray-300 rounded-lg p-2.5 bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cosas que tienes que saber (Tamaño, ingredientes, detalles extra)</label>
          <textarea 
            rows={4}
            value={formData.features}
            onChange={(e) => setFormData({...formData, features: e.target.value})}
            className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50"
            placeholder="Ej. - Contiene 50ml&#10;- Larga duración"
          />
        </div>

        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
          <label className="block text-sm font-bold text-gray-800 mb-3">Imágenes del Producto</label>
          
          {/* Imágenes Actuales */}
          {imagenesExistentes.length > 0 && (
            <div className="flex gap-4 mb-4 overflow-x-auto pb-2">
              {imagenesExistentes.map(img => (
                <div key={img.id} className="relative w-24 h-24 flex-shrink-0 rounded-md border border-gray-200 bg-white overflow-hidden group">
                  <img src={img.url} alt="Prod" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => eliminarImagen(img.id)} className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Agregar más */}
          <label className="block text-sm font-medium text-gray-700 mb-1">Añadir más imágenes (Opcional)</label>
          <input 
            type="file" 
            accept="image/*"
            multiple
            onChange={(e) => setNuevosArchivos(e.target.files)}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-red-50 file:text-primary hover:file:bg-red-100"
          />
          {nuevosArchivos && <p className="text-sm mt-2 text-green-600">{nuevosArchivos.length} archivo(s) nuevo(s) seleccionado(s)</p>}
        </div>

        <div className="flex items-center">
          <label className="flex items-center cursor-pointer gap-2">
            <input 
              type="checkbox" 
              checked={formData.is_active}
              onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
              className="w-5 h-5 text-primary rounded focus:ring-primary"
            />
            <span className="text-sm font-medium text-gray-700">Producto Activo (Visible)</span>
          </label>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <button 
            type="submit" 
            disabled={guardando}
            className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-lg font-medium flex justify-center items-center gap-2"
          >
            {guardando ? 'Guardando...' : <><Save size={20} /> Actualizar Producto</>}
          </button>
        </div>
      </form>
    </div>
  );
}
