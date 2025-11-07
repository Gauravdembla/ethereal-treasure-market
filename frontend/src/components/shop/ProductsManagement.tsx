import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Upload, Eye, Star, Package, Video, CheckSquare, Square, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { productService, ShopProduct } from "@/services/shopService";
import { useToast } from "@/hooks/use-toast";
import ErrorBoundary from "@/components/ErrorBoundary";

const MAX_IMAGE_COUNT = 5;
const MAX_IMAGE_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_VIDEO_FILE_SIZE_BYTES = 100 * 1024 * 1024;

type ImagePreview = {
  url: string;
  name: string;
};

const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
};

// Ensure featured products surface first, then alphabetical within each group.
const sortProductsForDisplay = (items: ShopProduct[]): ShopProduct[] => {
  return [...items].sort((a, b) => {
    if (a.featured !== b.featured) {
      return a.featured ? -1 : 1;
    }

    return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
  });
};

const ProductsManagement = () => {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ShopProduct | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isBulkEditDialogOpen, setIsBulkEditDialogOpen] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([]);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [videoFileName, setVideoFileName] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const videoObjectUrlRef = useRef<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [bulkSelectScope, setBulkSelectScope] = useState<'page' | 'all'>('page');

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

  // Bulk edit form state
  const [bulkFormData, setBulkFormData] = useState<Partial<ShopProduct>>({});

  const clearVideoPreview = () => {
    if (videoObjectUrlRef.current) {
      URL.revokeObjectURL(videoObjectUrlRef.current);
      videoObjectUrlRef.current = null;
    }
    setVideoPreview(null);
    setVideoFileName(null);
    setFormData(prev => ({
      ...prev,
      video_url: undefined
    }));
  };

  const resetMediaState = (shouldClearFormMedia = true) => {
    setImagePreviews([]);
    if (shouldClearFormMedia) {
      setFormData(prev => ({
        ...prev,
        images: []
      }));
    }
    clearVideoPreview();
  };

  useEffect(() => {
    return () => {
      if (videoObjectUrlRef.current) {
        URL.revokeObjectURL(videoObjectUrlRef.current);
      }
    };
  }, []);

  // Load products on component mount
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getProducts();
      console.log('[ProductsManagement] Loaded products:', data);
      console.log('[ProductsManagement] First product images:', data[0]?.images);
      setProducts(sortProductsForDisplay(data));
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

  // Pagination calculations
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, statusFilter, itemsPerPage]);

  const handleEditProduct = (product: ShopProduct) => {
    setSelectedProduct(product);
    setFormData(product);
    setImagePreviews(
      (product.images || []).map((image, index) => ({
        url: image.url,
        name: image.alt_text || `${product.name || 'Product'} image ${index + 1}`,
      }))
    );
    if (videoObjectUrlRef.current) {
      URL.revokeObjectURL(videoObjectUrlRef.current);
      videoObjectUrlRef.current = null;
    }
    if (product.video_url) {
      setVideoPreview(product.video_url);
      setVideoFileName(product.video_url.split('/').pop() || 'Product video');
      videoObjectUrlRef.current = null;
    } else {
      clearVideoPreview();
    }
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
    resetMediaState();
    setIsAddDialogOpen(true);
  };

  const handleImagesSelected = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    const currentCount = imagePreviews.length;
    if (currentCount >= MAX_IMAGE_COUNT) {
      toast({
        title: "Limit reached",
        description: `You can upload a maximum of ${MAX_IMAGE_COUNT} images.`,
        variant: "destructive"
      });
      return;
    }

    const filesArray = Array.from(files);
    const availableSlots = MAX_IMAGE_COUNT - currentCount;
    const validFiles: File[] = [];

    filesArray.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Unsupported file",
          description: `${file.name} is not an image.`,
          variant: "destructive"
        });
        return;
      }

      if (file.size > MAX_IMAGE_FILE_SIZE_BYTES) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds the 5MB limit.`,
          variant: "destructive"
        });
        return;
      }

      validFiles.push(file);
    });

    if (validFiles.length === 0) return;

    if (validFiles.length > availableSlots) {
      toast({
        title: "Limit reached",
        description: `Only the first ${availableSlots} image${availableSlots > 1 ? 's' : ''} were added.`,
      });
    }

    const filesToProcess = validFiles.slice(0, availableSlots);

    try {
      const dataUrls = await Promise.all(filesToProcess.map(readFileAsDataURL));

      setImagePreviews(prev => {
        const updated = [
          ...prev,
          ...dataUrls.map((url, index) => ({
            url,
            name: filesToProcess[index].name || `Product image ${prev.length + index + 1}`,
          }))
        ];

        setFormData(prevData => ({
          ...prevData,
          images: updated.map((image, index) => ({
            id: prevData.images?.[index]?.id ?? `temp-image-${index + 1}`,
            product_id: prevData.images?.[index]?.product_id ?? prevData.id ?? `temp-product`,
            url: image.url,
            alt_text: prevData.images?.[index]?.alt_text ?? image.name,
            is_primary: index === 0,
            sort_order: index
          }))
        }));

        return updated;
      });
    } catch (error) {
      console.error('Error processing images:', error);
      toast({
        title: "Error",
        description: "Unable to process selected images. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleImagesInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    if (files) {
      handleImagesSelected(files);
    }
    event.target.value = '';
  };

  const handleDropImages = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const { files } = event.dataTransfer;
    if (files) {
      handleImagesSelected(files);
    }
  };

  const openImageFilePicker = () => {
    imageInputRef.current?.click();
  };

  const handleVideoSelected = async (file: File) => {
    if (!file.type.startsWith('video/')) {
      toast({
        title: "Unsupported file",
        description: "Please upload a valid video file.",
        variant: "destructive"
      });
      return;
    }

    if (file.size > MAX_VIDEO_FILE_SIZE_BYTES) {
      toast({
        title: "File too large",
        description: "Video must be smaller than 100MB.",
        variant: "destructive"
      });
      return;
    }

    try {
      const dataUrl = await readFileAsDataURL(file);
      if (videoObjectUrlRef.current) {
        URL.revokeObjectURL(videoObjectUrlRef.current);
        videoObjectUrlRef.current = null;
      }
      setVideoPreview(dataUrl);
      setVideoFileName(file.name);
      setFormData(prev => ({
        ...prev,
        video_url: dataUrl
      }));
    } catch (err) {
      console.error('Failed to process video file', err);
      toast({ title: 'Error', description: 'Failed to process video file', variant: 'destructive' });
    }
  };

  const handleVideoInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleVideoSelected(file);
    }
    event.target.value = '';
  };

  const handleDropVideo = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleVideoSelected(file);
    }
  };

  const openVideoFilePicker = () => {
    videoInputRef.current?.click();
  };

  const removeImageAt = (index: number) => {
    setImagePreviews(prev => {
      const updated = prev.filter((_, i) => i !== index);
      setFormData(prevData => ({
        ...prevData,
        images: updated.map((image, i) => ({
          id: prevData.images?.[i]?.id ?? `temp-image-${i + 1}`,
          product_id: prevData.images?.[i]?.product_id ?? prevData.id ?? `temp-product`,
          url: image.url,
          alt_text: prevData.images?.[i]?.alt_text ?? image.name,
          is_primary: i === 0,
          sort_order: i
        }))
      }));
      return updated;
    });
  };
  const applyImageOrder = (previews: ImagePreview[]) => {
    setFormData(prevData => ({
      ...prevData,
      images: previews.map((image, i) => ({
        id: prevData.images?.[i]?.id ?? `temp-image-${i + 1}`,
        product_id: prevData.images?.[i]?.product_id ?? prevData.id ?? `temp-product`,
        url: image.url,
        alt_text: prevData.images?.[i]?.alt_text ?? image.name,
        is_primary: i === 0,
        sort_order: i
      }))
    }));
  };

  const makePrimaryImage = (index: number) => {
    setImagePreviews(prev => {
      if (index <= 0) return prev;
      const newOrder = [prev[index], ...prev.filter((_, i) => i !== index)];
      applyImageOrder(newOrder);
      return newOrder;
    });
  };

  const moveImageLeft = (index: number) => {
    setImagePreviews(prev => {
      if (index <= 0) return prev;
      const newOrder = [...prev];
      [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
      applyImageOrder(newOrder);
      return newOrder;
    });
  };

  const moveImageRight = (index: number) => {
    setImagePreviews(prev => {
      if (index >= prev.length - 1) return prev;
      const newOrder = [...prev];
      [newOrder[index + 1], newOrder[index]] = [newOrder[index], newOrder[index + 1]];
      applyImageOrder(newOrder);
      return newOrder;
    });
  };


  const removeVideo = () => {
    clearVideoPreview();
  };


  const handleSaveProduct = async () => {
    try {
      if (selectedProduct) {
        // Update existing product
        console.log('[ProductsManagement] Updating product with formData:', formData);
        console.log('[ProductsManagement] Images:', formData.images);
        console.log('[ProductsManagement] Video URL:', formData.video_url);
        console.log('[ProductsManagement] Available Quantity:', formData.available_quantity);

        const updated = await productService.updateProduct(selectedProduct.id, formData);
        console.log('[ProductsManagement] Updated product received:', updated);
        console.log('[ProductsManagement] Updated images:', updated.images);
        console.log('[ProductsManagement] Updated video_url:', updated.video_url);
        console.log('[ProductsManagement] Updated available_quantity:', updated.available_quantity);

        setProducts(prev => sortProductsForDisplay(prev.map(p =>
          p.id === selectedProduct.id ? updated : p
        )));
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
        setProducts(prev => sortProductsForDisplay([...prev, newProduct]));
        toast({
          title: "Success",
          description: "Product created successfully"
        });
      }

      setIsEditDialogOpen(false);
      setIsAddDialogOpen(false);
      setSelectedProduct(null);
      resetMediaState();

      // Reload products from backend to ensure we have the latest data
      await loadProducts();
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
        setProducts(prev => sortProductsForDisplay(prev.filter(p => p.id !== productId)));
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

      setProducts(prev => sortProductsForDisplay(prev.map(p =>
        p.id === productId ? updated : p
      )));

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

  // Bulk operations
  const toggleSelectAll = () => {
    const productsToSelect = bulkSelectScope === 'page' ? paginatedProducts : filteredProducts;
    const allSelected = productsToSelect.every(p => selectedProductIds.has(p.id));

    if (allSelected) {
      // Deselect all from current scope
      const newSet = new Set(selectedProductIds);
      productsToSelect.forEach(p => newSet.delete(p.id));
      setSelectedProductIds(newSet);
    } else {
      // Select all from current scope
      const newSet = new Set(selectedProductIds);
      productsToSelect.forEach(p => newSet.add(p.id));
      setSelectedProductIds(newSet);
    }
  };

  const selectAllFiltered = () => {
    setSelectedProductIds(new Set(filteredProducts.map(p => p.id)));
    toast({
      title: "Selected",
      description: `All ${filteredProducts.length} filtered products selected`
    });
  };

  const selectCurrentPage = () => {
    setSelectedProductIds(new Set(paginatedProducts.map(p => p.id)));
    toast({
      title: "Selected",
      description: `${paginatedProducts.length} products on current page selected`
    });
  };

  const toggleSelectProduct = (productId: string) => {
    const newSet = new Set(selectedProductIds);
    if (newSet.has(productId)) {
      newSet.delete(productId);
    } else {
      newSet.add(productId);
    }
    setSelectedProductIds(newSet);
  };

  const handleBulkDelete = async () => {
    if (selectedProductIds.size === 0) return;

    if (confirm(`Are you sure you want to delete ${selectedProductIds.size} product(s)?`)) {
      try {
        const ids = Array.from(selectedProductIds);
        await productService.bulkDeleteProducts(ids);
        setProducts(prev => sortProductsForDisplay(prev.filter(p => !selectedProductIds.has(p.id))));
        setSelectedProductIds(new Set());
        toast({
          title: "Success",
          description: `${ids.length} product(s) deleted successfully`
        });
      } catch (error) {
        console.error('Error bulk deleting products:', error);
        toast({
          title: "Error",
          description: "Failed to delete products",
          variant: "destructive"
        });
      }
    }
  };

  const handleBulkEdit = () => {
    if (selectedProductIds.size === 0) return;
    setBulkFormData({});
    setIsBulkEditDialogOpen(true);
  };

  const handleBulkUpdate = async () => {
    if (selectedProductIds.size === 0) return;

    try {
      const ids = Array.from(selectedProductIds);
      await productService.bulkUpdateProducts(ids, bulkFormData);

      // Reload products to get updated data
      await loadProducts();

      setSelectedProductIds(new Set());
      setIsBulkEditDialogOpen(false);
      setBulkFormData({});

      toast({
        title: "Success",
        description: `${ids.length} product(s) updated successfully`
      });
    } catch (error) {
      console.error('Error bulk updating products:', error);
      toast({
        title: "Error",
        description: "Failed to update products",
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

  const updateSpecification = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...(prev.specifications || {}),
        [key]: value
      }
    }));
  };

  const removeSpecification = (key: string) => {
    if (!formData.specifications) return;
    const { [key]: _removed, ...rest } = formData.specifications;
    setFormData(prev => ({
      ...prev,
      specifications: rest
    }));
  };

  const addSpecification = () => {
    const key = prompt('Enter specification label (e.g. Size, Origin)');
    if (!key) return;
    updateSpecification(key, '');
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

      {/* Bulk Actions Toolbar */}
      {selectedProductIds.size > 0 && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <span className="font-medium text-blue-900">
                {selectedProductIds.size} product(s) selected
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectCurrentPage}
                >
                  Select Page ({paginatedProducts.length})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAllFiltered}
                >
                  Select All ({filteredProducts.length})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedProductIds(new Set())}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkEdit}
              >
                <Edit className="w-4 h-4 mr-2" />
                Bulk Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Selected
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Products Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={paginatedProducts.length > 0 && paginatedProducts.every(p => selectedProductIds.has(p.id))}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
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
            {paginatedProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedProductIds.has(product.id)}
                    onCheckedChange={() => toggleSelectProduct(product.id)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <img
                      src={product.images?.[0]?.url || '/placeholder.svg'}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-lg"
                      onError={(e) => {
                        console.error(`Failed to load image for ${product.name}:`, product.images?.[0]?.url);
                        console.log('Product images array:', product.images);
                        e.currentTarget.src = '/placeholder.svg';
                      }}
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

        {/* Pagination Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="items-per-page" className="text-sm">Show:</Label>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => setItemsPerPage(Number(value))}
              >
                <SelectTrigger id="items-per-page" className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <span className="text-sm text-gray-600">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} of {filteredProducts.length} products
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-10"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Add/Edit Product Dialog */}
      <Dialog open={isEditDialogOpen || isAddDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsEditDialogOpen(false);
          setIsAddDialogOpen(false);
          setSelectedProduct(null);
          resetMediaState();
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
                <div className="flex justify-between items-center mb-2">
                  <Label>Product Specifications</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addSpecification}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Specification
                  </Button>
                </div>
                <div className="space-y-2">
                  {Object.entries(formData.specifications || {}).map(([specKey, specValue]) => (
                    <div key={specKey} className="flex gap-2">
                      <Input
                        value={specKey}
                        onChange={(e) => {
                          const newKey = e.target.value;
                          setFormData(prev => {
                            const specs = { ...(prev.specifications || {}) };
                            const currentValue = specs[specKey];
                            delete specs[specKey];
                            specs[newKey] = currentValue;
                            return { ...prev, specifications: specs };
                          });
                        }}
                        placeholder="Label (e.g. Size)"
                        className="w-1/3"
                      />
                      <Input
                        value={specValue}
                        onChange={(e) => updateSpecification(specKey, e.target.value)}
                        placeholder="Value"
                        className="w-full"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeSpecification(specKey)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {(!formData.specifications || Object.keys(formData.specifications).length === 0) && (
                    <p className="text-sm text-gray-500">Add specification details like size, weight, or origin.</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label>Product Images</Label>
                  <p className="text-xs text-gray-500">Upload up to {MAX_IMAGE_COUNT} images (max 5MB each).</p>
                </div>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={openImageFilePicker}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      openImageFilePicker();
                    }
                  }}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={handleDropImages}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    {imagePreviews.length > 0 ? 'Add more images' : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, or WEBP — primary image will be the first in the list
                  </p>
                </div>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImagesInputChange}
                />
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {imagePreviews.map((preview, index) => (
                      <div key={`${preview.url}-${index}`} className="relative rounded-lg border border-gray-200 overflow-hidden group">
                        <img
                          src={preview.url}
                          alt={preview.name}
                          className="h-32 w-full object-cover"
                        />
                        <div className="absolute top-2 left-2 bg-black/60 text-xs text-white px-2 py-1 rounded-full">
                          {index === 0 ? 'Primary' : `Image ${index + 1}`}
                        </div>
                        <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button type="button" variant="secondary" size="sm" onClick={() => moveImageLeft(index)} disabled={index === 0}>◀</Button>
                          <Button type="button" variant="secondary" size="sm" onClick={() => moveImageRight(index)} disabled={index === imagePreviews.length - 1}>▶</Button>
                          {index !== 0 && (
                            <Button type="button" variant="outline" size="sm" onClick={() => makePrimaryImage(index)}>Make Primary</Button>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImageAt(index)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white text-gray-700 rounded-full p-1 shadow"
                          aria-label={`Remove ${preview.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="px-3 py-2 bg-gray-50 border-t border-gray-200">
                          <p className="text-xs font-medium truncate">{preview.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <Label>Product Video</Label>
                  <p className="text-xs text-gray-500">Optional: upload one video up to 100MB.</p>
                </div>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={openVideoFilePicker}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      openVideoFilePicker();
                    }
                  }}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={handleDropVideo}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {videoPreview ? (
                    <div className="space-y-2">
                      <video
                        src={videoPreview}
                        controls
                        className="mx-auto w-full max-w-xs rounded-md"
                      />
                      <p className="text-sm text-gray-600">Click or drop to replace the video</p>
                    </div>
                  ) : (
                    <>
                      <Video className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-500">MP4, WEBM, MOV up to 100MB</p>
                    </>
                  )}
                </div>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleVideoInputChange}
                />
                {videoPreview && (
                  <div className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Video className="w-4 h-4 text-gray-500 shrink-0" />
                      <span className="text-sm text-gray-700 truncate">{videoFileName || 'Selected video'}</span>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={removeVideo}>
                      <Trash2 className="w-4 h-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                )}
                {videoPreview && (
                  <div className="flex items-center gap-4 rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={!!formData.video_is_primary}
                        onChange={(e) => setFormData(prev => ({ ...prev, video_is_primary: e.target.checked }))}
                      />
                      Video as primary media
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <span>Video position</span>
                      <input
                        type="number"
                        min={0}
                        className="w-20 border rounded px-2 py-1 text-sm"
                        value={formData.video_sort_order ?? 0}
                        onChange={(e) => setFormData(prev => ({ ...prev, video_sort_order: Number(e.target.value || 0) }))}
                      />
                    </label>
                  </div>
                )}

              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setIsAddDialogOpen(false);
                    setSelectedProduct(null);
                    resetMediaState();
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

      {/* Bulk Edit Dialog */}
      <Dialog open={isBulkEditDialogOpen} onOpenChange={setIsBulkEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Bulk Edit {selectedProductIds.size} Product(s)
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900 mb-2">
                Currently editing {selectedProductIds.size} selected product(s)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    selectCurrentPage();
                    toast({
                      title: "Selection Updated",
                      description: `Now editing ${paginatedProducts.length} products from current page`
                    });
                  }}
                >
                  Switch to Current Page ({paginatedProducts.length})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    selectAllFiltered();
                    toast({
                      title: "Selection Updated",
                      description: `Now editing all ${filteredProducts.length} filtered products`
                    });
                  }}
                >
                  Switch to All Filtered ({filteredProducts.length})
                </Button>
              </div>
            </div>

            <p className="text-sm text-gray-600">
              Only fill in the fields you want to update. Empty fields will not be changed.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bulk-price">Price (₹)</Label>
                <Input
                  id="bulk-price"
                  type="number"
                  placeholder="Leave empty to keep current"
                  value={bulkFormData.price || ''}
                  onChange={(e) => setBulkFormData(prev => ({
                    ...prev,
                    price: e.target.value ? parseFloat(e.target.value) : undefined
                  }))}
                />
              </div>

              <div>
                <Label htmlFor="bulk-original-price">Original Price (₹)</Label>
                <Input
                  id="bulk-original-price"
                  type="number"
                  placeholder="Leave empty to keep current"
                  value={bulkFormData.original_price || ''}
                  onChange={(e) => setBulkFormData(prev => ({
                    ...prev,
                    original_price: e.target.value ? parseFloat(e.target.value) : undefined
                  }))}
                />
              </div>

              <div>
                <Label htmlFor="bulk-category">Category</Label>
                <Select
                  value={bulkFormData.category || 'none'}
                  onValueChange={(value) => setBulkFormData(prev => ({
                    ...prev,
                    category: value === 'none' ? undefined : value
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Keep current" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Keep current</SelectItem>
                    {categories.filter(c => c.value !== 'all').map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="bulk-quantity">Available Quantity</Label>
                <Input
                  id="bulk-quantity"
                  type="number"
                  placeholder="Leave empty to keep current"
                  value={bulkFormData.available_quantity || ''}
                  onChange={(e) => setBulkFormData(prev => ({
                    ...prev,
                    available_quantity: e.target.value ? parseInt(e.target.value) : undefined
                  }))}
                />
              </div>

              <div>
                <Label htmlFor="bulk-status">Status</Label>
                <Select
                  value={bulkFormData.status || 'none'}
                  onValueChange={(value) => setBulkFormData(prev => ({
                    ...prev,
                    status: value === 'none' ? undefined : value as 'draft' | 'published' | 'archived'
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Keep current" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Keep current</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="bulk-rating">Rating</Label>
                <Input
                  id="bulk-rating"
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  placeholder="Leave empty to keep current"
                  value={bulkFormData.rating || ''}
                  onChange={(e) => setBulkFormData(prev => ({
                    ...prev,
                    rating: e.target.value ? parseFloat(e.target.value) : undefined
                  }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Toggle Options</Label>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="bulk-in-stock"
                    checked={bulkFormData.in_stock === true}
                    onCheckedChange={(checked) => setBulkFormData(prev => ({
                      ...prev,
                      in_stock: checked === true ? true : undefined
                    }))}
                  />
                  <Label htmlFor="bulk-in-stock" className="font-normal">Set In Stock</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="bulk-featured"
                    checked={bulkFormData.featured === true}
                    onCheckedChange={(checked) => setBulkFormData(prev => ({
                      ...prev,
                      featured: checked === true ? true : undefined
                    }))}
                  />
                  <Label htmlFor="bulk-featured" className="font-normal">Set Featured</Label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsBulkEditDialogOpen(false);
                  setBulkFormData({});
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleBulkUpdate}>
                Update {selectedProductIds.size} Product(s)
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </ErrorBoundary>
  );
};

export default ProductsManagement;
