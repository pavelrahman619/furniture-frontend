import { renderHook, act } from '@testing-library/react'
import { useFilterStore, useFilters, useFilterOptions, useSetFilter, useClearAllFilters, useHasActiveFilters } from '../filterStore'

describe('FilterStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    act(() => {
      useFilterStore.getState().reset()
    })
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useFilterStore())
      
      expect(result.current.filters).toEqual({
        availability: [],
        category: [],
        features: [],
        shape: [],
        colors: [],
        materials: [],
      })
      expect(result.current.showAllFilters).toBe(false)
      expect(result.current.sortBy).toBe('new')
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBe(null)
    })

    it('should have correct filter options', () => {
      const { result } = renderHook(() => useFilterStore())
      
      expect(result.current.filterOptions.availability).toHaveLength(3)
      expect(result.current.filterOptions.categories).toHaveLength(5)
      expect(result.current.filterOptions.colors).toHaveLength(7)
      expect(result.current.filterOptions.materials).toHaveLength(7)
      expect(result.current.filterOptions.features).toHaveLength(8)
      expect(result.current.filterOptions.shapes).toHaveLength(6)
    })
  })

  describe('Filter Actions', () => {
    it('should set filter values correctly', () => {
      const { result } = renderHook(() => useSetFilter())
      
      act(() => {
        result.current('availability', ['in-stock'])
      })

      const { result: filtersResult } = renderHook(() => useFilters())
      expect(filtersResult.current.availability).toEqual(['in-stock'])
    })

    it('should update existing filter values', () => {
      const { result } = renderHook(() => useSetFilter())
      
      act(() => {
        result.current('colors', ['brown', 'black'])
      })

      const { result: filtersResult } = renderHook(() => useFilters())
      expect(filtersResult.current.colors).toEqual(['brown', 'black'])
    })

    it('should clear all filters', () => {
      const { result: setFilter } = renderHook(() => useSetFilter())
      const { result: clearAll } = renderHook(() => useClearAllFilters())
      
      // Set some filters first
      act(() => {
        setFilter.current('availability', ['in-stock'])
        setFilter.current('colors', ['brown'])
        setFilter.current('category', ['chair'])
      })

      // Verify filters are set
      const { result: filtersBefore } = renderHook(() => useFilters())
      expect(filtersBefore.current.availability).toEqual(['in-stock'])
      expect(filtersBefore.current.colors).toEqual(['brown'])
      expect(filtersBefore.current.category).toEqual(['chair'])

      // Clear all filters
      act(() => {
        clearAll.current()
      })

      // Verify all filters are cleared
      const { result: filtersAfter } = renderHook(() => useFilters())
      expect(filtersAfter.current.availability).toEqual([])
      expect(filtersAfter.current.colors).toEqual([])
      expect(filtersAfter.current.category).toEqual([])
    })

    it('should set price range correctly', () => {
      const { result } = renderHook(() => useFilterStore())
      
      act(() => {
        result.current.setPriceRange(100, 500)
      })

      expect(result.current.filters.price_min).toBe(100)
      expect(result.current.filters.price_max).toBe(500)
    })

    it('should clear price range when set to null', () => {
      const { result } = renderHook(() => useFilterStore())
      
      // Set price range first
      act(() => {
        result.current.setPriceRange(100, 500)
      })

      // Clear price range
      act(() => {
        result.current.setPriceRange(null, null)
      })

      expect(result.current.filters.price_min).toBeUndefined()
      expect(result.current.filters.price_max).toBeUndefined()
    })
  })

  describe('UI State Actions', () => {
    it('should toggle show all filters', () => {
      const { result } = renderHook(() => useFilterStore())
      
      expect(result.current.showAllFilters).toBe(false)

      act(() => {
        result.current.setShowAllFilters(true)
      })

      expect(result.current.showAllFilters).toBe(true)
    })

    it('should set sort by value', () => {
      const { result } = renderHook(() => useFilterStore())
      
      act(() => {
        result.current.setSortBy('price-low')
      })

      expect(result.current.sortBy).toBe('price-low')
    })
  })

  describe('Utility Functions', () => {
    it('should correctly identify active filters', () => {
      const { result: hasActiveFilters } = renderHook(() => useHasActiveFilters())
      
      // Initially no active filters
      expect(hasActiveFilters.current()).toBe(false)

      // Add some filters
      const { result: setFilter } = renderHook(() => useSetFilter())
      act(() => {
        setFilter.current('availability', ['in-stock'])
      })

      expect(hasActiveFilters.current()).toBe(true)
    })

    it('should count active filters correctly', () => {
      const { result } = renderHook(() => useFilterStore())
      
      // Initially no active filters
      expect(result.current.getActiveFilterCount()).toBe(0)

      // Add some filters
      act(() => {
        result.current.setFilter('availability', ['in-stock', 'out-of-stock'])
        result.current.setFilter('colors', ['brown'])
        result.current.setPriceRange(100, 500)
      })

      expect(result.current.getActiveFilterCount()).toBe(4) // 2 availability + 1 color + 1 price range
    })

    it('should clear individual filter', () => {
      const { result } = renderHook(() => useFilterStore())
      
      // Set some filters
      act(() => {
        result.current.setFilter('availability', ['in-stock'])
        result.current.setFilter('colors', ['brown'])
      })

      // Clear availability filter
      act(() => {
        result.current.clearFilter('availability')
      })

      expect(result.current.filters.availability).toEqual([])
      expect(result.current.filters.colors).toEqual(['brown']) // Should remain
    })
  })

  describe('Selectors', () => {
    it('should return correct filter options', () => {
      const { result } = renderHook(() => useFilterOptions())
      
      expect(result.current.availability).toHaveLength(3)
      expect(result.current.categories).toHaveLength(5)
      expect(result.current.colors).toHaveLength(7)
      expect(result.current.materials).toHaveLength(7)
      expect(result.current.features).toHaveLength(8)
      expect(result.current.shapes).toHaveLength(6)
    })

    it('should return current filters', () => {
      const { result } = renderHook(() => useFilters())
      
      expect(result.current).toEqual({
        availability: [],
        category: [],
        features: [],
        shape: [],
        colors: [],
        materials: [],
      })
    })
  })
})