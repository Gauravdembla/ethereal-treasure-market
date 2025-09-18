import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Star, Edit, Trash2, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';

interface Review {
  id: string;
  product_id: string;
  product_name: string;
  customer_name: string;
  customer_picture?: string;
  rating: number;
  review_text: string;
  verified: boolean;
  status: 'published' | 'pending' | 'rejected';
  created_at: string;
}

const ReviewsManagement = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [productFilter, setProductFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [formData, setFormData] = useState({
    product_id: '',
    product_name: '',
    customer_name: '',
    customer_picture: '',
    rating: 5,
    review_text: '',
    verified: false,
    status: 'published' as const
  });

  // Load reviews from localStorage or initialize with default data
  useEffect(() => {
    const loadReviews = () => {
      try {
        const storedReviews = localStorage.getItem('ethereal_reviews');
        if (storedReviews) {
          const parsedReviews = JSON.parse(storedReviews);
          console.log('Loaded reviews from localStorage:', parsedReviews.length);
          setReviews(parsedReviews);
          return;
        }
      } catch (error) {
        console.error('Error loading reviews from localStorage:', error);
      }

      // Default reviews if none stored
      const defaultReviews: Review[] = [
        // Amethyst Cluster - 3 reviews
        {
          id: '1',
          product_id: 'amethyst-cluster',
          product_name: 'Amethyst Cluster',
          customer_name: 'Jessica T.',
          customer_picture: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
          rating: 5,
          review_text: 'Absolutely love this product! The quality is amazing and the spiritual energy is exactly what I was looking for.',
          verified: true,
          status: 'published',
          created_at: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          product_id: 'amethyst-cluster',
          product_name: 'Amethyst Cluster',
          customer_name: 'Sarah M.',
          customer_picture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
          rating: 5,
          review_text: 'Beautiful crystal with amazing energy. Perfect for meditation and spiritual work.',
          verified: true,
          status: 'published',
          created_at: '2024-01-12T14:20:00Z'
        },
        {
          id: '3',
          product_id: 'amethyst-cluster',
          product_name: 'Amethyst Cluster',
          customer_name: 'David L.',
          rating: 4,
          review_text: 'Good quality crystal, arrived well packaged. Very satisfied with the purchase.',
          verified: true,
          status: 'published',
          created_at: '2024-01-10T09:15:00Z'
        },
        // Angel Oracle Cards - 2 reviews
        {
          id: '4',
          product_id: 'angel-oracle-cards',
          product_name: 'Angel Oracle Cards',
          customer_name: 'Mark S.',
          rating: 5,
          review_text: 'Great quality and fast shipping. This has become an essential part of my daily spiritual practice.',
          verified: true,
          status: 'published',
          created_at: '2024-01-08T16:45:00Z'
        },
        {
          id: '5',
          product_id: 'angel-oracle-cards',
          product_name: 'Angel Oracle Cards',
          customer_name: 'Emma R.',
          rating: 4,
          review_text: 'Beautiful cards with clear messages. The guidebook is very helpful.',
          verified: true,
          status: 'published',
          created_at: '2024-01-05T11:30:00Z'
        },
        // Healing Candle - 2 reviews
        {
          id: '6',
          product_id: 'healing-candle',
          product_name: 'Healing Candle',
          customer_name: 'Lisa K.',
          rating: 5,
          review_text: 'Amazing lavender scent, burns evenly and creates such a peaceful atmosphere.',
          verified: true,
          status: 'published',
          created_at: '2024-01-03T13:20:00Z'
        },
        {
          id: '7',
          product_id: 'healing-candle',
          product_name: 'Healing Candle',
          customer_name: 'Anonymous User',
          rating: 3,
          review_text: 'Good candle but the scent was a bit too strong for my liking.',
          verified: false,
          status: 'published',
          created_at: '2024-01-01T09:15:00Z'
        }
      ];

      console.log('Initializing with default reviews:', defaultReviews.length);
      setReviews(defaultReviews);
      // Save default reviews to localStorage
      localStorage.setItem('ethereal_reviews', JSON.stringify(defaultReviews));
    };

    loadReviews();
  }, []);

  // Save reviews to localStorage
  const saveReviews = (reviewsToSave: Review[]) => {
    try {
      localStorage.setItem('ethereal_reviews', JSON.stringify(reviewsToSave));
      console.log('Reviews saved to localStorage:', reviewsToSave.length);
    } catch (error) {
      console.error('Error saving reviews to localStorage:', error);
    }
  };

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

    // Product filter
    if (productFilter !== 'all') {
      filtered = filtered.filter(review => review.product_id === productFilter);
    }

    setFilteredReviews(filtered);
  }, [reviews, searchTerm, statusFilter, ratingFilter, productFilter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let updatedReviews: Review[];

    if (editingReview) {
      // Update existing review
      updatedReviews = reviews.map(review =>
        review.id === editingReview.id
          ? { ...review, ...formData, id: editingReview.id, created_at: editingReview.created_at }
          : review
      );
      console.log('Updating review:', editingReview.id);
      toast.success('Review updated successfully');
      setEditingReview(null);
    } else {
      // Add new review
      const newReview: Review = {
        ...formData,
        id: Date.now().toString(),
        created_at: new Date().toISOString()
      };
      updatedReviews = [newReview, ...reviews];
      console.log('Adding new review:', newReview.id);
      toast.success('Review added successfully');
    }

    // Update state and save to localStorage
    setReviews(updatedReviews);
    saveReviews(updatedReviews);

    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEdit = (review: Review) => {
    setEditingReview(review);
    setFormData({
      product_id: review.product_id,
      product_name: review.product_name,
      customer_name: review.customer_name,
      customer_picture: review.customer_picture || '',
      rating: review.rating,
      review_text: review.review_text,
      verified: review.verified,
      status: review.status
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = (reviewId: string) => {
    if (confirm('Are you sure you want to delete this review?')) {
      const updatedReviews = reviews.filter(review => review.id !== reviewId);
      console.log('Deleting review:', reviewId);
      setReviews(updatedReviews);
      saveReviews(updatedReviews);
      toast.success('Review deleted successfully');
    }
  };

  const handleStatusChange = (reviewId: string, newStatus: 'published' | 'pending' | 'rejected') => {
    const updatedReviews = reviews.map(review =>
      review.id === reviewId ? { ...review, status: newStatus } : review
    );
    console.log('Changing review status:', reviewId, 'to', newStatus);
    setReviews(updatedReviews);
    saveReviews(updatedReviews);
    toast.success(`Review ${newStatus} successfully`);
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
                  <Select value={formData.status} onValueChange={(value: 'published' | 'pending' | 'rejected') => setFormData({ ...formData, status: value })}>
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
        <div className="flex flex-wrap gap-4">
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
          
          <Select value={productFilter} onValueChange={setProductFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Products" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              <SelectItem value="amethyst-cluster">Amethyst Cluster</SelectItem>
              <SelectItem value="angel-oracle-cards">Angel Oracle Cards</SelectItem>
              <SelectItem value="healing-candle">Healing Candle</SelectItem>
              <SelectItem value="spiritual-journal">Spiritual Journal</SelectItem>
              <SelectItem value="rose-quartz-heart">Rose Quartz Heart</SelectItem>
              <SelectItem value="chakra-stone-set">Chakra Stone Set</SelectItem>
            </SelectContent>
          </Select>

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
        </div>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <Card key={review.id} className="p-6">
            <div className="flex justify-between items-start mb-4">
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
                      {new Date(review.created_at).toLocaleDateString()}
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
      </div>
    </div>
  );
};

export default ReviewsManagement;
