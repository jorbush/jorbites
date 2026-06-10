import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetcher, axiosFetcher } from '@/app/utils/fetcher';
import axios from 'axios';

vi.mock('axios');

describe('fetcher utility', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal('fetch', vi.fn());
    });

    describe('fetcher', () => {
        it('should return data when fetch is successful', async () => {
            const mockData = { id: 1, name: 'Test' };
            const mockResponse = {
                ok: true,
                status: 200,
                json: vi.fn().mockResolvedValue(mockData),
            };
            vi.mocked(fetch).mockResolvedValue(mockResponse as any);

            const result = await fetcher('/api/test');

            expect(fetch).toHaveBeenCalledWith('/api/test');
            expect(result).toEqual(mockData);
        });

        it('should throw an error with status when fetch is not ok', async () => {
            const mockResponse = {
                ok: false,
                status: 404,
            };
            vi.mocked(fetch).mockResolvedValue(mockResponse as any);

            await expect(fetcher('/api/test')).rejects.toThrow(
                'An error occurred while fetching the data.'
            );

            try {
                await fetcher('/api/test');
            } catch (err: any) {
                expect(err.status).toBe(404);
            }
        });
    });

    describe('axiosFetcher', () => {
        it('should return data when axios get is successful', async () => {
            const mockData = { items: [1, 2] };
            vi.mocked(axios.get).mockResolvedValue({ data: mockData });

            const result = await axiosFetcher('/api/axios-test');

            expect(axios.get).toHaveBeenCalledWith('/api/axios-test');
            expect(result).toEqual(mockData);
        });

        it('should throw an error when axios get fails', async () => {
            const mockError = new Error('Axios failed');
            vi.mocked(axios.get).mockRejectedValue(mockError);

            await expect(axiosFetcher('/api/axios-test')).rejects.toThrow(
                'Axios failed'
            );
        });
    });
});
