import React, { useState, useEffect } from 'react';
import { Product } from '../../types';
import { getProductById } from '../../lib/api';
import { ProductForm } from './ProductForm';
import { Button } from '../ui/Button';
import { useNavigation } from '../../context/NavigationContext';

export function ProductEditView({ productId }: { productId: string }) {
  const { navigate } = useNavigation();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const p = await getProductById(productId);
        setProduct(p);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [productId]);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/3" />
        <div className="h-64 bg-slate-200 rounded-xl" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
        <h2 className="text-base font-semibold text-slate-900">Product Not Found</h2>
        <Button size="sm" variant="outline" className="mt-4" onClick={() => navigate('/products')}>
          Back to Products
        </Button>
      </div>
    );
  }

  return <ProductForm initialProduct={product} isEdit={true} />;
}
