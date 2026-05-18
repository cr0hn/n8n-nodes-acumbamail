import { IExecuteFunctions } from 'n8n-workflow';
import { acumbamailApiRequest } from '../../nodes/Acumbamail/GenericFunctions';

const mockHttpRequest = jest.fn();
const mockGetCredentials = jest.fn().mockResolvedValue({ authToken: 'test-token-123' });

const mockContext = {
  getCredentials: mockGetCredentials,
  helpers: { httpRequest: mockHttpRequest },
} as unknown as IExecuteFunctions;

beforeEach(() => {
  jest.clearAllMocks();
  mockHttpRequest.mockResolvedValue({ result: 'ok' });
});

describe('acumbamailApiRequest', () => {
  it('builds URL as https://acumbamail.com/api/1/{endpoint}/', async () => {
    await acumbamailApiRequest.call(mockContext, 'getLists');
    expect(mockHttpRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: 'https://acumbamail.com/api/1/getLists/' }),
    );
  });

  it('always injects auth_token from credentials', async () => {
    await acumbamailApiRequest.call(mockContext, 'getLists');
    expect(mockHttpRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({ auth_token: 'test-token-123' }),
      }),
    );
  });

  it('always injects response_type: json', async () => {
    await acumbamailApiRequest.call(mockContext, 'getLists');
    expect(mockHttpRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({ response_type: 'json' }),
      }),
    );
  });

  it('merges extra body params', async () => {
    await acumbamailApiRequest.call(mockContext, 'getListStats', { list_id: 42 });
    expect(mockHttpRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({ list_id: 42, auth_token: 'test-token-123' }),
      }),
    );
  });

  it('uses POST method', async () => {
    await acumbamailApiRequest.call(mockContext, 'getLists');
    expect(mockHttpRequest).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('throws readable error on 401', async () => {
    mockHttpRequest.mockRejectedValue({ response: { status: 401 } });
    await expect(acumbamailApiRequest.call(mockContext, 'getLists'))
      .rejects.toThrow('Token de autenticación inválido');
  });

  it('throws readable error on 403', async () => {
    mockHttpRequest.mockRejectedValue({ response: { status: 403 } });
    await expect(acumbamailApiRequest.call(mockContext, 'getLists'))
      .rejects.toThrow('Token de autenticación inválido');
  });

  it('throws readable error on 429', async () => {
    mockHttpRequest.mockRejectedValue({ response: { status: 429 } });
    await expect(acumbamailApiRequest.call(mockContext, 'getLists'))
      .rejects.toThrow('Rate limit');
  });

  it('throws readable error on 500', async () => {
    mockHttpRequest.mockRejectedValue({ response: { status: 500 } });
    await expect(acumbamailApiRequest.call(mockContext, 'getLists'))
      .rejects.toThrow('Error del servidor');
  });

  it('re-throws unrecognized errors', async () => {
    const err = new Error('network timeout');
    mockHttpRequest.mockRejectedValue(err);
    await expect(acumbamailApiRequest.call(mockContext, 'getLists'))
      .rejects.toThrow('network timeout');
  });
});
