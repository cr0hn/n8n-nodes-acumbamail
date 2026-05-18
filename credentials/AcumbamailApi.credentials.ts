import {
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class AcumbamailApi implements ICredentialType {
  name = 'acumbamailApi';
  displayName = 'Acumbamail API';
  documentationUrl = 'https://acumbamail.com/apidoc/';
  properties: INodeProperties[] = [
    {
      displayName: 'Auth Token',
      name: 'authToken',
      type: 'string',
      typeOptions: { password: true },
      default: '',
      required: true,
      description: 'API authentication token from your Acumbamail account settings',
    },
  ];

  test: ICredentialTestRequest = {
    request: {
      method: 'POST',
      url: 'https://acumbamail.com/api/1/getLists/',
      body: {
        auth_token: '={{$credentials.authToken}}',
        response_type: 'json',
      },
    },
  };
}
