import {
  IDataObject,
  IExecuteFunctions,
  IHookFunctions,
  IHttpRequestOptions,
  JsonObject,
} from 'n8n-workflow';

const BASE_URL = 'https://acumbamail.com/api/1';

export async function acumbamailApiRequest(
  this: IExecuteFunctions | IHookFunctions,
  endpoint: string,
  body: IDataObject = {},
): Promise<IDataObject> {
  const credentials = await this.getCredentials('acumbamailApi');

  const options: IHttpRequestOptions = {
    method: 'POST',
    url: `${BASE_URL}/${endpoint}/`,
    body: {
      auth_token: credentials.authToken as string,
      response_type: 'json',
      ...body,
    },
    json: true,
  };

  try {
    return (await this.helpers.httpRequest(options)) as IDataObject;
  } catch (error) {
    const err = error as JsonObject;
    const status =
      ((err.response as JsonObject | undefined)?.status as number | undefined) ??
      (err.statusCode as number | undefined);

    if (status === 401 || status === 403) {
      throw new Error('Acumbamail: Invalid authentication token');
    }
    if (status === 429) {
      throw new Error('Acumbamail: Rate limit exceeded (max 10 req/min per endpoint)');
    }
    if (status !== undefined && status >= 500) {
      throw new Error(`Acumbamail: Server error (${status})`);
    }
    throw error;
  }
}
