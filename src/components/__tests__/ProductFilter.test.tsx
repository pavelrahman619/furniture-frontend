import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProductFilter from '../ProductFilter'

// Mock the Zustand store
jest.mock('../../stores/filterStore', () => ({
  useFilters: jest.fn(),
  useFilterOptions: jest.fn(),
  useShowAllFilters: jest.fn(),
  useSortBy: jest.fn(),
  useHasActiveFilters: jest.fn(),
  useSetFilter: jest.fn(),
  useSetShowAllFilters: jest.fn(),
  useSetSortBy: jest.fn(),
  useClearAllFilters: jest.fn(),
}))

import {
  useFilters,
  useFilterOptions,
  useShowAllFilters,
  useSortBy,
  useHasActiveFilters,
  useSetFilter,
  useSetShowAllFilters,
  useSetSortBy,
  useClearAllFilters,
} from '../../stores/filterStore'

const mockUseFilters = useFilters as jest.MockedFunction<typeof useFilters>
const mockUseFilterOptions = useFilterOptions as jest.MockedFunction<typeof useFilterOptions>
const mockUseShowAllFilters = useShowAllFilters as jest.MockedFunction<typeof useShowAllFilters>
const mockUseSortBy = useSortBy as jest.MockedFunction<typeof useSortBy>
const mockUseHasActiveFilters = useHasActiveFilters as jest.MockedFunction<typeof useHasActiveFilters>
const mockUseSetFilter = useSetFilter as jest.MockedFunction<typeof useSetFilter>
const mockUseSetShowAllFilters = useSetShowAllFilters as jest.MockedFunction<typeof useSetShowAllFilters>
const mockUseSetSortBy = useSetSortBy as jest.MockedFunction<typeof useSetSortBy>
const mockUseClearAllFilters = useClearAllFilters as jest.MockedFunction<typeof useClearAllFilters>

