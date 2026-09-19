"use client";

import Link from 'next/link';
import { ShoppingCart, Menu } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function Navbar() {
  const { items } = useCart();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="font-serif text-2xl font-bold text-primary">
              Belleza en Oferta
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-secondary-text hover:text-primary transition-colors">Inicio</Link>
            <Link href="/catalogo" className="text-secondary-text hover:text-primary transition-colors">Catálogo</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/carrito" className="relative text-foreground hover:text-primary transition-colors p-2">
              <ShoppingCart size={24} />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-primary rounded-full">
                  {totalItems}
                </span>
              )}
            </Link>
            <button className="md:hidden p-2 text-foreground">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
