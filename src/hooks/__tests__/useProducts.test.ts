import React from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useProductsForDisplay } from '../useProducts'
import * as ProductService from '../../services/product.service'

// Mock the product service
jest.mock('../../services/product.service', () => ({
  getProductsForDisplay: jest.fn(),
}))

const mockProductService = ProductService as jest.Mocked<typeof ProductService>

// Create a test wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
  Wrapper.displayName = 'TestWrapper'
  return Wrapper
}

describe('useProducts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('useProductsForDisplay', () => {
    it('should fetch products successfully', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'Test Product 1',
          price: 100,
          availability: 'in-stock',
          // features: ['handcrafted'], // Commented out - not in product model
          // shape: 'rectangular', // Commented out - not in product model
        },
      ]

      const mockResponse = {
        success: true,
        data: {
          products: mockProducts,
          pagination: {
            current_page: 1,
            total_pages: 1,
            total_count: 1,
            has_next: false,
            has_prev: false,
          },
          filters_available: {
            categories: [],
            colors: [],
            materials: [],
            price_range: { min: 0, max: 1000 },
          },
        },
      }

      mockProductService.getProductsForDisplay.mockResolvedValue(mockResponse)

      const { result } = renderHook(
        () => useProductsForDisplay({ page: 1, limit: 12 }),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toEqual(mockProducts)
      expect(result.current.isError).toBe(false)
      expect(mockProductService.getProductsForDisplay).toHaveBeenCalledWith({
        page: 1,
        limit: 12,
      })
    })

    it('should handle loading state', () => {
      mockProductService.getProductsForDisplay.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      )

      const { result } = renderHook(
        () => useProductsForDisplay({ page: 1, limit: 12 }),
        { wrapper: createWrapper() }
      )

      expect(result.current.isLoading).toBe(true)
      expect(result.current.data).toEqual([])
      expect(result.current.isError).toBe(false)
    })

    it('should handle error state', async () => {
      const error = new Error('Failed to fetch products')
      mockProductService.getProductsForDisplay.mockRejectedValue(error)

      const { result } = renderHook(
        () => useProductsForDisplay({ page: 1, limit: 12 }),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.data).toEqual([])
      expect(result.current.error).toBe(error)
      expect(result.current.isLoading).toBe(false)
    })
  })
})