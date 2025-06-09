
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Edit, Package } from 'lucide-react';

export interface Product {
  _id?: string; // MongoDB ID
  name: string;
  type?: string;
  sku: string;
  image_url?: string;
  description?: string;
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
        <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center">
          {product.image_url ? (
            <img 
              src={product.image_url} 
              alt={product.name}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <Package className="h-12 w-12 text-muted-foreground" />
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
