"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/context/CartContext";
import toast from "react-hot-toast";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  description: string;
  base_price: number;
  discount_price?: number;
  stock?: number;
  product_images?: { url: string }[];
};

export default function CatalogoPage() {
  const [productos, setProductos] = useState<Product[]>([]);
  const [cargando, setCargando] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images (
            url
          )
        `)
        .eq('is_active', true);
      
      if (data) {
        setProductos(data);
      }
      setCargando(false);
    }

    fetchProducts();
  }, []);

  const handleAgregarCarrito = (e: React.MouseEvent, producto: Product, imageUrl?: string) => {
    e.preventDefault(); // Evitar navegación de la tarjeta
    const finalPrice = producto.discount_price && producto.discount_price < producto.base_price 
      ? producto.discount_price 
      : producto.base_price;

    addToCart({
      id: producto.id,
      name: producto.name,
      price: finalPrice,
      quantity: 1,
      image_url: imageUrl
    });
    // Notificación visual de éxito
    toast.success(`¡${producto.name} agregado al carrito!`, {
      style: {
        border: '1px solid #E11D48',
        padding: '16px',
        color: '#1F2937',
      },
      iconTheme: {
        primary: '#E11D48',
        secondary: '#FFFAEE',
      },
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-serif text-4xl text-primary font-bold mb-8">Nuestro Catálogo</h1>
      
      {cargando ? (
        <div className="text-center py-20 text-gray-500">
          <p>Cargando productos...</p>
        </div>
      ) : productos.length === 0 ? (
        <div className="text-center py-20 glass-effect rounded-3xl">
          <p className="text-gray-500 text-lg">No hay productos disponibles en este momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {productos.map(producto => {
            const imageUrl = producto.product_images?.[0]?.url;
            const isAgotado = producto.stock !== undefined && producto.stock <= 0;

            return (
              <Link 
                href={`/producto/${(producto as any).slug || producto.id}`}
                key={producto.id} 
                className={`group relative glass-effect p-4 rounded-2xl flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${isAgotado ? 'opacity-70 grayscale-[50%]' : ''}`}
              >
                {/* Contenedor de Imagen con Overlay de Descripción */}
                <div className="relative bg-white/50 aspect-square rounded-xl mb-4 text-secondary-text overflow-hidden">
                  {isAgotado && (
                    <div className="absolute inset-0 bg-black/50 z-20 flex items-center justify-center backdrop-blur-sm">
                      <span className="bg-red-600 text-white font-black text-xl px-4 py-2 rounded shadow-lg transform -rotate-12 border-2 border-white">
                        AGOTADO
                      </span>
                    </div>
                  )}

                  {imageUrl ? (
                    <img 
                      src={imageUrl} 
                      alt={producto.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span>Sin foto</span>
                    </div>
                  )}
                  
                  {/* Overlay animado para la descripción */}
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                    <p className="text-white text-sm text-center line-clamp-6">
                      {producto.description || "Sin descripción disponible."}
                    </p>
                  </div>
                </div>

                <div className="mt-auto relative z-10">
                  <h3 className="font-medium text-lg mb-1 truncate text-gray-900">{producto.name}</h3>
                  <div className="flex items-center gap-2 mb-4">
                    {producto.discount_price && producto.discount_price < producto.base_price ? (
                      <>
                        <p className="text-primary font-bold text-xl">S/. {producto.discount_price.toFixed(2)}</p>
                        <p className="text-gray-400 line-through text-sm">S/. {producto.base_price.toFixed(2)}</p>
                      </>
                    ) : (
                      <p className="text-primary font-bold text-xl">S/. {producto.base_price.toFixed(2)}</p>
                    )}
                  </div>
                  
                  <button 
                    onClick={(e) => handleAgregarCarrito(e, producto, imageUrl)}
                    disabled={isAgotado}
                    className={`w-full border-2 border-primary text-primary py-2 rounded-xl transition-colors font-medium ${isAgotado ? 'opacity-50 cursor-not-allowed border-gray-400 text-gray-500' : 'hover:bg-primary hover:text-white active:scale-95 bg-white shadow-sm'}`}
                  >
                    {isAgotado ? 'Sin Stock' : 'Agregar al Carrito'}
                  </button>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
