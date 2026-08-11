import { POST as AxiomPOST } from '@/app/api/axiom/route';

describe('POST /api/axiom', () => {
    it('should invoke axiom proxy route handler and return response', async () => {
        const mockRequest = new Request('http://localhost/api/axiom', {
            method: 'POST',
            body: JSON.stringify([{ level: 'info', message: 'test log' }]),
        });

        const response = await AxiomPOST(mockRequest as any);
        expect(response).toBeDefined();
    });
});
