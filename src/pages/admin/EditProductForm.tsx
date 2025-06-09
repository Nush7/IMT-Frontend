
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/components/shared/ProductCard';
import { Trash2 } from 'lucide-react';

interface EditProductFormProps {
  product: Product;
  onUpdateProduct: (product: Product) => void;
  onDelete: (productId: string) => void;
  onCancel: () => void;
}

const EditProductForm: React.FC<EditProductFormProps> = ({ 
  product, 
  onUpdateProduct, 
  onDelete, 
  onCancel 
}) => {
  const [formData, setFormData] = useState({
    name: product.name,
    type: product.type || '',
    sku: product.sku,
    image_url: product.image_url || '',
    description: product.description || '',
    quantity: product.quantity,
    price: product.price
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate form
      if (!formData.name || !formData.sku) {
        toast({
          title: "Validation Error",
          description: "Name and SKU are required fields",
          variant: "destructive",
        });
        return;
      }

      if (formData.quantity < 0 || formData.price < 0) {
        toast({
          title: "Validation Error",
          description: "Quantity and price must be positive numbers",
          variant: "destructive",
        });
        return;
      }

      const updatedProduct: Product = {
        ...product,
        name: formData.name,
        type: formData.type || undefined,
        sku: formData.sku,
        image_url: formData.image_url || undefined,
        description: formData.description || undefined,
        quantity: Number(formData.quantity),
        price: Number(formData.price)
      };

      onUpdateProduct(updatedProduct);

      toast({
        title: "Product Updated",
        description: `${formData.name} has been updated successfully`,
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    const productId = product._id || product.sku;
    if (window.confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
      onDelete(productId);
      toast({
        title: "Product Deleted",
        description: `${product.name} has been removed from inventory`,
      });
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Edit Product</CardTitle>
            <CardDescription>
              Update product details and inventory information
            </CardDescription>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Product Name *</Label>
              <Input
                id="edit-name"
                type="text"
                placeholder="Enter product name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-type">Product Type</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select product type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Electronics">Electronics</SelectItem>
                  <SelectItem value="Clothing">Clothing</SelectItem>
                  <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
                  <SelectItem value="Home & Garden">Home & Garden</SelectItem>
                  <SelectItem value="Sports & Outdoors">Sports & Outdoors</SelectItem>
                  <SelectItem value="Books">Books</SelectItem>
                  <SelectItem value="Toys & Games">Toys & Games</SelectItem>
                  <SelectItem value="Health & Beauty">Health & Beauty</SelectItem>
                  <SelectItem value="Automotive">Automotive</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-sku">SKU *</Label>
              <Input
                id="edit-sku"
                type="text"
                placeholder="Product SKU"
                value={formData.sku}
                onChange={(e) => handleInputChange('sku', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-image_url">Image URL</Label>
              <Input
                id="edit-image_url"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={formData.image_url}
                onChange={(e) => handleInputChange('image_url', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              placeholder="Enter product description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-quantity">Quantity *</Label>
              <Input
                id="edit-quantity"
                type="number"
                min="0"
                placeholder="0"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-price">Price ($) *</Label>
              <Input
                id="edit-price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.price}
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                required
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Updating..." : "Update Product"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EditProductForm;
