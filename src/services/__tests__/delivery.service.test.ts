jest.mock('@/lib/api-service')
import DeliveryService, { AddressData, ValidationResponse } from '../delivery.service'
import * as apiModule from '@/lib/api-service'

describe('DeliveryService', () => {
  const mockPost = apiModule.apiService.post as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('validateAddress returns parsed data on success', async () => {
    const address: AddressData = {
      street: '123 Main St',
      city: 'Los Angeles',
      state: 'CA',
      zip_code: '90001',
      country: 'US',
    }

    const apiResponse: { success: true; data: ValidationResponse } = {
      success: true,
      data: {
        isValid: true,
        distance_miles: 3.2,
        message: 'Within delivery zone',
        within_delivery_zone: true,
      }
    }

    mockPost.mockResolvedValue(apiResponse)

    const result = await DeliveryService.validateAddress(address)

    expect(mockPost).toHaveBeenCalled()
    expect(result).toEqual(apiResponse.data)
  })

  it('retries on transient network error and succeeds when subsequent call succeeds', async () => {
    const address: AddressData = {
      street: '500 Remote Rd',
      city: 'Nowhere',
      state: 'ZZ',
      zip_code: '00000',
      country: 'US',
    }

    const networkError = new apiModule.ApiException('Network error', 0)
    const apiResponse: { success: true; data: ValidationResponse } = {
      success: true,
      data: {
        isValid: true,
        distance_miles: 12,
        message: 'Recovered',
        within_delivery_zone: false,
      }
    }

    // First call fails, second call succeeds (tests retry logic)
    mockPost.mockRejectedValueOnce(networkError).mockResolvedValueOnce(apiResponse)

    const result = await DeliveryService.validateAddress(address)

    expect(result).toEqual(apiResponse.data)
    expect(mockPost.mock.calls.length).toBeGreaterThanOrEqual(2)
  })
})


