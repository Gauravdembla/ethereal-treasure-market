import { useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export interface FilterOptions {
  searchQuery: string;
  category: string;
  priceRange: string;
  sortBy: string;
  inStockOnly: boolean;
}

interface SearchAndFilterProps {
  onFilterChange: (filters: FilterOptions) => void;
  totalProducts: number;
  filteredCount: number;
}

const SearchAndFilter = ({ onFilterChange, totalProducts, filteredCount }: SearchAndFilterProps) => {
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: "",
    category: "all",
    priceRange: "all",
    sortBy: "featured",
    inStockOnly: false,
  });

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "crystals", label: "Crystals" },
    { value: "oracle-cards", label: "Oracle Cards" },
    { value: "candles", label: "Candles" },
    { value: "journals", label: "Journals" },
    { value: "crystal-sets", label: "Crystal Sets" },
  ];

  const priceRanges = [
    { value: "all", label: "All Prices" },
    { value: "0-1000", label: "Under ₹1,000" },
    { value: "1000-2000", label: "₹1,000 - ₹2,000" },
    { value: "2000-3000", label: "₹2,000 - ₹3,000" },
    { value: "3000+", label: "Above ₹3,000" },
  ];

  const sortOptions = [
    { value: "featured", label: "Featured" },
    { value: "name-asc", label: "Name (A-Z)" },
    { value: "name-desc", label: "Name (Z-A)" },
    { value: "price-low", label: "Price (Low to High)" },
    { value: "price-high", label: "Price (High to Low)" },
    { value: "rating", label: "Highest Rated" },
  ];

  const updateFilters = (newFilters: Partial<FilterOptions>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters: FilterOptions = {
      searchQuery: "",
      category: "all",
      priceRange: "all",
      sortBy: "featured",
      inStockOnly: false,
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.searchQuery) count++;
    if (filters.category !== "all") count++;
    if (filters.priceRange !== "all") count++;
    if (filters.sortBy !== "featured") count++;
    if (filters.inStockOnly) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="w-full max-w-6xl mx-auto px-6 mb-6 md:mb-8">
      {/* Mobile: Search Bar + Filter Button Inline */}
      <div className="flex md:hidden gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-angelic-deep/50 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search products..."
            value={filters.searchQuery}
            onChange={(e) => updateFilters({ searchQuery: e.target.value })}
            className="pl-10 pr-4 py-2.5 text-base border-2 border-angelic-cream focus:border-primary rounded-lg bg-white/80 backdrop-blur-sm"
          />
        </div>
        <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="bg-white/80 backdrop-blur-sm relative px-3 py-2.5 flex-shrink-0">
              <Filter className="w-4 h-4" />
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs min-w-[18px] h-[18px] flex items-center justify-center">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:w-[400px]">
            <SheetHeader>
              <SheetTitle>Filter & Sort Products</SheetTitle>
              <SheetDescription>
                Refine your search to find the perfect spiritual treasures
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6 mt-6">
              {/* Category Filter */}
              <div>
                <label className="text-sm font-medium text-angelic-deep mb-2 block">
                  Category
                </label>
                <Select value={filters.category} onValueChange={(value) => updateFilters({ category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Filter */}
              <div>
                <label className="text-sm font-medium text-angelic-deep mb-2 block">
                  Sort By
                </label>
                <Select value={filters.sortBy} onValueChange={(value) => updateFilters({ sortBy: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div>
                <label className="text-sm font-medium text-angelic-deep mb-2 block">
                  Price Range
                </label>
                <Select value={filters.priceRange} onValueChange={(value) => updateFilters({ priceRange: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select price range" />
                  </SelectTrigger>
                  <SelectContent>
                    {priceRanges.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* In Stock Only */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="inStockOnly"
                  checked={filters.inStockOnly}
                  onChange={(e) => updateFilters({ inStockOnly: e.target.checked })}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="inStockOnly" className="text-sm font-medium text-angelic-deep">
                  In Stock Only
                </label>
              </div>

              {/* Results Count */}
              <div className="pt-4 border-t">
                <span className="text-sm text-angelic-deep/70">
                  Showing {filteredCount} of {totalProducts} products
                </span>
              </div>

              {/* Clear Filters */}
              <Button
                variant="outline"
                onClick={clearAllFilters}
                className="w-full"
                disabled={activeFiltersCount === 0}
              >
                <X className="w-4 h-4 mr-2" />
                Clear All Filters
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop: Search Bar with Inline Filters */}
      <div className="hidden md:block mb-6">
        {/* Search Bar and Quick Filters Row */}
        <div className="flex gap-4 items-center mb-4">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-angelic-deep/50 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search for crystals, oracle cards, candles..."
              value={filters.searchQuery}
              onChange={(e) => updateFilters({ searchQuery: e.target.value })}
              className="pl-10 pr-4 py-3 text-lg border-2 border-angelic-cream focus:border-primary rounded-lg bg-white/80 backdrop-blur-sm"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex gap-3 items-center">
            {/* Category Filter */}
            <Select value={filters.category} onValueChange={(value) => updateFilters({ category: value })}>
              <SelectTrigger className="w-[160px] bg-white/80 backdrop-blur-sm">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort Filter */}
            <Select value={filters.sortBy} onValueChange={(value) => updateFilters({ sortBy: value })}>
              <SelectTrigger className="w-[140px] bg-white/80 backdrop-blur-sm">
                <SelectValue placeholder="Featured" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* More Filters Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="bg-white/80 backdrop-blur-sm relative">
                  <Filter className="w-4 h-4 mr-2" />
                  More Filters
                  {activeFiltersCount > 2 && (
                    <Badge variant="secondary" className="ml-2 px-1.5 py-0.5 text-xs">
                      {activeFiltersCount - 2}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Advanced Filters</SheetTitle>
                  <SheetDescription>
                    Additional filtering options
                  </SheetDescription>
                </SheetHeader>

                <div className="space-y-6 mt-6">
                  {/* Price Range */}
                  <div>
                    <label className="text-sm font-medium text-angelic-deep mb-2 block">
                      Price Range
                    </label>
                    <Select value={filters.priceRange} onValueChange={(value) => updateFilters({ priceRange: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select price range" />
                      </SelectTrigger>
                      <SelectContent>
                        {priceRanges.map((range) => (
                          <SelectItem key={range.value} value={range.value}>
                            {range.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* In Stock Only */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="inStockOnlyDesktop"
                      checked={filters.inStockOnly}
                      onChange={(e) => updateFilters({ inStockOnly: e.target.checked })}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="inStockOnlyDesktop" className="text-sm font-medium text-angelic-deep">
                      In Stock Only
                    </label>
                  </div>

                  {/* Clear Filters */}
                  <Button
                    variant="outline"
                    onClick={clearAllFilters}
                    className="w-full"
                    disabled={activeFiltersCount === 0}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear All Filters
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Results count and clear filters row */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-angelic-deep/70">
            Showing {filteredCount} of {totalProducts} products
          </span>
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-angelic-deep/70 hover:text-angelic-deep"
            >
              <X className="w-4 h-4 mr-1" />
              Clear ({`${activeFiltersCount}`})
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters Display - Only show on desktop when there are active filters */}
      {activeFiltersCount > 0 && (
        <div className="hidden md:flex flex-wrap gap-2 mt-4">
          {filters.searchQuery && (
            <Badge variant="secondary" className="px-3 py-1">
              Search: "{filters.searchQuery}"
              <X
                className="w-3 h-3 ml-2 cursor-pointer"
                onClick={() => updateFilters({ searchQuery: "" })}
              />
            </Badge>
          )}
          {filters.category !== "all" && (
            <Badge variant="secondary" className="px-3 py-1">
              {categories.find(c => c.value === filters.category)?.label}
              <X
                className="w-3 h-3 ml-2 cursor-pointer"
                onClick={() => updateFilters({ category: "all" })}
              />
            </Badge>
          )}
          {filters.priceRange !== "all" && (
            <Badge variant="secondary" className="px-3 py-1">
              {priceRanges.find(p => p.value === filters.priceRange)?.label}
              <X
                className="w-3 h-3 ml-2 cursor-pointer"
                onClick={() => updateFilters({ priceRange: "all" })}
              />
            </Badge>
          )}
          {filters.inStockOnly && (
            <Badge variant="secondary" className="px-3 py-1">
              In Stock Only
              <X
                className="w-3 h-3 ml-2 cursor-pointer"
                onClick={() => updateFilters({ inStockOnly: false })}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchAndFilter;
