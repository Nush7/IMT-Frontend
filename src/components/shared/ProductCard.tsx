import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Edit, Package } from 'lucide-react';

export interface Product {
  _id?: string; // MongoDB ID
  name: string;
  type: string; // Make required to match updated interface
  sku: string;
  image_url?: string;
  imageUrl?: string; // Add this to match the API response
  description: string; // Make required to match updated interface
  quantity: number;
  price: number;
  createdAt?: string;
  updatedAt?: string;
}

interface ProductCardProps {
  product: Product;
  variant: 'user' | 'admin';
  onAddToCart?: (product: Product) => void;
  onEdit?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, variant, onAddToCart, onEdit }) => {
  const isOutOfStock = product.quantity === 0;
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  // Function to validate and normalize image URL
  const getValidImageUrl = (url?: string) => {
    if (!url) return null;

    try {
      // Handle relative URLs or malformed URLs
      if (url.startsWith('//')) {
        return `https:${url}`;
      }

      // Check if it's a valid URL
      new URL(url);
      return url;
    } catch {
      // If URL is malformed, return null
      return null;
    }
  };

  // Get image URL from either field name
  const imageUrl = product.image_url || product.imageUrl;
  const validImageUrl = getValidImageUrl(imageUrl);

  return (
    <Card className="w-full max-w-sm hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold line-clamp-2">{product.name}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              SKU: {product.sku}
            </CardDescription>
          </div>
          {product.type && (
            <Badge variant={isOutOfStock ? "destructive" : "secondary"}>
              {product.type}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
          {validImageUrl && !imageError ? (
            <>
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <Package className="h-8 w-8 text-muted-foreground animate-pulse" />
                </div>
              )}
              <img
                src={validImageUrl}
                alt={product.name}
                className={`w-full h-full object-cover rounded-lg transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'
                  }`}
                onError={handleImageError}
                onLoad={handleImageLoad}
                loading="lazy"
                crossOrigin="anonymous"
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-muted-foreground">
              <Package className="h-12 w-12 mb-2" />
              <span className="text-xs text-center">No Image</span>
            </div>
          )}
        </div>

        {product.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {product.description}
          </p>
        )}

        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold text-primary">
            ${product.price.toFixed(2)}
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Stock: </span>
            <span className={isOutOfStock ? "text-destructive font-medium" : "text-foreground"}>
              {product.quantity}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        {variant === 'user' ? (
          <Button
            onClick={() => onAddToCart?.(product)}
            disabled={isOutOfStock}
            className="w-full"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        ) : (
          <Button
            onClick={() => onEdit?.(product)}
            variant="outline"
            className="w-full"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Product
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
