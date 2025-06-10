import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ShoppingCart, LogOut, Package, TrendingUp, Plus, Minus, Trash2 } from 'lucide-react';
import ProductCard, { Product } from '@/components/shared/ProductCard';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/components/shared/CartProvider';
import { useToast } from '@/hooks/use-toast';
import { useGetProducts, useCheckout } from '@/hooks/product';

const UserDashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalOrders, setTotalOrders] = useState(0);
  const { user, logout } = useAuth();
  const { cartItems, addToCart, getTotalItems, getTotalPrice, clearCart, updateCartQuantity, removeFromCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const fetchedProducts = await useGetProducts(1, 20);
        // Products are already mapped in the hook
        setProducts(fetchedProducts);
        console.log('Products loaded from API:', fetchedProducts.length);
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

    fetchProducts();
  }, [toast]);

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart`,
    });
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast({
        title: "Cart Empty",
        description: "Please add items to cart before checkout",
        variant: "destructive",
      });
      return;
    }

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

      // Process each item in cart
      for (const cartItem of cartItems) {
        const productId = cartItem._id || cartItem.sku;
        await useCheckout(productId, cartItem.cartQuantity, token);
      }

      toast({
        title: "Checkout Successful",
        description: `Order placed for ${getTotalItems()} items totaling $${getTotalPrice().toFixed(2)}`,
      });

      // Refresh products to get updated quantities
      const updatedProducts = await useGetProducts(1, 20);
      setProducts(updatedProducts);

      setTotalOrders(prev => prev + 1);
      clearCart();
      console.log('Checkout completed, inventory updated');
    } catch (error: any) {
      console.error('Checkout failed:', error);
      toast({
        title: "Checkout Failed",
        description: error.message || "Failed to process checkout. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }

    // Find the product to check max quantity
    const product = products.find(p => (p._id || p.sku) === productId);
    if (product && newQuantity > product.quantity) {
      toast({
        title: "Quantity Exceeded",
        description: `Only ${product.quantity} items available in stock`,
        variant: "destructive",
      });
      return;
    }

    updateCartQuantity(productId, newQuantity);
  };

  const handleQuantityInputChange = (productId: string, value: string) => {
    const newQuantity = parseInt(value) || 0;
    handleQuantityChange(productId, newQuantity);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <p className="text-lg text-muted-foreground">Loading products...</p>
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
        {/* Cart Section */}
        {cartItems.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Shopping Cart</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearCart}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear Cart
                </Button>
              </CardTitle>
              <CardDescription>Review your items before checkout</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4">
                {cartItems.map(item => {
                  const itemId = item._id || item.sku;
                  return (
                    <div key={itemId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          ${item.price.toFixed(2)} each • Stock: {item.quantity}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(itemId, item.cartQuantity - 1)}
                            disabled={item.cartQuantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>

                          <Input
                            type="number"
                            value={item.cartQuantity}
                            onChange={(e) => handleQuantityInputChange(itemId, e.target.value)}
                            className="w-16 text-center"
                            min="1"
                            max={item.quantity}
                          />

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(itemId, item.cartQuantity + 1)}
                            disabled={item.cartQuantity >= item.quantity}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Total for this item */}
                        <div className="text-right min-w-20">
                          <div className="font-medium">
                            ${(item.price * item.cartQuantity).toFixed(2)}
                          </div>
                        </div>

                        {/* Remove button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(itemId)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-lg font-semibold">
                  Total: ${getTotalPrice().toFixed(2)} ({getTotalItems()} items)
                </span>
                <Button onClick={handleCheckout} size="lg">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Checkout
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Products Grid */}
        <div>
          <h2 className="text-xl font-semibold mb-6">Available Products ({products.length})</h2>
          {products.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg text-muted-foreground">No products available</p>
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
                    variant="user"
                    onAddToCart={handleAddToCart}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
