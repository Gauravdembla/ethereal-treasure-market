import { useState, useEffect } from 'react';
import { reviewApi, type ApiReview, type ReviewStatus } from '@/services/reviewApi';
import { Button } from '@/components/ui/button';
import { productApi } from '@/services/productApi';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Star, Edit, Trash2, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';

type Review = ApiReview;

const ReviewsManagement = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isBulkAddOpen, setIsBulkAddOpen] = useState(false);
  // Product multi-select filter with search
  const [productFilterIds, setProductFilterIds] = useState<string[]>([]);
  const [isProductFilterOpen, setIsProductFilterOpen] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  // Products for dynamic product filter
  const [products, setProducts] = useState<Array<{ id: string; name: string }>>([]);
  // Pagination for admin list (20 per page)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;
  // Bulk edit scope
  const [bulkScope, setBulkScope] = useState<'selected' | 'page' | 'filtered' | 'all'>('selected');
  const [bulkJson, setBulkJson] = useState<string>(`[
  {\n  \"product_id\": \"<product-id>\",\n  \"product_name\": \"<Product Name>\",\n  \"customer_name\": \"<Name>\",\n  \"rating\": 5,\n  \"review_text\": \"<text>\",\n  \"verified\": true,\n  \"status\": \"published\"\n  }\n]`);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [formData, setFormData] = useState<{
    product_id: string;
    product_name: string;
    customer_name: string;
    customer_email?: string;
    customer_picture?: string;
    rating: number;
    review_text: string;
    verified: boolean;
    status: ReviewStatus;
  }>({
    product_id: '',
    product_name: '',
    customer_name: '',
    customer_email: '',
    customer_picture: '',
    rating: 5,
    review_text: '',
    verified: false,
    status: 'published'
  });

  const [seeding, setSeeding] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const selectedCount = selectedIds.size;
  const allFilteredSelected = selectedCount > 0 && filteredReviews.every(r => selectedIds.has(r.id));

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAllFiltered = () => {
    setSelectedIds(new Set(filteredReviews.map(r => r.id)));
  };

  // Determine target IDs based on bulk scope
  const getTargetIds = (paged: Review[]) => {
    switch (bulkScope) {
      case 'page':
        return paged.map(r => r.id);
      case 'filtered':
        return filteredReviews.map(r => r.id);
      case 'all':
        return reviews.map(r => r.id);
      case 'selected':
      default:
        return Array.from(selectedIds);
    }
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleBulkStatus = async (status: ReviewStatus, paged: Review[]) => {
    try {
      const ids = getTargetIds(paged);
      if (ids.length === 0 && (bulkScope === 'selected' || bulkScope === 'page')) return;
      if (bulkScope === 'filtered' || bulkScope === 'all') {
        await reviewApi.bulkUpdateByFilter({ productIds: productFilterIds, status: statusFilter !== 'all' ? statusFilter as any : undefined, rating: ratingFilter !== 'all' ? parseInt(ratingFilter) : undefined, search: searchTerm || undefined }, { status });
      } else {
        await reviewApi.bulkUpdate(ids, { status });
      }
      setReviews(prev => prev.map(r => (bulkScope === 'selected' || bulkScope === 'page') ? (ids.includes(r.id) ? { ...r, status } : r) : productFilterIds.length > 0 ? (productFilterIds.includes(r.product_id) ? { ...r, status } : r) : { ...r, status }));
      toast.success(`Updated ${ids.length || 'all matching'} reviews to ${status}`);
      clearSelection();
    } catch (e:any) {
      toast.error(e?.message || 'Bulk status update failed');
    }
  };

  const handleBulkVerify = async (verified: boolean, paged: Review[]) => {
    try {
      const ids = getTargetIds(paged);
      if (ids.length === 0 && (bulkScope === 'selected' || bulkScope === 'page')) return;
      if (bulkScope === 'filtered' || bulkScope === 'all') {
        await reviewApi.bulkUpdateByFilter({ productIds: productFilterIds, status: statusFilter !== 'all' ? statusFilter as any : undefined, rating: ratingFilter !== 'all' ? parseInt(ratingFilter) : undefined, search: searchTerm || undefined }, { verified });
      } else {
        await reviewApi.bulkUpdate(ids, { verified });
      }
      setReviews(prev => prev.map(r => (bulkScope === 'selected' || bulkScope === 'page') ? (ids.includes(r.id) ? { ...r, verified } : r) : productFilterIds.length > 0 ? (productFilterIds.includes(r.product_id) ? { ...r, verified } : r) : { ...r, verified }));
      toast.success(`${verified ? 'Marked' : 'Unmarked'} ${ids.length || 'all matching'} as verified`);
      clearSelection();
    } catch (e:any) {
      toast.error(e?.message || 'Bulk verify failed');
    }
  };

  const handleBulkDelete = async (paged: Review[]) => {
    const ids = getTargetIds(paged);
    const isFilterScope = (bulkScope === 'filtered' || bulkScope === 'all');
    const count = isFilterScope ? filteredReviews.length : ids.length;
    if (count === 0) return;
    if (!confirm(`Delete ${count} review(s)?`)) return;
    try {
      if (isFilterScope) {
        // Fetch matching ids to delete client-side (simple approach)
        const targetIds = (bulkScope === 'filtered')
          ? filteredReviews.map(r => r.id)
          : reviews.map(r => r.id);
        await reviewApi.bulkDelete(targetIds);
        setReviews(prev => prev.filter(r => !targetIds.includes(r.id)));
      } else {
        await reviewApi.bulkDelete(ids);
        setReviews(prev => prev.filter(r => !ids.includes(r.id)));
      }
      toast.success(`Deleted ${count} review(s)`);
      clearSelection();
    } catch (e:any) {
      toast.error(e?.message || 'Bulk delete failed');
    }
  };

  // Bulk edit applying multiple fields at once
  const handleBulkEditApply = async (update: Partial<ApiReview>) => {
    try {
      const ids = getTargetIds(pagedReviews);
      const isFilterScope = (bulkScope === 'filtered' || bulkScope === 'all');
      if (Object.keys(update).length === 0) return;

      if (isFilterScope) {
        await reviewApi.bulkUpdateByFilter({
          productIds: productFilterIds,
          status: statusFilter !== 'all' ? (statusFilter as any) : undefined,
          rating: ratingFilter !== 'all' ? parseInt(ratingFilter) : undefined,
          search: searchTerm || undefined,
        }, update);
      } else {
        if (ids.length === 0) return;
        await reviewApi.bulkUpdate(ids, update);
      }

      // Optimistic update locally
      setReviews(prev => prev.map(r => {
        if (!isFilterScope) {
          return ids.includes(r.id) ? { ...r, ...update } : r;
        }
        // filtered/all scope: update those matching current filters
        const inProduct = productFilterIds.length === 0 || productFilterIds.includes(r.product_id);
        const matchStatus = statusFilter === 'all' || r.status === statusFilter;
        const matchRating = ratingFilter === 'all' || r.rating === parseInt(ratingFilter);
        const matchSearch = !searchTerm ||
          r.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.review_text.toLowerCase().includes(searchTerm.toLowerCase());
        return (inProduct && matchStatus && matchRating && matchSearch) ? { ...r, ...update } : r;
      }));

      toast.success('Bulk edit applied');
      clearSelection();
    } catch (e:any) {
      toast.error(e?.message || 'Bulk edit failed');
    }
  };

  // Inline Bulk Edit form component
  const BulkEditForm = () => {
    const [changeStatus, setChangeStatus] = useState(false);
    const [newStatus, setNewStatus] = useState<ReviewStatus>('published');
    const [changeVerified, setChangeVerified] = useState(false);
    const [newVerified, setNewVerified] = useState(true);
    const [changeRating, setChangeRating] = useState(false);
    const [newRating, setNewRating] = useState(5);
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={changeStatus} onChange={(e)=>setChangeStatus(e.target.checked)} />
          <span className="text-sm w-28">Status</span>
          <Select value={newStatus} onValueChange={(v)=>setNewStatus(v as ReviewStatus)}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={changeVerified} onChange={(e)=>setChangeVerified(e.target.checked)} />
          <span className="text-sm w-28">Verified</span>
          <Select value={String(newVerified)} onValueChange={(v)=>setNewVerified(v === 'true')}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Verified</SelectItem>
              <SelectItem value="false">Unverified</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={changeRating} onChange={(e)=>setChangeRating(e.target.checked)} />
          <span className="text-sm w-28">Rating</span>
          <Select value={String(newRating)} onValueChange={(v)=>setNewRating(parseInt(v))}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[5,4,3,2,1].map(r => (<SelectItem key={r} value={String(r)}>{r} Stars</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => handleBulkEditApply({
            ...(changeStatus ? { status: newStatus } : {}),
            ...(changeVerified ? { verified: newVerified } : {}),
            ...(changeRating ? { rating: newRating } : {}),
          })}>Apply</Button>
        </div>
      </div>
    );
  };

  const seedDummyReviews = async () => {
    try {
      setSeeding(true);
      const products = await productApi.list();
      let createdTotal = 0;
      for (const p of products) {
        const existing = await reviewApi.list({ productId: p.id, status: 'published' });
        if (existing.length > 0) continue;
        const num = 3 + (p.id.charCodeAt(0) % 2); // 3 or 4
        const names = ["Jessica T.", "Mark S.", "Sophia R.", "Emma R."];
        const texts = [
          "Absolutely love this product! The quality is amazing.",
          "Great quality and fast shipping. Very satisfied.",
          "Beautiful craftsmanship and powerful energy.",
          "Good quality, arrived well packaged.",
        ];
        for (let i = 0; i < num; i++) {
          await reviewApi.create({
            product_id: p.id,
            product_name: p.name,
            customer_name: names[(i + p.id.length) % names.length],
            rating: 4 + ((i + p.id.length) % 2),
            review_text: texts[(i + p.id.length) % texts.length],
            verified: true,
            status: 'published',
          } as any);
          createdTotal++;
        }
      }
      const all = await reviewApi.list();
      setReviews(all);
      toast.success(`Seeded ${createdTotal} reviews`);
    } catch (err:any) {
      console.error('Seeding failed', err);
      toast.error(err?.message || 'Failed to seed reviews');
    } finally {
      setSeeding(false);
    }
  };


  // Load reviews from MongoDB via API
  useEffect(() => {
    const loadReviews = async () => {
      try {
        const all = await reviewApi.list();
        setReviews(all);
      } catch (error) {
        console.error('Error loading reviews from API:', error);
      }
    };

    loadReviews();
  }, []);

  // Load products for dynamic product filter
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const prods = await productApi.list();
        setProducts(prods.map(p => ({ id: p.id, name: p.name })));
      } catch (e) {
        console.warn('Failed to load products for filter', e);
      }
    };
    loadProducts();
  }, []);

  // Reset pagination when filters/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, ratingFilter, productFilterIds.join(',')]);


  // Filter reviews based on search and filters
  useEffect(() => {
    let filtered = reviews;

    if (searchTerm) {
      filtered = filtered.filter(review =>
        review.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.review_text.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(review => review.status === statusFilter);
    }

    if (ratingFilter !== 'all') {
      filtered = filtered.filter(review => review.rating === parseInt(ratingFilter));
    }

    // Product filter (multi-select). If none selected, include all.
    if (productFilterIds.length > 0) {
      const setIds = new Set(productFilterIds);
      filtered = filtered.filter(review => setIds.has(review.product_id));
    }

    setFilteredReviews(filtered);
  }, [reviews, searchTerm, statusFilter, ratingFilter, productFilterIds.join(',')]);

  // Current page slice
  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const pagedReviews = filteredReviews.slice(startIndex, startIndex + pageSize);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingReview) {
        await reviewApi.update(editingReview.id, { ...formData });
        toast.success('Review updated successfully');
        setEditingReview(null);
      } else {
        await reviewApi.create({ ...formData });
        toast.success('Review added successfully');
      }
      // Refresh list
      const all = await reviewApi.list();
      setReviews(all);
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error:any) {
      console.error('Failed saving review', error);
      toast.error(error?.message || 'Failed to save review');
    }
  };

  const handleEdit = (review: Review) => {
    setEditingReview(review);
    setFormData({
      product_id: review.product_id,
      product_name: review.product_name,
      customer_name: review.customer_name,
      customer_email: (review as any).customer_email || '',
      customer_picture: review.customer_picture || '',
      rating: review.rating,
      review_text: review.review_text,
      verified: review.verified,
      status: review.status as ReviewStatus,
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (reviewId: string) => {
    if (confirm('Are you sure you want to delete this review?')) {
      try {
        await reviewApi.remove(reviewId);
        const updatedReviews = reviews.filter(review => review.id !== reviewId);
        setReviews(updatedReviews);
        toast.success('Review deleted successfully');
      } catch (error:any) {
        console.error('Failed deleting review', error);
        toast.error(error?.message || 'Failed to delete review');
      }
    }
  };

  const handleStatusChange = async (reviewId: string, newStatus: ReviewStatus) => {
    try {
      await reviewApi.update(reviewId, { status: newStatus });
      const updatedReviews = reviews.map(review =>
        review.id === reviewId ? { ...review, status: newStatus } : review
      );
      setReviews(updatedReviews);
      toast.success(`Review ${newStatus} successfully`);
    } catch (error:any) {
      console.error('Failed updating status', error);
      toast.error(error?.message || 'Failed to update status');
    }
  };

  const resetForm = () => {
    setFormData({
      product_id: '',
      product_name: '',
      customer_name: '',
      customer_picture: '',
      rating: 5,
      review_text: '',
      verified: false,
      status: 'published'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reviews Management</h2>
          <p className="text-gray-600">Manage customer reviews and ratings</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={seedDummyReviews} disabled={seeding}>
            {seeding ? 'Seeding...' : 'Seed 3-4 Reviews / Product'}
          </Button>
          <Dialog open={isBulkAddOpen} onOpenChange={setIsBulkAddOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Bulk Add (JSON)</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Bulk Add Reviews (JSON array)</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <Textarea rows={10} value={bulkJson} onChange={(e)=>setBulkJson(e.target.value)} />
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={()=>setIsBulkAddOpen(false)}>Cancel</Button>
                  <Button onClick={async ()=>{
                    try {
                      const items = JSON.parse(bulkJson);
                      if (!Array.isArray(items) || items.length === 0) throw new Error('Provide a non-empty JSON array');
                      await reviewApi.bulkCreate(items);
                      const all = await reviewApi.list();
                      setReviews(all);
                      toast.success(`Created ${items.length} review(s)`);
                      setIsBulkAddOpen(false);
                    } catch (e:any) {
                      toast.error(e?.message || 'Bulk add failed');
                    }
                  }}>Import</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingReview(null); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Review
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingReview ? 'Edit Review' : 'Add New Review'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Product ID</label>
                <Input
                  value={formData.product_id}
                  onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                  placeholder="e.g., amethyst-cluster"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Product Name</label>
                <Input
                  value={formData.product_name}
                  onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                  placeholder="e.g., Amethyst Cluster"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Customer Name</label>
                <Input
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  placeholder="e.g., Jessica T."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Customer Email (Optional, used for uniqueness)</label>
                <Input
                  type="email"
                  value={formData.customer_email}
                  onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                  placeholder="e.g., jessica@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Customer Picture (Optional)</label>
                <Input
                  value={formData.customer_picture}
                  onChange={(e) => setFormData({ ...formData, customer_picture: e.target.value })}
                  placeholder="Enter image URL or leave empty"
                  type="url"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Provide a URL to the customer's profile picture. If empty, no picture will be shown.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Rating</label>
                <Select value={formData.rating.toString()} onValueChange={(value) => setFormData({ ...formData, rating: parseInt(value) })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(rating => (
                      <SelectItem key={rating} value={rating.toString()}>
                        <div className="flex items-center gap-1">
                          {[...Array(rating)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          ))}
                          <span className="ml-1">({rating})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Review Text</label>
                <Textarea
                  value={formData.review_text}
                  onChange={(e) => setFormData({ ...formData, review_text: e.target.value })}
                  placeholder="Enter review text..."
                  rows={3}


                  required
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.verified}
                    onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                  />
                  <span className="text-sm">Verified Purchase</span>
                </label>

                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as ReviewStatus })}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingReview ? 'Update Review' : 'Add Review'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          {(selectedCount > 0 || bulkScope !== 'selected') ? (
            <div className="flex items-center gap-2">
              {selectedCount > 0 && (
                <span className="text-sm text-gray-700">{selectedCount} selected</span>
              )}
              {/* Bulk scope */}
              <Select value={bulkScope} onValueChange={(v) => setBulkScope(v as any)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Scope" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="selected">Selected</SelectItem>
                  <SelectItem value="page">Current Page</SelectItem>
                  <SelectItem value="filtered">Filtered</SelectItem>
                  <SelectItem value="all">All Reviews</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={() => handleBulkStatus('published', pagedReviews)}>Publish</Button>
              <Button variant="outline" size="sm" onClick={() => handleBulkStatus('pending', pagedReviews)}>Mark Pending</Button>
              <Button variant="outline" size="sm" onClick={() => handleBulkStatus('rejected', pagedReviews)}>Reject</Button>
              <Button variant="outline" size="sm" onClick={() => handleBulkVerify(true, pagedReviews)}>Verify</Button>
              <Button variant="outline" size="sm" onClick={() => handleBulkVerify(false, pagedReviews)}>Unverify</Button>
              <Button variant="destructive" size="sm" onClick={() => handleBulkDelete(pagedReviews)}>Delete</Button>
            </div>
          ) : (
            <div className="h-5" />
          )}

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={allFilteredSelected}
                onChange={(e) => (e.target.checked ? selectAllFiltered() : clearSelection())}
              />
              <span>Select all ({filteredReviews.length})</span>
            </label>
            {selectedCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearSelection}>Clear selection</Button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mt-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Product Multi-select with search */}
          <Dialog open={isProductFilterOpen} onOpenChange={setIsProductFilterOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                Products: {productFilterIds.length === 0 ? 'All' : `${productFilterIds.length} selected`}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Filter by Products</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Search products..." value={productSearch} onChange={(e)=>setProductSearch(e.target.value)} />
                <div className="max-h-80 overflow-auto border rounded p-2 space-y-1">
                  {products
                    .filter(p => !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase()))
                    .map(p => {
                      const checked = productFilterIds.includes(p.id);
                      return (
                        <label key={p.id} className="flex items-center gap-2 py-1 px-2 hover:bg-muted rounded cursor-pointer">
                          <input type="checkbox" checked={checked} onChange={(e)=>{
                            setProductFilterIds(prev => e.target.checked ? [...prev, p.id] : prev.filter(id => id !== p.id));
                          }} />
                          <span>{p.name}</span>
                        </label>
                      );
                    })}
                </div>
                <div className="flex justify-between items-center">
                  <Button variant="ghost" onClick={()=>setProductFilterIds([])}>Clear</Button>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={()=>setIsProductFilterOpen(false)}>Cancel</Button>
                    <Button onClick={()=>setIsProductFilterOpen(false)}>Apply</Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Select value={ratingFilter} onValueChange={setRatingFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Ratings" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ratings</SelectItem>
              {[5, 4, 3, 2, 1].map(rating => (
                <SelectItem key={rating} value={rating.toString()}>
                  {rating} Stars
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Bulk Edit Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary">Bulk Edit</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Bulk Edit</DialogTitle>
              </DialogHeader>
              <BulkEditForm />
            </DialogContent>
          </Dialog>
        </div>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {/* Paginated reviews */}
        <>
              {pagedReviews.map((review) => (
                <Card key={review.id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="mr-3 pt-1">
                <input
                  type="checkbox"
                  checked={selectedIds.has(review.id)}
                  onChange={() => toggleSelect(review.id)}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-lg">{review.product_name}</h3>
                  <Badge className={getStatusColor(review.status)}>
                    {review.status}
                  </Badge>
                  {review.verified && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Verified
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-3 mb-2">
                  {review.customer_picture && (
                    <img
                      src={review.customer_picture}
                      alt={review.customer_name}
                      className="w-8 h-8 rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">by {review.customer_name}</span>
                    <span className="text-sm text-gray-400">
                      {new Date((review as any).created_at || (review as any).createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <p className="text-gray-700 mb-3">{review.review_text}</p>

                <div className="flex gap-2">
                  <Select value={review.status} onValueChange={(value: 'published' | 'pending' | 'rejected') => handleStatusChange(review.id, value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2 ml-4">
                <Button variant="outline" size="sm" onClick={() => handleEdit(review)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(review.id)} className="text-red-600 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {filteredReviews.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-gray-500">No reviews found matching your criteria.</p>
          </Card>
        )}

        {/* Pagination controls */}
        <div className="flex items-center justify-between py-4">
          <div className="text-sm text-gray-600">
            Showing {filteredReviews.length === 0 ? 0 : startIndex + 1}–{Math.min(filteredReviews.length, startIndex + pageSize)} of {filteredReviews.length}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(c => Math.max(1, c - 1))}>Previous</Button>
            <span className="text-sm">Page {currentPage} of {totalPages}</span>
            <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(c => Math.min(totalPages, c + 1))}>Next</Button>
          </div>
        </div>
      </>
      </div>
    </div>
  );
};

export default ReviewsManagement;
