import { useState, useMemo } from "react";
import ProductCard from "./ProductCard";
import SearchAndFilter, { FilterOptions } from "./SearchAndFilter";
import ProductPagination from "./ProductPagination";
import { PRODUCTS, Product } from "@/data/products";

const ProductGrid = () => {
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: "",
    category: "all",
    priceRange: "all",
    sortBy: "featured",
    inStockOnly: false,
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 20;

  // Helper function to convert price string to number
  const getPriceAsNumber = (priceString: string): number => {
    return parseInt(priceString.replace(/,/g, ""));
  };

  // Filter and sort products based on current filters
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...PRODUCTS];

    // Apply search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (filters.category !== "all") {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    // Apply price range filter
    if (filters.priceRange !== "all") {
      filtered = filtered.filter(product => {
        const price = getPriceAsNumber(product.price);
        switch (filters.priceRange) {
          case "0-1000":
            return price < 1000;
          case "1000-2000":
            return price >= 1000 && price < 2000;
          case "2000-3000":
            return price >= 2000 && price < 3000;
          case "3000+":
            return price >= 3000;
          default:
            return true;
        }
      });
    }

    // Apply in stock filter
    if (filters.inStockOnly) {
      filtered = filtered.filter(product => product.inStock);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "price-low":
          return getPriceAsNumber(a.price) - getPriceAsNumber(b.price);
        case "price-high":
          return getPriceAsNumber(b.price) - getPriceAsNumber(a.price);
        case "rating":
          return b.rating - a.rating;
        case "featured":
        default:
          // Featured products first, then by name
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [filters]);

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of products section
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredAndSortedProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const currentProducts = filteredAndSortedProducts.slice(startIndex, endIndex);

  return (
    <section id="products" className="py-16 bg-gradient-hero">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 px-6">
          <h2 className="text-3xl md:text-4xl font-playfair font-bold text-angelic-deep mb-4">
            Sacred Collection
          </h2>
          <p className="text-angelic-deep/70 max-w-2xl mx-auto">
            Each treasure is blessed with intention and chosen for its powerful healing properties
          </p>
        </div>

        {/* Search and Filter Component */}
        <SearchAndFilter
          onFilterChange={handleFilterChange}
          totalProducts={PRODUCTS.length}
          filteredCount={filteredAndSortedProducts.length}
        />

        {/* Products Grid */}
        <div className="px-6">
          {filteredAndSortedProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {currentProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    sku={product.sku}
                    image={product.image}
                    name={product.name}
                    description={product.description}
                    price={product.price}
                    originalPrice={product.originalPrice}
                    rating={product.rating}
                  />
                ))}
              </div>

              {/* Pagination Component */}
              <ProductPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalProducts={filteredAndSortedProducts.length}
                productsPerPage={productsPerPage}
                onPageChange={handlePageChange}
              />
            </>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-playfair font-bold text-angelic-deep mb-2">
                No products found
              </h3>
              <p className="text-angelic-deep/70 mb-6">
                Try adjusting your search or filter criteria
              </p>
              <button
                onClick={() => {
                  setFilters({
                    searchQuery: "",
                    category: "all",
                    priceRange: "all",
                    sortBy: "featured",
                    inStockOnly: false,
                  });
                  setCurrentPage(1);
                }}
                className="text-primary hover:text-primary/80 font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;