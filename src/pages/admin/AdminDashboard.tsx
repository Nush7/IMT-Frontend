
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

const AdminDashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [analytics, setAnalytics] = useState({
    totalProducts: 0,
    totalOrders: 156,
    mostOrdered: { name: 'Wireless Headphones', orders: 45 },
    leastOrdered: { name: 'Organic Green Tea', orders: 3 }
  });
  const { user, logout } = useAuth();

  useEffect(() => {
    // Mock products data matching MongoDB schema
    const mockProducts: Product[] = [
      {
        _id: '507f1f77bcf86cd799439011',
        name: 'Wireless Bluetooth Headphones',
        type: 'Electronics',
        sku: 'WBH-001',
        description: 'High-quality wireless headphones with noise cancellation',
        quantity: 25,
        price: 99.99,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-20T14:22:00Z'
      },
      {
        _id: '507f1f77bcf86cd799439012',
        name: 'Smart Water Bottle',
        type: 'Lifestyle',
        sku: 'SWB-002',
        description: 'Temperature-controlled smart water bottle with app connectivity',
        quantity: 15,
        price: 45.99,
        createdAt: '2024-01-16T09:15:00Z',
        updatedAt: '2024-01-19T11:45:00Z'
      },
      {
        _id: '507f1f77bcf86cd799439013',
        name: 'Organic Green Tea',
        type: 'Food & Beverage',
        sku: 'OGT-003',
        description: 'Premium organic green tea leaves, 100g pack',
        quantity: 0,
        price: 24.99,
        createdAt: '2024-01-10T16:20:00Z',
        updatedAt: '2024-01-18T13:30:00Z'
      },
      {
        _id: '507f1f77bcf86cd799439014',
        name: 'Laptop Stand',
        sku: 'LS-004',
        description: 'Adjustable aluminum laptop stand for better ergonomics',
        quantity: 8,
        price: 34.99,
        createdAt: '2024-01-12T12:00:00Z',
        updatedAt: '2024-01-17T15:10:00Z'
      }
    ];
    
    setProducts(mockProducts);
    setAnalytics(prev => ({ ...prev, totalProducts: mockProducts.length }));
    console.log('Admin dashboard loaded with', mockProducts.length, 'products');
  }, []);

  const handleAddProduct = (newProduct: Omit<Product, '_id' | 'createdAt' | 'updatedAt'>) => {
    const productWithId: Product = {
      ...newProduct,
      _id: new Date().getTime().toString(), // Mock MongoDB ObjectId
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setProducts(prev => [...prev, productWithId]);
    setAnalytics(prev => ({ ...prev, totalProducts: prev.totalProducts + 1 }));
    setShowAddForm(false);
    console.log('Product added:', productWithId);
  };

  const handleEditProduct = (updatedProduct: Product) => {
    const productWithTimestamp = {
      ...updatedProduct,
      updatedAt: new Date().toISOString()
    };
    
    setProducts(prev => 
      prev.map(product => {
        const productId = product._id || product.sku;
        const updatedId = updatedProduct._id || updatedProduct.sku;
        return productId === updatedId ? productWithTimestamp : product;
      })
    );
    setEditingProduct(null);
    console.log('Product updated:', productWithTimestamp);
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(product => (product._id || product.sku) !== productId));
    setAnalytics(prev => ({ ...prev, totalProducts: prev.totalProducts - 1 }));
    console.log('Product deleted:', productId);
  };

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
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="inventory">Add Product</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="products" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Product List</h2>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </div>
            
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
                    {products.filter(p => p.quantity > 0).length} in stock
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.totalOrders}</div>
                  <p className="text-xs text-muted-foreground">
                    Platform wide
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Most Ordered</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold">{analytics.mostOrdered.name}</div>
                  <p className="text-xs text-muted-foreground">
                    {analytics.mostOrdered.orders} orders
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Least Ordered</CardTitle>
                  <TrendingDown className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold">{analytics.leastOrdered.name}</div>
                  <p className="text-xs text-muted-foreground">
                    {analytics.leastOrdered.orders} orders
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Inventory Status</CardTitle>
                  <CardDescription>Current stock levels</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {products.map(product => {
                      const productId = product._id || product.sku;
                      return (
                        <div key={productId} className="flex justify-between items-center">
                          <span className="text-sm">{product.name}</span>
                          <Badge variant={product.quantity === 0 ? "destructive" : product.quantity < 10 ? "default" : "secondary"}>
                            {product.quantity} units
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                  <CardDescription>Key performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Out of Stock Items:</span>
                      <span className="font-medium">{products.filter(p => p.quantity === 0).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Low Stock Items:</span>
                      <span className="font-medium">{products.filter(p => p.quantity > 0 && p.quantity < 10).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Inventory Value:</span>
                      <span className="font-medium">
                        ${products.reduce((total, p) => total + (p.price * p.quantity), 0).toFixed(2)}
                      </span>
                    </div>
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
