
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, LogOut, Package, TrendingUp } from 'lucide-react';
import ProductCard, { Product } from '@/components/shared/ProductCard';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/components/shared/CartProvider';
import { useToast } from '@/hooks/use-toast';

const UserDashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const { user, logout } = useAuth();
  const { cartItems, addToCart, getTotalItems, getTotalPrice, clearCart } = useCart();
  const { toast } = useToast();

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
    setTotalOrders(156); // Mock total orders
    console.log('Products loaded:', mockProducts.length);
  }, []);

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart`,
    });
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Cart Empty",
        description: "Please add items to cart before checkout",
        variant: "destructive",
      });
      return;
    }

    // Simulate checkout process
    toast({
      title: "Checkout Successful",
      description: `Order placed for ${getTotalItems()} items totaling $${getTotalPrice().toFixed(2)}`,
    });
    
    // Update product quantities (mock backend update)
    setProducts(prev => 
      prev.map(product => {
        const productId = product._id || product.sku;
        const cartItem = cartItems.find(item => (item._id || item.sku) === productId);
        if (cartItem) {
          return { ...product, quantity: Math.max(0, product.quantity - cartItem.cartQuantity) };
        }
        return product;
      })
    );
    
    setTotalOrders(prev => prev + 1);
    clearCart();
    console.log('Checkout completed, inventory updated');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Product Catalog</h1>
              <p className="text-muted-foreground">Welcome back, {user?.username}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                <span className="font-medium">{getTotalItems()} items</span>
                <Badge variant="secondary">${getTotalPrice().toFixed(2)}</Badge>
              </div>
              <Button onClick={logout} variant="outline">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
              <p className="text-xs text-muted-foreground">
                {products.filter(p => p.quantity > 0).length} in stock
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cart Total</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${getTotalPrice().toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {getTotalItems()} items in cart
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                Platform wide orders
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Cart Section */}
        {cartItems.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Shopping Cart</CardTitle>
              <CardDescription>Review your items before checkout</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                {cartItems.map(item => {
                  const itemId = item._id || item.sku;
                  return (
                    <div key={itemId} className="flex justify-between items-center p-2 border rounded">
                      <span>{item.name}</span>
                      <span>{item.cartQuantity} × ${item.price.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-lg font-semibold">Total: ${getTotalPrice().toFixed(2)}</span>
                <Button onClick={handleCheckout}>
                  Checkout ({getTotalItems()} items)
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Products Grid */}
        <div>
          <h2 className="text-xl font-semibold mb-6">Available Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => {
              const productId = product._id || product.sku;
              return (
                <ProductCard
                  key={productId}
                  product={product}
                  variant="user"
                  onAddToCart={handleAddToCart}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
