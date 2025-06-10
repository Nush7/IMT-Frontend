import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, LogOut, Package, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import ProductCard, { Product } from '@/components/shared/ProductCard';
import { useAuth } from '@/contexts/AuthContext';
import AddProductForm from './AddProductForm';
import EditProductForm from './EditProductForm';
import { useToast } from '@/hooks/use-toast';
import { useGetProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/product';

const AdminDashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalProducts: 0,
    totalOrders: 0,
    inStock: 0,
    outOfStock: 0,
    lowStock: 0
  });
  const { user, logout } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const fetchedProducts = await useGetProducts(1, 50); // Get more products for admin
      // Products are already mapped in the hook
      setProducts(fetchedProducts);

      // Calculate analytics
      const inStock = fetchedProducts.filter(p => p.quantity > 0).length;
      const outOfStock = fetchedProducts.filter(p => p.quantity === 0).length;
      const lowStock = fetchedProducts.filter(p => p.quantity > 0 && p.quantity < 10).length;

      setAnalytics({
        totalProducts: fetchedProducts.length,
        totalOrders: 0, // This would come from a separate orders API
        inStock,
        outOfStock,
        lowStock
      });

      console.log('Admin dashboard loaded with', fetchedProducts.length, 'products');
    } catch (error: any) {
      console.error('Failed to fetch products:', error);
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = async (newProduct: Omit<Product, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in again",
          variant: "destructive",
        });
        return;
      }

      // Validate required fields
      if (!newProduct.name || !newProduct.type || !newProduct.sku || !newProduct.description) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields (Name, Type, SKU, Description)",
          variant: "destructive",
        });
        return;
      }

      const productData = {
        name: newProduct.name,
        type: newProduct.type,
        sku: newProduct.sku,
        image_url: newProduct.image_url || '',
        description: newProduct.description,
        quantity: newProduct.quantity,
        price: newProduct.price
      };

      const createdProduct = await useCreateProduct(productData, token);

      // Refresh products list
      await fetchProducts();

      setShowAddForm(false);
      toast({
        title: "Product Created",
        description: `${createdProduct.name} has been added to inventory`,
      });
      console.log('Product added:', createdProduct);
    } catch (error: any) {
      console.error('Failed to add product:', error);
      toast({
        title: "Failed to Add Product",
        description: error.message || "Could not create product. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditProduct = async (updatedProduct: Product) => {
    try {
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in again",
          variant: "destructive",
        });
        return;
      }

      const productId = updatedProduct._id || updatedProduct.sku;
      const updateData = {
        name: updatedProduct.name,
        type: updatedProduct.type,
        sku: updatedProduct.sku,
        image_url: updatedProduct.image_url,
        description: updatedProduct.description,
        quantity: updatedProduct.quantity,
        price: updatedProduct.price
      };

      await useUpdateProduct(productId, updateData, token);

      // Refresh products list
      await fetchProducts();

      setEditingProduct(null);
      toast({
        title: "Product Updated",
        description: `${updatedProduct.name} has been updated`,
      });
      console.log('Product updated:', updatedProduct);
    } catch (error: any) {
      console.error('Failed to update product:', error);
      toast({
        title: "Failed to Update Product",
        description: error.message || "Could not update product. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in again",
          variant: "destructive",
        });
        return;
      }

      const productToDelete = products.find(p => (p._id || p.sku) === productId);

      // Show confirmation dialog
      if (!window.confirm(`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`)) {
        return;
      }

      // Call the delete API
      const deletedProduct = await useDeleteProduct(productId, token);

      // Refresh products list to get updated data
      await fetchProducts();

      setEditingProduct(null);
      toast({
        title: "Product Deleted",
        description: `${deletedProduct.name} has been permanently removed from inventory`,
      });
      console.log('Product deleted:', deletedProduct);
    } catch (error: any) {
      console.error('Failed to delete product:', error);
      toast({
        title: "Failed to Delete Product",
        description: error.message || "Could not delete product. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <p className="text-lg text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">Inventory Management System</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline">Admin: {user?.username}</Badge>
              <Button onClick={logout} variant="outline">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="products">Products ({analytics.totalProducts})</TabsTrigger>
            <TabsTrigger value="inventory">Add Product</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">


            {products.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg text-muted-foreground">No products found</p>
                  <Button onClick={() => setShowAddForm(true)} className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Product
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map(product => {
                  const productId = product._id || product.sku;
                  return (
                    <ProductCard
                      key={productId}
                      product={product}
                      variant="admin"
                      onEdit={setEditingProduct}
                    />
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-6">Add New Product</h2>
              <AddProductForm onAddProduct={handleAddProduct} />
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-xl font-semibold">Analytics Dashboard</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.totalProducts}</div>
                  <p className="text-xs text-muted-foreground">
                    Active in inventory
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">In Stock</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{analytics.inStock}</div>
                  <p className="text-xs text-muted-foreground">
                    Available products
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
                  <TrendingDown className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{analytics.lowStock}</div>
                  <p className="text-xs text-muted-foreground">
                    Less than 10 units
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
                  <TrendingDown className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{analytics.outOfStock}</div>
                  <p className="text-xs text-muted-foreground">
                    Need restocking
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Inventory Status</CardTitle>
                  <CardDescription>Current stock levels by product</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {products.map(product => {
                      const productId = product._id || product.sku;
                      return (
                        <div key={productId} className="flex justify-between items-center">
                          <span className="text-sm truncate flex-1 mr-2">{product.name}</span>
                          <Badge variant={product.quantity === 0 ? "destructive" : product.quantity < 10 ? "default" : "secondary"}>
                            {product.quantity} units
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>


            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <AddProductForm
              onAddProduct={handleAddProduct}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        </div>
      )}

      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <EditProductForm
              product={editingProduct}
              onUpdateProduct={handleEditProduct}
              onCancel={() => setEditingProduct(null)}
              onDelete={handleDeleteProduct}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