describe('ProductFilter', () => {
  const mockSetFilter = jest.fn()
  const mockSetShowAllFilters = jest.fn()
  const mockSetSortBy = jest.fn()
  const mockClearAllFilters = jest.fn()
  const mockHasActiveFilters = jest.fn()

  const defaultProps = {
    productCount: 12,
  }

  const mockFilterOptions = {
    availability: [
      { value: 'in-stock', label: 'In Stock' },
      { value: 'out-of-stock', label: 'Out of Stock' },
      { value: 'pre-order', label: 'Pre-Order' },
    ],
    categories: [
      { value: 'console', label: 'Console Tables', slug: 'console' },
      { value: 'chair', label: 'Chairs', slug: 'chair' },
    ],
    colors: [
      { value: 'brown', label: 'Brown' },
      { value: 'black', label: 'Black' },
    ],
    materials: [
      { value: 'wood', label: 'Wood' },
      { value: 'metal', label: 'Metal' },
    ],
    // features: [
    //   { value: 'handcrafted', label: 'Handcrafted' },
    //   { value: 'modern', label: 'Modern' },
    // ], // Commented out - not in product model
    // shapes: [
    //   { value: 'rectangular', label: 'Rectangular' },
    //   { value: 'round', label: 'Round' },
    // ], // Commented out - not in product model
  }

  const mockFilters = {
    availability: [],
    category: [],
    // features: [], // Commented out - not in product model
    // shape: [], // Commented out - not in product model
    colors: [],
    materials: [],
  }

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()

    // Setup default mock implementations
    mockUseFilters.mockReturnValue(mockFilters)
    mockUseFilterOptions.mockReturnValue(mockFilterOptions)
    mockUseShowAllFilters.mockReturnValue(false)
    mockUseSortBy.mockReturnValue('new')
    mockUseHasActiveFilters.mockReturnValue(mockHasActiveFilters)
    mockUseSetFilter.mockReturnValue(mockSetFilter)
    mockUseSetShowAllFilters.mockReturnValue(mockSetShowAllFilters)
    mockUseSetSortBy.mockReturnValue(mockSetSortBy)
    mockUseClearAllFilters.mockReturnValue(mockClearAllFilters)
    mockHasActiveFilters.mockReturnValue(false)
  })

  describe('Rendering', () => {
    it('should render all filter dropdowns', () => {
      render(<ProductFilter {...defaultProps} />)

      expect(screen.getByText('Availability')).toBeInTheDocument()
      expect(screen.getByText('Category')).toBeInTheDocument()
      // expect(screen.getByText('Features')).toBeInTheDocument() // Commented out - not in product model
      // expect(screen.getByText('Shape')).toBeInTheDocument() // Commented out - not in product model
      expect(screen.getByText('Colors')).toBeInTheDocument()
      expect(screen.getByText('Materials')).toBeInTheDocument()
    })

    it('should render product count', () => {
      render(<ProductFilter {...defaultProps} />)
      expect(screen.getByText('12 Products')).toBeInTheDocument()
    })

    it('should render sort dropdown', () => {
      render(<ProductFilter {...defaultProps} />)
      expect(screen.getByText('Sort by')).toBeInTheDocument()
      expect(screen.getByDisplayValue('New')).toBeInTheDocument()
    })

    it('should render All Filters button', () => {
      render(<ProductFilter {...defaultProps} />)
      expect(screen.getByText('All Filters')).toBeInTheDocument()
    })

    it('should not render Clear All button when no active filters', () => {
      mockHasActiveFilters.mockReturnValue(false)
      render(<ProductFilter {...defaultProps} />)
      expect(screen.queryByText('Clear All Filters')).not.toBeInTheDocument()
    })

    it('should render Clear All button when active filters exist', () => {
      mockHasActiveFilters.mockReturnValue(true)
      render(<ProductFilter {...defaultProps} />)
      expect(screen.getByText('Clear All Filters')).toBeInTheDocument()
    })
  })

  describe('Dropdown Functionality', () => {
    it('should open dropdown when clicked', async () => {
      const user = userEvent.setup()
      render(<ProductFilter {...defaultProps} />)

      const availabilityButton = screen.getByText('Availability')
      await user.click(availabilityButton)

      expect(screen.getByText('In Stock')).toBeInTheDocument()
      expect(screen.getByText('Out of Stock')).toBeInTheDocument()
      expect(screen.getByText('Pre-Order')).toBeInTheDocument()
    })

    it('should close dropdown when clicking outside', async () => {
      const user = userEvent.setup()
      render(<ProductFilter {...defaultProps} />)

      const availabilityButton = screen.getByText('Availability')
      await user.click(availabilityButton)

      // Verify dropdown is open
      expect(screen.getByText('In Stock')).toBeInTheDocument()

      // Click outside
      await user.click(document.body)

      // Wait for dropdown to close
      await waitFor(() => {
        expect(screen.queryByText('In Stock')).not.toBeInTheDocument()
      })
    })

    it('should toggle checkbox when clicked', async () => {
      const user = userEvent.setup()
      render(<ProductFilter {...defaultProps} />)

      const availabilityButton = screen.getByText('Availability')
      await user.click(availabilityButton)

      const inStockCheckbox = screen.getByLabelText('In Stock')
      await user.click(inStockCheckbox)

      expect(mockSetFilter).toHaveBeenCalledWith('availability', ['in-stock'])
    })

    it('should handle multiple selections', async () => {
      const user = userEvent.setup()
      mockUseFilters.mockReturnValue({
        ...mockFilters,
        availability: ['in-stock'],
      })

      render(<ProductFilter {...defaultProps} />)

      const availabilityButton = screen.getByText('Availability')
      await user.click(availabilityButton)

      const outOfStockCheckbox = screen.getByLabelText('Out of Stock')
      await user.click(outOfStockCheckbox)

      expect(mockSetFilter).toHaveBeenCalledWith('availability', ['in-stock', 'out-of-stock'])
    })
  })

  describe('Sort Functionality', () => {
    it('should call setSortBy when sort option changes', async () => {
      const user = userEvent.setup()
      render(<ProductFilter {...defaultProps} />)

      const sortSelect = screen.getByDisplayValue('New')
      await user.selectOptions(sortSelect, 'price-low')

      expect(mockSetSortBy).toHaveBeenCalledWith('price-low')
    })
  })

  describe('All Filters Panel', () => {
    it('should toggle All Filters panel when clicked', async () => {
      const user = userEvent.setup()
      render(<ProductFilter {...defaultProps} />)

      const allFiltersButton = screen.getByText('All Filters')
      await user.click(allFiltersButton)

      expect(mockSetShowAllFilters).toHaveBeenCalledWith(true)
    })

    it('should render extended filters panel when showAllFilters is true', () => {
      mockUseShowAllFilters.mockReturnValue(true)
      render(<ProductFilter {...defaultProps} />)

      // Check for the extended panel by looking for the panel container
      expect(screen.getAllByText('Availability')).toHaveLength(2) // One in main bar, one in extended panel
      expect(screen.getAllByText('Category')).toHaveLength(2)
      // expect(screen.getAllByText('Features')).toHaveLength(2) // Commented out - not in product model
      // expect(screen.getAllByText('Shape')).toHaveLength(2) // Commented out - not in product model
    })
  })

  describe('Clear All Functionality', () => {
    it('should call clearAllFilters when Clear All button is clicked', async () => {
      const user = userEvent.setup()
      mockHasActiveFilters.mockReturnValue(true)
      render(<ProductFilter {...defaultProps} />)

      const clearAllButton = screen.getByText('Clear All Filters')
      await user.click(clearAllButton)

      expect(mockClearAllFilters).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<ProductFilter {...defaultProps} />)

      const sortSelect = screen.getByLabelText('Sort by')
      expect(sortSelect).toBeInTheDocument()
    })

    it('should have proper button roles', () => {
      render(<ProductFilter {...defaultProps} />)

      const allFiltersButton = screen.getByRole('button', { name: 'All Filters' })
      expect(allFiltersButton).toBeInTheDocument()
    })
  })
})