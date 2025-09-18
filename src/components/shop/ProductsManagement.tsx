import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Upload, Eye, Star, Package } from "lucide-react";
import { productService, ShopProduct } from "@/services/shopService";
import { useToast } from "@/hooks/use-toast";
import ErrorBoundary from "@/components/ErrorBoundary";

const ProductsManagement = () => {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ShopProduct | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Form state for product editing/adding
  const [formData, setFormData] = useState<Partial<ShopProduct>>({
    name: '',
    description: '',
    detailed_description: '',
    price: 0,
    original_price: 0,
    category: 'crystals',
    in_stock: true,
    featured: false,
    benefits: [''],
    specifications: {},
    rating: 5,
    available_quantity: 0,
    status: 'published',
    seo_keywords: []
  });

  // Load products on component mount
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getProducts();
      setProducts(data);
      toast({
        title: "Success",
        description: `Loaded ${data.length} products from database`
      });
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'crystals', label: 'Crystals' },
    { value: 'oracle-cards', label: 'Oracle Cards' },
    { value: 'candles', label: 'Candles' },
    { value: 'journals', label: 'Journals' },
    { value: 'crystal-sets', label: 'Crystal Sets' }
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' ||
                         (statusFilter === 'in-stock' && product.in_stock) ||
                         (statusFilter === 'out-of-stock' && !product.in_stock) ||
                         (statusFilter === 'featured' && product.featured);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleEditProduct = (product: ShopProduct) => {
    setSelectedProduct(product);
    setFormData(product);
    setIsEditDialogOpen(true);
  };

  const handleAddProduct = () => {
    setFormData({
      name: '',
      description: '',
      detailed_description: '',
      price: 0,
      original_price: 0,
      category: 'crystals',
      in_stock: true,
      featured: false,
      benefits: [''],
      specifications: {},
      rating: 5,
      available_quantity: 0,
      status: 'published',
      seo_keywords: []
    });
    setIsAddDialogOpen(true);
  };

  const handleSaveProduct = async () => {
    try {
      if (selectedProduct) {
        // Update existing product
        const updated = await productService.updateProduct(selectedProduct.id, formData);
        setProducts(prev => prev.map(p =>
          p.id === selectedProduct.id ? updated : p
        ));
        toast({
          title: "Success",
          description: "Product updated successfully"
        });
      } else {
        // Add new product
        const newProduct = await productService.createProduct({
          ...formData as Omit<ShopProduct, 'id' | 'created_at' | 'updated_at'>,
          sku: `SKU${Date.now()}`
        });
        setProducts(prev => [...prev, newProduct]);
        toast({
          title: "Success",
          description: "Product created successfully"
        });
      }

      setIsEditDialogOpen(false);
      setIsAddDialogOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: "Failed to save product",
        variant: "destructive"
      });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.deleteProduct(productId);
        setProducts(prev => prev.filter(p => p.id !== productId));
        toast({
          title: "Success",
          description: "Product deleted successfully"
        });
      } catch (error) {
        console.error('Error deleting product:', error);
        toast({
          title: "Error",
          description: "Failed to delete product",
          variant: "destructive"
        });
      }
    }
  };

  const toggleProductStatus = async (productId: string, field: 'in_stock' | 'featured') => {
    try {
      const product = products.find(p => p.id === productId);
      if (!product) {
        console.error('Product not found:', productId);
        toast({
          title: "Error",
          description: "Product not found",
          variant: "destructive"
        });
        return;
      }

      console.log(`Toggling ${field} for product ${productId} from ${product[field]} to ${!product[field]}`);

      const updated = await productService.toggleProductStatus(productId, field, !product[field]);

      setProducts(prev => prev.map(p =>
        p.id === productId ? updated : p
      ));

      toast({
        title: "Success",
        description: `Product ${field.replace('_', ' ')} updated successfully`
      });
    } catch (error) {
      console.error('Error updating product status:', error);
      toast({
        title: "Error",
        description: `Failed to update product ${field.replace('_', ' ')}: ${error.message || 'Unknown error'}`,
        variant: "destructive"
      });
    }
  };

  const addBenefit = () => {
    setFormData(prev => ({
      ...prev,
      benefits: [...(prev.benefits || []), '']
    }));
  };

  const updateBenefit = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits?.map((benefit, i) => i === index ? value : benefit) || []
    }));
  };

  const removeBenefit = (index: number) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits?.filter((_, i) => i !== index) || []
    }));
  };

  return (
    <ErrorBoundary>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Products Management</h2>
          <p className="text-gray-600">Manage your product catalog, pricing, and inventory</p>
        </div>
        <Button onClick={handleAddProduct} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="search">Search Products</Label>
            <Input
              id="search"
              placeholder="Search by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="in-stock">In Stock</SelectItem>
                <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                <SelectItem value="featured">Featured</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button variant="outline" className="w-full">
              <Package className="w-4 h-4 mr-2" />
              Export ({filteredProducts.length})
            </Button>
          </div>
        </div>
      </Card>

      {/* Products Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <img
                      src={product.images?.[0]?.url || '/placeholder.svg'}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.description?.slice(0, 50)}...</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{product.sku}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {categories.find(c => c.value === product.category)?.label || product.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">₹{product.price}</p>
                    {product.original_price && (
                      <p className="text-sm text-gray-500 line-through">₹{product.original_price}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{product.rating}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={product.in_stock}
                      onCheckedChange={() => toggleProductStatus(product.id, 'in_stock')}
                    />
                    <span className="text-sm">
                      {product.in_stock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Switch
                    checked={product.featured}
                    onCheckedChange={() => toggleProductStatus(product.id, 'featured')}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditProduct(product)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Add/Edit Product Dialog */}
      <Dialog open={isEditDialogOpen || isAddDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsEditDialogOpen(false);
          setIsAddDialogOpen(false);
          setSelectedProduct(null);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>

              <div>
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <Label htmlFor="description">Short Description</Label>
                <Input
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief product description"
                />
              </div>

              <div>
                <Label htmlFor="detailedDescription">Detailed Description</Label>
                <Textarea
                  id="detailedDescription"
                  value={formData.detailed_description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, detailed_description: e.target.value }))}
                  placeholder="Detailed product description"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price || 0}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    placeholder="1999"
                  />
                </div>
                <div>
                  <Label htmlFor="originalPrice">Original Price (₹)</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    value={formData.original_price || 0}
                    onChange={(e) => setFormData(prev => ({ ...prev, original_price: parseFloat(e.target.value) || 0 }))}
                    placeholder="2499"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category || 'crystals'}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(c => c.value !== 'all').map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="inStock"
                    checked={formData.in_stock || false}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, in_stock: checked }))}
                  />
                  <Label htmlFor="inStock">In Stock</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={formData.featured || false}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
                  />
                  <Label htmlFor="featured">Featured</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="availableQuantity">Available Quantity</Label>
                <Input
                  id="availableQuantity"
                  type="number"
                  value={formData.available_quantity || 0}
                  onChange={(e) => setFormData(prev => ({ ...prev, available_quantity: parseInt(e.target.value) || 0 }))}
                  placeholder="100"
                />
              </div>

              <div>
                <Label htmlFor="rating">Rating</Label>
                <Select
                  value={formData.rating?.toString() || '5'}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, rating: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(rating => (
                      <SelectItem key={rating} value={rating.toString()}>
                        {rating} Star{rating !== 1 ? 's' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Benefits and Specifications */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Benefits & Specifications</h3>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Product Benefits</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addBenefit}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Benefit
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.benefits?.map((benefit, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={benefit}
                        onChange={(e) => updateBenefit(index, e.target.value)}
                        placeholder="Enter benefit"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeBenefit(index)}
                        disabled={formData.benefits?.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Product Image</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setIsAddDialogOpen(false);
                    setSelectedProduct(null);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveProduct}>
                  {selectedProduct ? 'Update Product' : 'Add Product'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </ErrorBoundary>
  );
};

export default ProductsManagement;
