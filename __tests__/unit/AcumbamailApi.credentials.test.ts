import { AcumbamailApi } from '../../credentials/AcumbamailApi.credentials';

describe('AcumbamailApi credential', () => {
  let credential: AcumbamailApi;

  beforeEach(() => {
    credential = new AcumbamailApi();
  });

  it('has name acumbamailApi', () => {
    expect(credential.name).toBe('acumbamailApi');
  });

  it('has a password-type authToken property', () => {
    const prop = credential.properties.find((p) => p.name === 'authToken');
    expect(prop).toBeDefined();
    expect(prop!.type).toBe('string');
    expect((prop!.typeOptions as { password?: boolean } | undefined)?.password).toBe(true);
  });

  it('authToken is required', () => {
    const prop = credential.properties.find((p) => p.name === 'authToken');
    expect(prop!.required).toBe(true);
  });

  it('has a credential test pointing to getLists', () => {
    expect(credential.test).toBeDefined();
    expect(credential.test!.request.url).toContain('getLists');
  });
});
