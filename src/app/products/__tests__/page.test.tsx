import React from 'react'
import { render, screen } from '@testing-library/react'
import ProductsPage from '../page'

// Mock the hooks and components
jest.mock('../../../hooks/useProducts', () => ({
  useProductsForDisplay: jest.fn(),
}))

jest.mock('../../../stores/filterStore', () => ({
  useFilters: jest.fn(),
  useSortBy: jest.fn(),
}))

jest.mock('../../../components/ProductFilter', () => {
  return function MockProductFilter({ productCount }: { productCount: number }) {
    return <div data-testid="product-filter">Product Filter - {productCount} products</div>
  }
})

jest.mock('../../../components/ProductGrid', () => {
  return function MockProductGrid({ products }: { products: unknown[] }) {
    return <div data-testid="product-grid">{products.length} products</div>
  }
})

jest.mock('../../../components/LoadingSpinner', () => {
  return function MockLoadingSpinner() {
    return <div data-testid="loading-spinner">Loading...</div>
  }
})

jest.mock('../../../components/ErrorMessage', () => {
  return function MockErrorMessage({ title, message }: { title: string; message: string }) {
    return <div data-testid="error-message">{title}: {message}</div>
  }
})

import { useProductsForDisplay } from '../../../hooks/useProducts'
import { useFilters, useSortBy } from '../../../stores/filterStore'

const mockUseProductsForDisplay = useProductsForDisplay as jest.MockedFunction<typeof useProductsForDisplay>
const mockUseFilters = useFilters as jest.MockedFunction<typeof useFilters>
const mockUseSortBy = useSortBy as jest.MockedFunction<typeof useSortBy>

describe('ProductsPage', () => {
  const mockProducts = [
    {
      id: '1',
      name: 'Test Product 1',
      price: 100,
      availability: 'in-stock',
      // features: ['handcrafted'], // Commented out - not in product model
      // shape: 'rectangular', // Commented out - not in product model
    },
    {
      id: '2',
      name: 'Test Product 2',
      price: 200,
      availability: 'out-of-stock',
      // features: ['modern'], // Commented out - not in product model
      // shape: 'round', // Commented out - not in product model
    },
  ]

  const mockFilters = {
    availability: [],
    category: [],
    // features: [], // Commented out - not in product model
    // shape: [], // Commented out - not in product model
    colors: [],
    materials: [],
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseFilters.mockReturnValue(mockFilters)
    mockUseSortBy.mockReturnValue('new')
  })

  describe('Loading State', () => {
    it('should show loading spinner when loading', () => {
      mockUseProductsForDisplay.mockReturnValue({
        data: [],
        isLoading: true,
        isError: false,
        error: null,
        refetch: jest.fn(),
      })

      render(<ProductsPage />)

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })
  })

  describe('Error State', () => {
    it('should show error message when there is an error', () => {
      const errorMessage = 'Failed to load products'
      mockUseProductsForDisplay.mockReturnValue({
        data: [],
        isLoading: false,
        isError: true,
        error: new Error(errorMessage),
        refetch: jest.fn(),
      })

      render(<ProductsPage />)

      expect(screen.getByTestId('error-message')).toBeInTheDocument()
      expect(screen.getByText(`Unable to Load Products: ${errorMessage}`)).toBeInTheDocument()
    })
  })

  describe('Success State', () => {
    it('should render products when data is loaded', () => {
      mockUseProductsForDisplay.mockReturnValue({
        data: mockProducts,
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      })

      render(<ProductsPage />)

      expect(screen.getByTestId('product-filter')).toBeInTheDocument()
      expect(screen.getByTestId('product-grid')).toBeInTheDocument()
      expect(screen.getByText('2 products')).toBeInTheDocument()
    })

    it('should show page header', () => {
      mockUseProductsForDisplay.mockReturnValue({
        data: mockProducts,
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      })

      render(<ProductsPage />)

      expect(screen.getByText('ALL PRODUCTS')).toBeInTheDocument()
      expect(screen.getByText('Discover our complete collection of handcrafted furniture')).toBeInTheDocument()
    })
  })

  describe('Filter Integration', () => {
    it('should pass correct product count to ProductFilter', () => {
      mockUseProductsForDisplay.mockReturnValue({
        data: mockProducts,
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      })

      render(<ProductsPage />)

      expect(screen.getByText('Product Filter - 2 products')).toBeInTheDocument()
    })

    it('should handle empty product list', () => {
      mockUseProductsForDisplay.mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      })

      render(<ProductsPage />)

      expect(screen.getByText('Product Filter - 0 products')).toBeInTheDocument()
      expect(screen.getByText('No products found matching your criteria.')).toBeInTheDocument()
    })
  })
})