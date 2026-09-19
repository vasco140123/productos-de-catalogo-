"use client";

import Link from "next/link";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import toast from "react-hot-toast";

type Category = { id: string; name: string };
type Product = {
  id: string;
  name: string;
  base_price: number;
  discount_price?: number;
  is_featured: boolean;
  category_id?: string;
  product_images?: { url: string }[];
};

export default function Home() {
  const [productos, setProductos] = useState<Product[]>([]);
  const [categorias, setCategorias] = useState<Category[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  
  const { addToCart } = useCart();

  useEffect(() => {
    async function cargarDatos() {
      // 1. Cargar categorías
      const { data: catData } = await supabase.from('categories').select('*').order('name');
      if (catData) setCategorias(catData);

      // 2. Cargar todos los productos activos
      const { data: prodData } = await supabase
        .from('products')
        .select(`*, product_images ( url )`)
        .eq('is_active', true);
      
      if (prodData) setProductos(prodData);
      setCargando(false);
    }
    cargarDatos();
  }, []);

  const handleAgregarCarrito = (producto: Product) => {
    const finalPrice = producto.discount_price && producto.discount_price < producto.base_price 
      ? producto.discount_price 
      : producto.base_price;
    const imageUrl = producto.product_images?.[0]?.url;

    addToCart({
      id: producto.id,
      name: producto.name,
      price: finalPrice,
      quantity: 1,
      image_url: imageUrl
    });
    
    toast.success(`¡${producto.name} agregado al carrito!`, {
      style: { border: '1px solid #E11D48', padding: '16px', color: '#1F2937' },
      iconTheme: { primary: '#E11D48', secondary: '#FFFAEE' },
    });
  };

  // Filtrar productos para la sección general
  const productosFiltrados = categoriaSeleccionada 
    ? productos.filter(p => p.category_id === categoriaSeleccionada)
    : productos;

  // Filtrar productos para Destacados y Ofertas
  const productosDestacados = productos.filter(p => 
    p.is_featured || (p.discount_price && p.discount_price < p.base_price)
  ).slice(0, 4);

  return (
    <div className="flex flex-col items-center pb-20">
      {/* Banner Principal */}
      <section className="w-full relative overflow-hidden py-24 px-4 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full bg-gradient-to-b from-white/40 to-transparent -z-10 rounded-full blur-3xl"></div>
        <h1 className="font-serif text-5xl md:text-7xl text-primary font-bold mb-6 drop-shadow-sm">
          Belleza en Oferta
        </h1>
        <p className="text-secondary-text text-lg md:text-xl max-w-2xl mx-auto mb-8 font-medium">
          Descubre nuestra selección exclusiva de perfumes, labiales y accesorios a precios que te encantarán.
        </p>
      </section>

      {/* Menú de Categorías (Botones) */}
      <section className="w-full max-w-6xl mx-auto px-4 mb-12">
        <div className="flex flex-wrap justify-center gap-3">
          <button 
            onClick={() => setCategoriaSeleccionada(null)}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              categoriaSeleccionada === null 
                ? 'bg-primary text-white shadow-md' 
                : 'bg-white text-gray-600 border border-gray-200 hover:border-primary/50'
            }`}
          >
            Todos
          </button>
          {categorias.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setCategoriaSeleccionada(cat.id)}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                categoriaSeleccionada === cat.id 
                  ? 'bg-primary text-white shadow-md' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-primary/50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* Grilla Principal (Filtrable) */}
      <section className="w-full max-w-6xl mx-auto px-4 mb-20">
        {cargando ? (
          <p className="text-center text-gray-500">Cargando catálogo...</p>
        ) : productosFiltrados.length === 0 ? (
          <p className="text-center text-gray-500 glass-effect p-8 rounded-2xl">
            No hay productos disponibles en esta categoría.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {productosFiltrados.map((producto) => {
              const imageUrl = producto.product_images?.[0]?.url;
              const hasDiscount = producto.discount_price && producto.discount_price < producto.base_price;
              const isAgotado = producto.stock !== undefined && producto.stock <= 0;
              
              return (
                <div key={producto.id} className={`glass-effect p-4 rounded-2xl group flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${isAgotado ? 'opacity-70 grayscale-[50%]' : ''}`}>
                  <div className="bg-white/50 aspect-square rounded-xl mb-4 flex items-center justify-center overflow-hidden relative">
                    {isAgotado && (
                      <div className="absolute inset-0 bg-black/50 z-20 flex items-center justify-center backdrop-blur-sm">
                        <span className="bg-red-600 text-white font-black text-xl px-4 py-2 rounded shadow-lg transform -rotate-12 border-2 border-white">
                          AGOTADO
                        </span>
                      </div>
                    )}
                    {hasDiscount && !isAgotado && (
                      <span className="absolute top-2 left-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded-md z-10">
                        OFERTA
                      </span>
                    )}
                    {imageUrl ? (
                      <img src={imageUrl} alt={producto.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <span className="text-gray-400 text-sm">Sin foto</span>
                    )}
                  </div>
                  <h3 className="font-medium text-lg truncate mb-1">{producto.name}</h3>
                  
                  <div className="flex items-center gap-2 mb-4">
                    {hasDiscount ? (
                      <>
                        <p className="text-primary font-bold text-xl">S/. {producto.discount_price!.toFixed(2)}</p>
                        <p className="text-gray-400 line-through text-sm">S/. {producto.base_price.toFixed(2)}</p>
                      </>
                    ) : (
                      <p className="text-primary font-bold text-xl">S/. {producto.base_price.toFixed(2)}</p>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => handleAgregarCarrito(producto)}
                    disabled={isAgotado}
                    className={`mt-auto w-full border-2 border-primary text-primary py-2 rounded-xl transition-colors font-medium text-center ${isAgotado ? 'opacity-50 cursor-not-allowed border-gray-400 text-gray-500' : 'hover:bg-primary hover:text-white active:scale-95'}`}
                  >
                    {isAgotado ? 'Agotado' : 'Agregar al Carrito'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Sección Destacados y Ofertas (Solo si hay) */}
      {!cargando && productosDestacados.length > 0 && (
        <section className="w-full bg-primary/5 py-16 px-4 border-y border-primary/10">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-end mb-8">
              <h2 className="font-serif text-3xl font-bold text-gray-900">Ofertas Especiales</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {productosDestacados.map((producto) => {
                const imageUrl = producto.product_images?.[0]?.url;
                const hasDiscount = producto.discount_price && producto.discount_price < producto.base_price;
                const isAgotado = producto.stock !== undefined && producto.stock <= 0;
                
                return (
                  <div key={producto.id} className={`bg-white p-4 rounded-2xl shadow-sm border border-red-100 group flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${isAgotado ? 'opacity-70 grayscale-[50%]' : ''}`}>
                    <div className="bg-red-50 aspect-square rounded-xl mb-4 flex items-center justify-center overflow-hidden relative">
                      {isAgotado && (
                        <div className="absolute inset-0 bg-black/50 z-20 flex items-center justify-center backdrop-blur-sm">
                          <span className="bg-red-600 text-white font-black text-xl px-4 py-2 rounded shadow-lg transform -rotate-12 border-2 border-white">
                            AGOTADO
                          </span>
                        </div>
                      )}
                      {hasDiscount && !isAgotado && (
                        <span className="absolute top-2 left-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded-md z-10 shadow-sm animate-pulse">
                          🔥 OFERTA
                        </span>
                      )}
                      {imageUrl ? (
                        <img src={imageUrl} alt={producto.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      ) : (
                        <span className="text-gray-400 text-sm">Sin foto</span>
                      )}
                    </div>
                    <h3 className="font-medium text-lg truncate mb-1">{producto.name}</h3>
                    
                    <div className="flex items-center gap-2 mb-4">
                      {hasDiscount ? (
                        <>
                          <p className="text-primary font-bold text-xl">S/. {producto.discount_price!.toFixed(2)}</p>
                          <p className="text-gray-400 line-through text-sm">S/. {producto.base_price.toFixed(2)}</p>
                        </>
                      ) : (
                        <p className="text-primary font-bold text-xl">S/. {producto.base_price.toFixed(2)}</p>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => handleAgregarCarrito(producto)}
                      disabled={isAgotado}
                      className={`mt-auto w-full bg-primary text-white py-2 rounded-xl transition-colors font-medium text-center ${isAgotado ? 'opacity-50 cursor-not-allowed bg-gray-400' : 'hover:bg-primary-hover active:scale-95'}`}
                    >
                      {isAgotado ? 'Agotado' : 'Agregar al Carrito'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
