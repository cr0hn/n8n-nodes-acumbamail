# n8n-nodes-acumbamail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and publish `n8n-nodes-acumbamail`, a community n8n node package that exposes all 46 working Acumbamail API operations plus a webhook trigger.

**Architecture:** One action node (`Acumbamail.node.ts`) with Resource→Operation dropdowns, one trigger node (`AcumbamailTrigger.node.ts`) for inbound webhooks, shared credential type (`AcumbamailApi`), and a `GenericFunctions.ts` HTTP helper. Descriptions are split per resource for maintainability.

**Tech Stack:** TypeScript 5.5, n8n-workflow (peer dep), jest + ts-jest, gulp (SVG copy), Node.js 20.

---

## File Map

| File | Responsibility |
|---|---|
| `package.json` | npm package config, n8n registry, scripts |
| `tsconfig.json` | TypeScript compiler config (`skipLibCheck: true` mandatory) |
| `gulpfile.js` | Copy SVGs to `dist/` (tsc ignores non-TS files) |
| `jest.config.js` | Jest + ts-jest config (no globals syntax) |
| `CHANGELOG.md` | Change history, newest first |
| `credentials/AcumbamailApi.credentials.ts` | Auth token credential + self-test |
| `nodes/Acumbamail/GenericFunctions.ts` | `acumbamailApiRequest()` — injects token, builds URL, maps errors |
| `nodes/Acumbamail/Acumbamail.node.ts` | Main action node — routes all 46 operations |
| `nodes/Acumbamail/acumbamail.svg` | Node icon |
| `nodes/Acumbamail/descriptions/ListDescription.ts` | INodeProperties for List resource (11 ops) |
| `nodes/Acumbamail/descriptions/SubscriberDescription.ts` | INodeProperties for Subscriber resource (9 ops) |
| `nodes/Acumbamail/descriptions/CampaignDescription.ts` | INodeProperties for Campaign resource (13 ops) |
| `nodes/Acumbamail/descriptions/TemplateDescription.ts` | INodeProperties for Template resource (4 ops) |
| `nodes/Acumbamail/descriptions/SmtpDescription.ts` | INodeProperties for SMTP resource (5 ops) |
| `nodes/Acumbamail/descriptions/WebhookDescription.ts` | INodeProperties for Webhook resource (4 ops) |
| `nodes/AcumbamailTrigger/AcumbamailTrigger.node.ts` | Trigger node — receives Acumbamail webhooks |
| `nodes/AcumbamailTrigger/acumbamail.svg` | Same icon (copy) |
| `__tests__/unit/GenericFunctions.test.ts` | Unit tests for HTTP helper |
| `__tests__/unit/ListDescription.test.ts` | Unit tests for List properties |
| `__tests__/unit/SubscriberDescription.test.ts` | Unit tests for Subscriber properties |
| `__tests__/unit/CampaignDescription.test.ts` | Unit tests for Campaign properties |
| `__tests__/unit/TemplateDescription.test.ts` | Unit tests for Template properties |
| `__tests__/unit/SmtpDescription.test.ts` | Unit tests for SMTP properties |
| `__tests__/unit/WebhookDescription.test.ts` | Unit tests for Webhook properties |
| `__tests__/integration/Acumbamail.integration.test.ts` | Integration tests (require ACUMBAMAIL_TOKEN) |

---

## Task 1: Project scaffolding

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `gulpfile.js`
- Create: `jest.config.js`
- Create: `CHANGELOG.md`

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p credentials nodes/Acumbamail/descriptions nodes/AcumbamailTrigger __tests__/unit __tests__/integration
```

- [ ] **Step 2: Write package.json**

```json
{
  "name": "n8n-nodes-acumbamail",
  "version": "0.1.0",
  "description": "n8n community node for Acumbamail email marketing",
  "keywords": ["n8n-community-node-package", "acumbamail", "email-marketing", "newsletter"],
  "license": "MIT",
  "homepage": "https://github.com/cr0hn/n8n-nodes-acumbamail",
  "author": {
    "name": "Dani",
    "email": "cr0hn@cr0hn.com"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/cr0hn/n8n-nodes-acumbamail.git"
  },
  "main": "index.js",
  "scripts": {
    "build": "tsc && gulp build:icons",
    "dev": "tsc --watch",
    "lint": "eslint nodes credentials --ext .ts",
    "prepublishOnly": "npm run build && npm run lint && npm run test",
    "test": "jest --testPathPattern=unit",
    "test:integration": "jest --testPathPattern=integration --runInBand"
  },
  "files": ["dist"],
  "n8n": {
    "n8nNodesApiVersion": 1,
    "credentials": [
      "dist/credentials/AcumbamailApi.credentials.js"
    ],
    "nodes": [
      "dist/nodes/Acumbamail/Acumbamail.node.js",
      "dist/nodes/AcumbamailTrigger/AcumbamailTrigger.node.js"
    ]
  },
  "devDependencies": {
    "@types/jest": "^29.5.12",
    "@types/node": "^20.14.0",
    "gulp": "^4.0.2",
    "jest": "^29.7.0",
    "n8n-workflow": "^1.0.0",
    "ts-jest": "^29.2.3",
    "typescript": "^5.5.4"
  },
  "peerDependencies": {
    "n8n-workflow": "*"
  }
}
```

- [ ] **Step 3: Write tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2019",
    "module": "commonjs",
    "lib": ["ES2019"],
    "strict": true,
    "declaration": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true
  },
  "exclude": ["dist", "node_modules", "**/*.test.ts", "gulpfile.js", "jest.config.js"]
}
```

- [ ] **Step 4: Write gulpfile.js**

```js
const { src, dest } = require('gulp');

function buildIcons() {
  return src('nodes/**/*.svg').pipe(dest('dist/nodes'));
}

exports['build:icons'] = buildIcons;
```

- [ ] **Step 5: Write jest.config.js**

```js
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: { target: 'ES2019', module: 'commonjs', strict: true, skipLibCheck: true }
    }]
  }
};
```

- [ ] **Step 6: Write CHANGELOG.md**

```markdown
# Changelog

## [0.1.0] - 2026-05-18

### Added
- Initial release
- Action node with 46 operations across 6 resources (List, Subscriber, Campaign, Template, SMTP, Webhook)
- Trigger node for List and SMTP webhook events
- Credential type with self-test
```

- [ ] **Step 7: Install dependencies**

```bash
npm install
```

Expected: node_modules created, no errors.

- [ ] **Step 8: Commit**

```bash
git add package.json tsconfig.json gulpfile.js jest.config.js CHANGELOG.md
git commit -m "chore: project scaffolding — package.json, tsconfig, jest, gulp"
```

---

## Task 2: Credential type

**Files:**
- Create: `credentials/AcumbamailApi.credentials.ts`
- Create: `__tests__/unit/AcumbamailApi.credentials.test.ts`

- [ ] **Step 1: Write failing test**

Create `__tests__/unit/AcumbamailApi.credentials.test.ts`:

```typescript
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
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npm test -- --testPathPattern=AcumbamailApi
```

Expected: FAIL — `Cannot find module '../../credentials/AcumbamailApi.credentials'`

- [ ] **Step 3: Write credential type**

Create `credentials/AcumbamailApi.credentials.ts`:

```typescript
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
```

- [ ] **Step 4: Run test — expect PASS**

```bash
npm test -- --testPathPattern=AcumbamailApi
```

Expected: PASS — 4 tests passed.

- [ ] **Step 5: Commit**

```bash
git add credentials/AcumbamailApi.credentials.ts __tests__/unit/AcumbamailApi.credentials.test.ts
git commit -m "feat: add AcumbamailApi credential type with self-test"
```

---

## Task 3: GenericFunctions — HTTP helper

**Files:**
- Create: `nodes/Acumbamail/GenericFunctions.ts`
- Create: `__tests__/unit/GenericFunctions.test.ts`

- [ ] **Step 1: Write failing tests**

Create `__tests__/unit/GenericFunctions.test.ts`:

```typescript
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
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npm test -- --testPathPattern=GenericFunctions
```

Expected: FAIL — `Cannot find module '../../nodes/Acumbamail/GenericFunctions'`

- [ ] **Step 3: Write GenericFunctions.ts**

Create `nodes/Acumbamail/GenericFunctions.ts`:

```typescript
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
      throw new Error('Acumbamail: Token de autenticación inválido');
    }
    if (status === 429) {
      throw new Error('Acumbamail: Rate limit alcanzado (máx. 10 req/min por endpoint)');
    }
    if (status !== undefined && status >= 500) {
      throw new Error(`Acumbamail: Error del servidor (${status})`);
    }
    throw error;
  }
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
npm test -- --testPathPattern=GenericFunctions
```

Expected: PASS — 10 tests passed.

- [ ] **Step 5: Commit**

```bash
git add nodes/Acumbamail/GenericFunctions.ts __tests__/unit/GenericFunctions.test.ts
git commit -m "feat: add GenericFunctions HTTP helper with error mapping"
```

---

## Task 4: SVG icon

**Files:**
- Create: `nodes/Acumbamail/acumbamail.svg`
- Create: `nodes/AcumbamailTrigger/acumbamail.svg`

- [ ] **Step 1: Create SVG icon**

Create `nodes/Acumbamail/acumbamail.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">
  <rect width="60" height="60" rx="8" fill="#1a56db"/>
  <rect x="10" y="18" width="40" height="26" rx="3" fill="none" stroke="white" stroke-width="2.5"/>
  <polyline points="10,21 30,34 50,21" fill="none" stroke="white" stroke-width="2.5" stroke-linejoin="round"/>
</svg>
```

- [ ] **Step 2: Copy icon to trigger node directory**

```bash
cp nodes/Acumbamail/acumbamail.svg nodes/AcumbamailTrigger/acumbamail.svg
```

- [ ] **Step 3: Commit**

```bash
git add nodes/Acumbamail/acumbamail.svg nodes/AcumbamailTrigger/acumbamail.svg
git commit -m "feat: add Acumbamail SVG icon for both nodes"
```

---

## Task 5: List description

**Files:**
- Create: `nodes/Acumbamail/descriptions/ListDescription.ts`
- Create: `__tests__/unit/ListDescription.test.ts`

- [ ] **Step 1: Write failing test**

Create `__tests__/unit/ListDescription.test.ts`:

```typescript
import { listOperations, listFields } from '../../nodes/Acumbamail/descriptions/ListDescription';

describe('ListDescription', () => {
  it('exports listOperations array', () => {
    expect(Array.isArray(listOperations)).toBe(true);
  });

  it('operation property shows only for list resource', () => {
    const op = listOperations.find((p) => p.name === 'operation')!;
    expect(op.displayOptions?.show?.resource).toContain('list');
  });

  it('has all 11 expected operations', () => {
    const op = listOperations.find((p) => p.name === 'operation')!;
    const values = (op.options as { value: string }[]).map((o) => o.value);
    expect(values).toEqual(expect.arrayContaining([
      'getAll', 'create', 'delete', 'getStats', 'getFields', 'getFieldTypes',
      'getSegments', 'getMergeFields', 'addMergeTag', 'getSubsStats', 'getForms',
    ]));
    expect(values).toHaveLength(11);
  });

  it('listId field is required for non-create operations', () => {
    const field = listFields.find((f) => f.name === 'listId')!;
    expect(field.required).toBe(true);
    const ops = field.displayOptions?.show?.operation as string[];
    expect(ops).not.toContain('create');
    expect(ops).not.toContain('getAll');
  });

  it('create operation has name and senderEmail as required fields', () => {
    const nameField = listFields.find((f) => f.name === 'name')!;
    const emailField = listFields.find((f) => f.name === 'senderEmail')!;
    expect(nameField.required).toBe(true);
    expect(emailField.required).toBe(true);
  });

  it('addMergeTag has fieldName and fieldType as required', () => {
    const fn = listFields.find((f) => f.name === 'fieldName')!;
    const ft = listFields.find((f) => f.name === 'fieldType')!;
    expect(fn.required).toBe(true);
    expect(ft.required).toBe(true);
  });

  it('fieldType options include text, number, date, boolean', () => {
    const ft = listFields.find((f) => f.name === 'fieldType')!;
    const values = (ft.options as { value: string }[]).map((o) => o.value);
    expect(values).toEqual(expect.arrayContaining(['text', 'number', 'date', 'boolean']));
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npm test -- --testPathPattern=ListDescription
```

Expected: FAIL — `Cannot find module '../../nodes/Acumbamail/descriptions/ListDescription'`

- [ ] **Step 3: Write ListDescription.ts**

Create `nodes/Acumbamail/descriptions/ListDescription.ts`:

```typescript
import { INodeProperties } from 'n8n-workflow';

export const listOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['list'] } },
    options: [
      { name: 'Add Merge Tag', value: 'addMergeTag', description: 'Add a custom merge tag field to a list', action: 'Add merge tag to a list' },
      { name: 'Create', value: 'create', description: 'Create a new mailing list', action: 'Create a list' },
      { name: 'Delete', value: 'delete', description: 'Delete a mailing list', action: 'Delete a list' },
      { name: 'Get All', value: 'getAll', description: 'Get all mailing lists', action: 'Get all lists' },
      { name: 'Get Field Types', value: 'getFieldTypes', description: 'Get field name to type mapping for a list', action: 'Get field types of a list' },
      { name: 'Get Fields', value: 'getFields', description: 'Get custom fields of a list', action: 'Get fields of a list' },
      { name: 'Get Forms', value: 'getForms', description: 'Get subscription forms for a list', action: 'Get forms of a list' },
      { name: 'Get Merge Fields', value: 'getMergeFields', description: 'Get merge fields (personalization tags) for a list', action: 'Get merge fields of a list' },
      { name: 'Get Segments', value: 'getSegments', description: 'Get segments of a list', action: 'Get segments of a list' },
      { name: 'Get Stats', value: 'getStats', description: 'Get statistics for a list', action: 'Get stats of a list' },
      { name: 'Get Subs Stats', value: 'getSubsStats', description: 'Get paginated subscriber statistics for a list', action: 'Get subscriber stats of a list' },
    ],
    default: 'getAll',
  },
];

export const listFields: INodeProperties[] = [
  {
    displayName: 'List ID',
    name: 'listId',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['list'],
        operation: ['delete', 'getStats', 'getFields', 'getFieldTypes', 'getSegments', 'getMergeFields', 'addMergeTag', 'getSubsStats', 'getForms'],
      },
    },
    default: '',
    description: 'ID of the mailing list',
  },
  {
    displayName: 'Name',
    name: 'name',
    type: 'string',
    required: true,
    displayOptions: { show: { resource: ['list'], operation: ['create'] } },
    default: '',
    description: 'Name of the new mailing list',
  },
  {
    displayName: 'Sender Email',
    name: 'senderEmail',
    type: 'string',
    required: true,
    displayOptions: { show: { resource: ['list'], operation: ['create'] } },
    default: '',
    description: 'Default sender email address for campaigns sent to this list',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: { show: { resource: ['list'], operation: ['create'] } },
    default: {},
    options: [
      { displayName: 'Company', name: 'company', type: 'string', default: '', description: 'Company name for the sender' },
      { displayName: 'Country', name: 'country', type: 'string', default: 'ES', description: 'ISO country code for the sender (default: ES)' },
      { displayName: 'Description', name: 'description', type: 'string', default: '', description: 'Description of the mailing list' },
      { displayName: 'Sender Name', name: 'sender_name', type: 'string', default: '', description: 'Default sender name for campaigns' },
    ],
  },
  {
    displayName: 'Field Name',
    name: 'fieldName',
    type: 'string',
    required: true,
    displayOptions: { show: { resource: ['list'], operation: ['addMergeTag'] } },
    default: '',
    description: 'Name of the new merge tag field',
  },
  {
    displayName: 'Field Type',
    name: 'fieldType',
    type: 'options',
    required: true,
    displayOptions: { show: { resource: ['list'], operation: ['addMergeTag'] } },
    options: [
      { name: 'Boolean', value: 'boolean' },
      { name: 'Date', value: 'date' },
      { name: 'Number', value: 'number' },
      { name: 'Text', value: 'text' },
    ],
    default: 'text',
    description: 'Data type of the merge tag field',
  },
  {
    displayName: 'Block Index',
    name: 'blockIndex',
    type: 'number',
    displayOptions: { show: { resource: ['list'], operation: ['getSubsStats'] } },
    default: 0,
    description: 'Pagination block index (0-based)',
  },
];
```

- [ ] **Step 4: Run test — expect PASS**

```bash
npm test -- --testPathPattern=ListDescription
```

Expected: PASS — 7 tests passed.

- [ ] **Step 5: Commit**

```bash
git add nodes/Acumbamail/descriptions/ListDescription.ts __tests__/unit/ListDescription.test.ts
git commit -m "feat: add ListDescription (11 operations)"
```

---

## Task 6: Subscriber description

**Files:**
- Create: `nodes/Acumbamail/descriptions/SubscriberDescription.ts`
- Create: `__tests__/unit/SubscriberDescription.test.ts`

- [ ] **Step 1: Write failing test**

Create `__tests__/unit/SubscriberDescription.test.ts`:

```typescript
import { subscriberOperations, subscriberFields } from '../../nodes/Acumbamail/descriptions/SubscriberDescription';

describe('SubscriberDescription', () => {
  it('exports subscriberOperations array', () => {
    expect(Array.isArray(subscriberOperations)).toBe(true);
  });

  it('has all 9 expected operations', () => {
    const op = subscriberOperations.find((p) => p.name === 'operation')!;
    const values = (op.options as { value: string }[]).map((o) => o.value);
    expect(values).toEqual(expect.arrayContaining([
      'getAll', 'add', 'delete', 'unsubscribe', 'batchAdd',
      'deleteAll', 'getDetails', 'search', 'getInactive',
    ]));
    expect(values).toHaveLength(9);
  });

  it('listId is required for operations that need it', () => {
    const field = subscriberFields.find((f) => f.name === 'listId')!;
    expect(field.required).toBe(true);
    const ops = field.displayOptions?.show?.operation as string[];
    expect(ops).toEqual(expect.arrayContaining(['getAll', 'add', 'delete', 'unsubscribe', 'batchAdd', 'deleteAll', 'getDetails']));
    expect(ops).not.toContain('search');
  });

  it('email is required for add, delete, unsubscribe, getDetails', () => {
    const emailField = subscriberFields.find((f) => f.name === 'email')!;
    expect(emailField.required).toBe(true);
    const ops = emailField.displayOptions?.show?.operation as string[];
    expect(ops).toEqual(expect.arrayContaining(['add', 'delete', 'unsubscribe', 'getDetails']));
  });

  it('search query field exists and is required', () => {
    const q = subscriberFields.find((f) => f.name === 'searchQuery')!;
    expect(q).toBeDefined();
    expect(q.required).toBe(true);
  });

  it('dateFrom and dateTo are required for getInactive', () => {
    const df = subscriberFields.find((f) => f.name === 'dateFrom')!;
    const dt = subscriberFields.find((f) => f.name === 'dateTo')!;
    expect(df.required).toBe(true);
    expect(dt.required).toBe(true);
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npm test -- --testPathPattern=SubscriberDescription
```

Expected: FAIL — module not found.

- [ ] **Step 3: Write SubscriberDescription.ts**

Create `nodes/Acumbamail/descriptions/SubscriberDescription.ts`:

```typescript
import { INodeProperties } from 'n8n-workflow';

export const subscriberOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['subscriber'] } },
    options: [
      { name: 'Add', value: 'add', description: 'Add a subscriber to a list', action: 'Add a subscriber' },
      { name: 'Batch Add', value: 'batchAdd', description: 'Add multiple subscribers to a list', action: 'Batch add subscribers' },
      { name: 'Delete', value: 'delete', description: 'Permanently delete a subscriber from a list', action: 'Delete a subscriber' },
      { name: 'Delete All', value: 'deleteAll', description: 'Delete all subscribers from a list', action: 'Delete all subscribers from a list' },
      { name: 'Get All', value: 'getAll', description: 'Get all subscribers from a list', action: 'Get all subscribers' },
      { name: 'Get Details', value: 'getDetails', description: 'Get detailed info about a specific subscriber', action: 'Get subscriber details' },
      { name: 'Get Inactive', value: 'getInactive', description: 'Get inactive subscribers within a date range', action: 'Get inactive subscribers' },
      { name: 'Search', value: 'search', description: 'Search for a subscriber across all lists', action: 'Search subscribers' },
      { name: 'Unsubscribe', value: 'unsubscribe', description: 'Unsubscribe a subscriber without deleting them', action: 'Unsubscribe a subscriber' },
    ],
    default: 'getAll',
  },
];

export const subscriberFields: INodeProperties[] = [
  {
    displayName: 'List ID',
    name: 'listId',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['subscriber'],
        operation: ['getAll', 'add', 'delete', 'unsubscribe', 'batchAdd', 'deleteAll', 'getDetails'],
      },
    },
    default: '',
    description: 'ID of the mailing list',
  },
  {
    displayName: 'Email',
    name: 'email',
    type: 'string',
    required: true,
    displayOptions: {
      show: {
        resource: ['subscriber'],
        operation: ['add', 'delete', 'unsubscribe', 'getDetails'],
      },
    },
    default: '',
    placeholder: 'name@email.com',
    description: 'Email address of the subscriber',
  },
  {
    displayName: 'Search Query',
    name: 'searchQuery',
    type: 'string',
    required: true,
    displayOptions: { show: { resource: ['subscriber'], operation: ['search'] } },
    default: '',
    description: 'Email address or search term to find subscribers across all lists',
  },
  {
    displayName: 'Subscribers Data',
    name: 'subscribersData',
    type: 'json',
    required: true,
    displayOptions: { show: { resource: ['subscriber'], operation: ['batchAdd'] } },
    default: '[]',
    description: 'JSON array of subscriber objects, each with at least an "email" key. Example: [{"email":"a@b.com","name":"Alice"}]',
  },
  {
    displayName: 'Date From',
    name: 'dateFrom',
    type: 'dateTime',
    required: true,
    displayOptions: { show: { resource: ['subscriber'], operation: ['getInactive'] } },
    default: '',
    description: 'Start date for inactive subscriber search (YYYY-MM-DD)',
  },
  {
    displayName: 'Date To',
    name: 'dateTo',
    type: 'dateTime',
    required: true,
    displayOptions: { show: { resource: ['subscriber'], operation: ['getInactive'] } },
    default: '',
    description: 'End date for inactive subscriber search (YYYY-MM-DD)',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: { show: { resource: ['subscriber'], operation: ['add'] } },
    default: {},
    options: [
      { displayName: 'Custom Fields', name: 'fields', type: 'fixedCollection', default: {}, typeOptions: { multipleValues: true }, options: [{ displayName: 'Field', name: 'field', values: [{ displayName: 'Key', name: 'key', type: 'string', default: '' }, { displayName: 'Value', name: 'value', type: 'string', default: '' }] }] },
      { displayName: 'Double Opt-In', name: 'double_optin', type: 'boolean', default: false, description: 'Whether to send a confirmation email' },
      { displayName: 'Update If Exists', name: 'update_subscriber', type: 'boolean', default: false, description: 'Whether to update the subscriber if they already exist' },
    ],
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFieldsBatch',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: { show: { resource: ['subscriber'], operation: ['batchAdd'] } },
    default: {},
    options: [
      { displayName: 'Update If Exists', name: 'update_subscriber', type: 'boolean', default: false, description: 'Whether to update subscribers if they already exist' },
    ],
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFieldsGetAll',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: { show: { resource: ['subscriber'], operation: ['getAll'] } },
    default: {},
    options: [
      { displayName: 'All Fields', name: 'all_fields', type: 'boolean', default: false, description: 'Whether to return all subscriber fields' },
      { displayName: 'Block Index', name: 'block_index', type: 'number', default: 0, description: 'Pagination block index (0-based)' },
      { displayName: 'Complete JSON', name: 'complete_json', type: 'boolean', default: false, description: 'Whether to return the complete JSON response' },
    ],
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFieldsInactive',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: { show: { resource: ['subscriber'], operation: ['getInactive'] } },
    default: {},
    options: [
      { displayName: 'Full Info', name: 'full_info', type: 'boolean', default: false, description: 'Whether to return full subscriber details' },
    ],
  },
];
```

- [ ] **Step 4: Run test — expect PASS**

```bash
npm test -- --testPathPattern=SubscriberDescription
```

Expected: PASS — 6 tests passed.

- [ ] **Step 5: Commit**

```bash
git add nodes/Acumbamail/descriptions/SubscriberDescription.ts __tests__/unit/SubscriberDescription.test.ts
git commit -m "feat: add SubscriberDescription (9 operations)"
```

---

## Task 7: Campaign description

**Files:**
- Create: `nodes/Acumbamail/descriptions/CampaignDescription.ts`
- Create: `__tests__/unit/CampaignDescription.test.ts`

- [ ] **Step 1: Write failing test**

Create `__tests__/unit/CampaignDescription.test.ts`:

```typescript
import { campaignOperations, campaignFields } from '../../nodes/Acumbamail/descriptions/CampaignDescription';

describe('CampaignDescription', () => {
  it('has all 13 expected operations', () => {
    const op = campaignOperations.find((p) => p.name === 'operation')!;
    const values = (op.options as { value: string }[]).map((o) => o.value);
    expect(values).toEqual(expect.arrayContaining([
      'getAll', 'create', 'getBasicInfo', 'getTotalInfo', 'getClicks',
      'getOpeners', 'getOpenersByBrowser', 'getOpenersByOs', 'getOpenersByCountry',
      'getSoftBounces', 'getByIsp', 'getLinks', 'getStatsByDate',
    ]));
    expect(values).toHaveLength(13);
  });

  it('campaignId is required for per-campaign operations', () => {
    const field = campaignFields.find((f) => f.name === 'campaignId')!;
    expect(field.required).toBe(true);
    const ops = field.displayOptions?.show?.operation as string[];
    expect(ops).toEqual(expect.arrayContaining([
      'getBasicInfo', 'getTotalInfo', 'getClicks', 'getOpeners',
      'getOpenersByBrowser', 'getOpenersByOs', 'getOpenersByCountry',
      'getSoftBounces', 'getByIsp', 'getLinks',
    ]));
  });

  it('create requires name, subject, content, listIds, fromEmail', () => {
    const required = ['name', 'subject', 'content', 'listIds', 'fromEmail'];
    required.forEach((fname) => {
      const f = campaignFields.find((f) => f.name === fname)!;
      expect(f).toBeDefined();
      expect(f.required).toBe(true);
    });
  });

  it('getStatsByDate requires listId, dateFrom, dateTo', () => {
    const ids = ['statsByDateListId', 'statsByDateFrom', 'statsByDateTo'];
    ids.forEach((fname) => {
      const f = campaignFields.find((f) => f.name === fname)!;
      expect(f).toBeDefined();
      expect(f.required).toBe(true);
    });
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npm test -- --testPathPattern=CampaignDescription
```

- [ ] **Step 3: Write CampaignDescription.ts**

Create `nodes/Acumbamail/descriptions/CampaignDescription.ts`:

```typescript
import { INodeProperties } from 'n8n-workflow';

export const campaignOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['campaign'] } },
    options: [
      { name: 'Create', value: 'create', description: 'Create a new email campaign', action: 'Create a campaign' },
      { name: 'Get All', value: 'getAll', description: 'Get all campaigns', action: 'Get all campaigns' },
      { name: 'Get Basic Info', value: 'getBasicInfo', description: 'Get basic information about a campaign', action: 'Get basic info of a campaign' },
      { name: 'Get By ISP', value: 'getByIsp', description: 'Get campaign statistics grouped by ISP', action: 'Get campaign stats by ISP' },
      { name: 'Get Clicks', value: 'getClicks', description: 'Get click statistics for a campaign', action: 'Get campaign clicks' },
      { name: 'Get Links', value: 'getLinks', description: 'Get all URLs included in a campaign', action: 'Get campaign links' },
      { name: 'Get Openers', value: 'getOpeners', description: 'Get list of subscribers who opened a campaign', action: 'Get campaign openers' },
      { name: 'Get Openers By Browser', value: 'getOpenersByBrowser', description: 'Get opens grouped by browser', action: 'Get campaign openers by browser' },
      { name: 'Get Openers By Country', value: 'getOpenersByCountry', description: 'Get opens grouped by country', action: 'Get campaign openers by country' },
      { name: 'Get Openers By OS', value: 'getOpenersByOs', description: 'Get opens grouped by operating system', action: 'Get campaign openers by OS' },
      { name: 'Get Soft Bounces', value: 'getSoftBounces', description: 'Get soft bounce list for a campaign', action: 'Get campaign soft bounces' },
      { name: 'Get Stats By Date', value: 'getStatsByDate', description: 'Get daily statistics for a list in a date range', action: 'Get campaign stats by date' },
      { name: 'Get Total Info', value: 'getTotalInfo', description: 'Get full statistics for a campaign', action: 'Get campaign total info' },
    ],
    default: 'getAll',
  },
];

const campaignIdOps = [
  'getBasicInfo', 'getTotalInfo', 'getClicks', 'getOpeners',
  'getOpenersByBrowser', 'getOpenersByOs', 'getOpenersByCountry',
  'getSoftBounces', 'getByIsp', 'getLinks',
];

export const campaignFields: INodeProperties[] = [
  {
    displayName: 'Campaign ID',
    name: 'campaignId',
    type: 'string',
    required: true,
    displayOptions: { show: { resource: ['campaign'], operation: campaignIdOps } },
    default: '',
    description: 'ID of the campaign',
  },
  {
    displayName: 'Name',
    name: 'name',
    type: 'string',
    required: true,
    displayOptions: { show: { resource: ['campaign'], operation: ['create'] } },
    default: '',
    description: 'Internal name of the campaign',
  },
  {
    displayName: 'Subject',
    name: 'subject',
    type: 'string',
    required: true,
    displayOptions: { show: { resource: ['campaign'], operation: ['create'] } },
    default: '',
    description: 'Email subject line that recipients will see',
  },
  {
    displayName: 'Content (HTML)',
    name: 'content',
    type: 'string',
    required: true,
    typeOptions: { rows: 5 },
    displayOptions: { show: { resource: ['campaign'], operation: ['create'] } },
    default: '',
    description: 'HTML body of the campaign. Must include *|UNSUBSCRIBE_URL|* placeholder.',
  },
  {
    displayName: 'List IDs',
    name: 'listIds',
    type: 'string',
    required: true,
    displayOptions: { show: { resource: ['campaign'], operation: ['create'] } },
    default: '',
    description: 'Comma-separated list of mailing list IDs to send this campaign to',
  },
  {
    displayName: 'From Email',
    name: 'fromEmail',
    type: 'string',
    required: true,
    displayOptions: { show: { resource: ['campaign'], operation: ['create'] } },
    default: '',
    placeholder: 'sender@example.com',
    description: 'Sender email address',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: { show: { resource: ['campaign'], operation: ['create'] } },
    default: {},
    options: [
      { displayName: 'From Name', name: 'from_name', type: 'string', default: '', description: 'Sender name displayed in the From field' },
      { displayName: 'Schedule Date', name: 'date_send', type: 'dateTime', default: '', description: 'Schedule the campaign for a future date/time (format: YYYY-MM-DD HH:MM)' },
      { displayName: 'Tracking Enabled', name: 'tracking_urls', type: 'boolean', default: true, description: 'Whether to enable click and open tracking' },
      { displayName: 'Tracking Domain', name: 'tracking_domain', type: 'string', default: '', description: 'Custom domain to use for tracking links' },
      { displayName: 'Use HTTPS', name: 'https', type: 'boolean', default: true, description: 'Whether to use HTTPS for tracking links' },
    ],
  },
  {
    displayName: 'List ID',
    name: 'statsByDateListId',
    type: 'string',
    required: true,
    displayOptions: { show: { resource: ['campaign'], operation: ['getStatsByDate'] } },
    default: '',
    description: 'ID of the mailing list to get stats for',
  },
  {
    displayName: 'Date From',
    name: 'statsByDateFrom',
    type: 'dateTime',
    required: true,
    displayOptions: { show: { resource: ['campaign'], operation: ['getStatsByDate'] } },
    default: '',
    description: 'Start date (YYYY-MM-DD)',
  },
  {
    displayName: 'Date To',
    name: 'statsByDateTo',
    type: 'dateTime',
    required: true,
    displayOptions: { show: { resource: ['campaign'], operation: ['getStatsByDate'] } },
    default: '',
    description: 'End date (YYYY-MM-DD)',
  },
];
```

- [ ] **Step 4: Run test — expect PASS**

```bash
npm test -- --testPathPattern=CampaignDescription
```

Expected: PASS — 4 tests passed.

- [ ] **Step 5: Commit**

```bash
git add nodes/Acumbamail/descriptions/CampaignDescription.ts __tests__/unit/CampaignDescription.test.ts
git commit -m "feat: add CampaignDescription (13 operations)"
```

---

## Task 8: Template description

**Files:**
- Create: `nodes/Acumbamail/descriptions/TemplateDescription.ts`
- Create: `__tests__/unit/TemplateDescription.test.ts`

- [ ] **Step 1: Write failing test**

Create `__tests__/unit/TemplateDescription.test.ts`:

```typescript
import { templateOperations, templateFields } from '../../nodes/Acumbamail/descriptions/TemplateDescription';

describe('TemplateDescription', () => {
  it('has all 4 expected operations', () => {
    const op = templateOperations.find((p) => p.name === 'operation')!;
    const values = (op.options as { value: string }[]).map((o) => o.value);
    expect(values).toEqual(expect.arrayContaining(['getAll', 'create', 'duplicate', 'sendCampaign']));
    expect(values).toHaveLength(4);
  });

  it('create requires templateName, htmlContent, subject', () => {
    ['templateName', 'htmlContent', 'subject'].forEach((fname) => {
      const f = templateFields.find((f) => f.name === fname)!;
      expect(f).toBeDefined();
      expect(f.required).toBe(true);
    });
  });

  it('duplicate requires newTemplateName and originTemplateId', () => {
    ['newTemplateName', 'originTemplateId'].forEach((fname) => {
      const f = templateFields.find((f) => f.name === fname)!;
      expect(f).toBeDefined();
      expect(f.required).toBe(true);
    });
  });

  it('sendCampaign requires templateCampaignName, templateCampaignSubject, templateId, templateListIds, templateFromEmail', () => {
    ['templateCampaignName', 'templateCampaignSubject', 'templateId', 'templateListIds', 'templateFromEmail'].forEach((fname) => {
      const f = templateFields.find((f) => f.name === fname)!;
      expect(f).toBeDefined();
      expect(f.required).toBe(true);
    });
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npm test -- --testPathPattern=TemplateDescription
```

- [ ] **Step 3: Write TemplateDescription.ts**

Create `nodes/Acumbamail/descriptions/TemplateDescription.ts`:

```typescript
import { INodeProperties } from 'n8n-workflow';

export const templateOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['template'] } },
    options: [
      { name: 'Create', value: 'create', description: 'Create a new email template', action: 'Create a template' },
      { name: 'Duplicate', value: 'duplicate', description: 'Duplicate an existing template', action: 'Duplicate a template' },
      { name: 'Get All', value: 'getAll', description: 'Get all email templates', action: 'Get all templates' },
      { name: 'Send Campaign', value: 'sendCampaign', description: 'Create and send a campaign from a template', action: 'Send campaign from template' },
    ],
    default: 'getAll',
  },
];

export const templateFields: INodeProperties[] = [
  {
    displayName: 'Template Name',
    name: 'templateName',
    type: 'string',
    required: true,
    displayOptions: { show: { resource: ['template'], operation: ['create'] } },
    default: '',
    description: 'Internal name for the template',
  },
  {
    displayName: 'HTML Content',
    name: 'htmlContent',
    type: 'string',
    required: true,
    typeOptions: { rows: 5 },
    displayOptions: { show: { resource: ['template'], operation: ['create'] } },
    default: '',
    description: 'HTML body of the template. Must include *|UNSUBSCRIBE_URL|* placeholder.',
  },
  {
    displayName: 'Subject',
    name: 'subject',
    type: 'string',
    required: true,
    displayOptions: { show: { resource: ['template'], operation: ['create'] } },
    default: '',
    description: 'Default subject line for campaigns using this template',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: { show: { resource: ['template'], operation: ['create'] } },
    default: {},
    options: [
      { displayName: 'Custom Category', name: 'custom_category', type: 'string', default: '', description: 'Category label for organising templates' },
    ],
  },
  {
    displayName: 'New Template Name',
    name: 'newTemplateName',
    type: 'string',
    required: true,
    displayOptions: { show: { resource: ['template'], operation: ['duplicate'] } },
    default: '',
    description: 'Name for the duplicated template',
  },
  {
    displayName: 'Origin Template ID',
    name: 'originTemplateId',
    type: 'string',
    required: true,
    displayOptions: { show: { resource: ['template'], operation: ['duplicate'] } },
    default: '',
    description: 'ID of the template to duplicate',
  },
  {
    displayName: 'Campaign Name',
    name: 'templateCampaignName',
    type: 'string',
    required: true,
    displayOptions: { show: { resource: ['template'], operation: ['sendCampaign'] } },
    default: '',
    description: 'Internal name for the campaign',
  },
  {
    displayName: 'Subject',
    name: 'templateCampaignSubject',
    type: 'string',
    required: true,
    displayOptions: { show: { resource: ['template'], operation: ['sendCampaign'] } },
    default: '',
    description: 'Email subject line',
  },
  {
    displayName: 'Template ID',
    name: 'templateId',
    type: 'string',
    required: true,
    displayOptions: { show: { resource: ['template'], operation: ['sendCampaign'] } },
    default: '',
    description: 'ID of the template to use for this campaign',
  },
  {
    displayName: 'List IDs',
    name: 'templateListIds',
    type: 'string',
    required: true,
    displayOptions: { show: { resource: ['template'], operation: ['sendCampaign'] } },
    default: '',
    description: 'Comma-separated list of mailing list IDs to send this campaign to',
  },
  {
    displayName: 'From Email',
    name: 'templateFromEmail',
    type: 'string',
    required: true,
    displayOptions: { show: { resource: ['template'], operation: ['sendCampaign'] } },
    default: '',
    placeholder: 'sender@example.com',
    description: 'Sender email address',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFieldsSendCampaign',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: { show: { resource: ['template'], operation: ['sendCampaign'] } },
    default: {},
    options: [
      { displayName: 'From Name', name: 'from_name', type: 'string', default: '', description: 'Sender name displayed in the From field' },
      { displayName: 'Schedule Date', name: 'date_send', type: 'dateTime', default: '', description: 'Schedule the campaign for a future date/time' },
      { displayName: 'Use HTTPS', name: 'https', type: 'boolean', default: true, description: 'Whether to use HTTPS for tracking links' },
    ],
  },
];
```

- [ ] **Step 4: Run test — expect PASS**

```bash
npm test -- --testPathPattern=TemplateDescription
```

Expected: PASS — 4 tests passed.

- [ ] **Step 5: Commit**

```bash
git add nodes/Acumbamail/descriptions/TemplateDescription.ts __tests__/unit/TemplateDescription.test.ts
git commit -m "feat: add TemplateDescription (4 operations)"
```

---

## Task 9: SMTP description

**Files:**
- Create: `nodes/Acumbamail/descriptions/SmtpDescription.ts`
- Create: `__tests__/unit/SmtpDescription.test.ts`

- [ ] **Step 1: Write failing test**

Create `__tests__/unit/SmtpDescription.test.ts`:

```typescript
import { smtpOperations, smtpFields } from '../../nodes/Acumbamail/descriptions/SmtpDescription';

describe('SmtpDescription', () => {
  it('has all 5 expected operations', () => {
    const op = smtpOperations.find((p) => p.name === 'operation')!;
    const values = (op.options as { value: string }[]).map((o) => o.value);
    expect(values).toEqual(expect.arrayContaining(['sendEmail', 'sendBatch', 'sendCertified', 'getStatus', 'getCredits']));
    expect(values).toHaveLength(5);
  });

  it('sendEmail requires toEmail, subject, content, fromEmail', () => {
    ['toEmail', 'emailSubject', 'emailContent', 'fromEmail'].forEach((fname) => {
      const f = smtpFields.find((f) => f.name === fname)!;
      expect(f).toBeDefined();
      expect(f.required).toBe(true);
    });
  });

  it('sendBatch requires messages JSON field', () => {
    const f = smtpFields.find((f) => f.name === 'messages')!;
    expect(f).toBeDefined();
    expect(f.required).toBe(true);
  });

  it('getStatus requires emailKey', () => {
    const f = smtpFields.find((f) => f.name === 'emailKey')!;
    expect(f).toBeDefined();
    expect(f.required).toBe(true);
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npm test -- --testPathPattern=SmtpDescription
```

- [ ] **Step 3: Write SmtpDescription.ts**

Create `nodes/Acumbamail/descriptions/SmtpDescription.ts`:

```typescript
import { INodeProperties } from 'n8n-workflow';

export const smtpOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['smtp'] } },
    options: [
      { name: 'Get Credits', value: 'getCredits', description: 'Get remaining SMTP credits', action: 'Get SMTP credits' },
      { name: 'Get Status', value: 'getStatus', description: 'Get delivery status of a sent email', action: 'Get email status' },
      { name: 'Send Batch', value: 'sendBatch', description: 'Send multiple emails in one request', action: 'Send batch emails' },
      { name: 'Send Certified Email', value: 'sendCertified', description: 'Send a certified email with optional CC/BCC', action: 'Send certified email' },
      { name: 'Send Email', value: 'sendEmail', description: 'Send a single transactional email', action: 'Send a single email' },
    ],
    default: 'sendEmail',
  },
];

export const smtpFields: INodeProperties[] = [
  {
    displayName: 'To Email',
    name: 'toEmail',
    type: 'string',
    required: true,
    displayOptions: { show: { resource: ['smtp'], operation: ['sendEmail', 'sendCertified'] } },
    default: '',
    placeholder: 'recipient@example.com',
    description: 'Recipient email address',
  },
  {
    displayName: 'Subject',
    name: 'emailSubject',
    type: 'string',
    required: true,
    displayOptions: { show: { resource: ['smtp'], operation: ['sendEmail', 'sendCertified'] } },
    default: '',
    description: 'Email subject line',
  },
  {
    displayName: 'Content (HTML)',
    name: 'emailContent',
    type: 'string',
    required: true,
    typeOptions: { rows: 5 },
    displayOptions: { show: { resource: ['smtp'], operation: ['sendEmail', 'sendCertified'] } },
    default: '',
    description: 'HTML body of the email',
  },
  {
    displayName: 'From Email',
    name: 'fromEmail',
    type: 'string',
    required: true,
    displayOptions: { show: { resource: ['smtp'], operation: ['sendEmail', 'sendCertified'] } },
    default: '',
    placeholder: 'sender@example.com',
    description: 'Sender email address',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: { show: { resource: ['smtp'], operation: ['sendEmail', 'sendCertified'] } },
    default: {},
    options: [
      { displayName: 'BCC Email', name: 'bcc_email', type: 'string', default: '', description: 'BCC email address (sendCertified only)' },
      { displayName: 'CC Email', name: 'cc_email', type: 'string', default: '', description: 'CC email address (sendCertified only)' },
      { displayName: 'Category', name: 'category', type: 'string', default: '', description: 'Category label for analytics' },
      { displayName: 'From Name', name: 'from_name', type: 'string', default: '', description: 'Sender name displayed in the From field' },
    ],
  },
  {
    displayName: 'Messages',
    name: 'messages',
    type: 'json',
    required: true,
    displayOptions: { show: { resource: ['smtp'], operation: ['sendBatch'] } },
    default: '[]',
    description: 'JSON array of message objects. Each object must have: to_email, subject, body, from_email.',
  },
  {
    displayName: 'Email Key',
    name: 'emailKey',
    type: 'string',
    required: true,
    displayOptions: { show: { resource: ['smtp'], operation: ['getStatus'] } },
    default: '',
    description: 'Unique key of the sent email (returned by sendEmail or sendCertified)',
  },
];
```

- [ ] **Step 4: Run test — expect PASS**

```bash
npm test -- --testPathPattern=SmtpDescription
```

Expected: PASS — 4 tests passed.

- [ ] **Step 5: Commit**

```bash
git add nodes/Acumbamail/descriptions/SmtpDescription.ts __tests__/unit/SmtpDescription.test.ts
git commit -m "feat: add SmtpDescription (5 operations)"
```

---

## Task 10: Webhook description

**Files:**
- Create: `nodes/Acumbamail/descriptions/WebhookDescription.ts`
- Create: `__tests__/unit/WebhookDescription.test.ts`

- [ ] **Step 1: Write failing test**

Create `__tests__/unit/WebhookDescription.test.ts`:

```typescript
import { webhookOperations, webhookFields } from '../../nodes/Acumbamail/descriptions/WebhookDescription';

describe('WebhookDescription', () => {
  it('has all 4 expected operations', () => {
    const op = webhookOperations.find((p) => p.name === 'operation')!;
    const values = (op.options as { value: string }[]).map((o) => o.value);
    expect(values).toEqual(expect.arrayContaining(['getSmtpConfig', 'setSmtpConfig', 'getListConfig', 'setListConfig']));
    expect(values).toHaveLength(4);
  });

  it('setSmtpConfig requires callbackUrl', () => {
    const f = webhookFields.find((f) => f.name === 'smtpCallbackUrl')!;
    expect(f).toBeDefined();
    expect(f.required).toBe(true);
  });

  it('getListConfig and setListConfig require listId', () => {
    const f = webhookFields.find((f) => f.name === 'webhookListId')!;
    expect(f).toBeDefined();
    expect(f.required).toBe(true);
    const ops = f.displayOptions?.show?.operation as string[];
    expect(ops).toEqual(expect.arrayContaining(['getListConfig', 'setListConfig']));
  });

  it('setListConfig requires listCallbackUrl', () => {
    const f = webhookFields.find((f) => f.name === 'listCallbackUrl')!;
    expect(f).toBeDefined();
    expect(f.required).toBe(true);
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npm test -- --testPathPattern=WebhookDescription
```

- [ ] **Step 3: Write WebhookDescription.ts**

Create `nodes/Acumbamail/descriptions/WebhookDescription.ts`:

```typescript
import { INodeProperties } from 'n8n-workflow';

export const webhookOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['webhook'] } },
    options: [
      { name: 'Get List Config', value: 'getListConfig', description: 'Get webhook configuration for a mailing list', action: 'Get list webhook config' },
      { name: 'Get SMTP Config', value: 'getSmtpConfig', description: 'Get current SMTP webhook configuration', action: 'Get SMTP webhook config' },
      { name: 'Set List Config', value: 'setListConfig', description: 'Configure webhook for a mailing list', action: 'Set list webhook config' },
      { name: 'Set SMTP Config', value: 'setSmtpConfig', description: 'Configure the SMTP webhook', action: 'Set SMTP webhook config' },
    ],
    default: 'getSmtpConfig',
  },
];

export const webhookFields: INodeProperties[] = [
  {
    displayName: 'Callback URL',
    name: 'smtpCallbackUrl',
    type: 'string',
    required: true,
    displayOptions: { show: { resource: ['webhook'], operation: ['setSmtpConfig'] } },
    default: '',
    placeholder: 'https://your-server.com/webhook',
    description: 'URL that Acumbamail will POST events to',
  },
  {
    displayName: 'Active',
    name: 'smtpActive',
    type: 'boolean',
    displayOptions: { show: { resource: ['webhook'], operation: ['setSmtpConfig'] } },
    default: true,
    description: 'Whether the SMTP webhook is active',
  },
  {
    displayName: 'Events',
    name: 'smtpEvents',
    type: 'collection',
    placeholder: 'Add Event',
    displayOptions: { show: { resource: ['webhook'], operation: ['setSmtpConfig'] } },
    default: {},
    options: [
      { displayName: 'Click', name: 'click', type: 'boolean', default: false, description: 'Notify on link clicks' },
      { displayName: 'Complain', name: 'complain', type: 'boolean', default: false, description: 'Notify on spam complaints' },
      { displayName: 'Delivered', name: 'delivered', type: 'boolean', default: false, description: 'Notify on successful delivery' },
      { displayName: 'Hard Bounce', name: 'hard_bounce', type: 'boolean', default: false, description: 'Notify on hard bounces' },
      { displayName: 'Opens', name: 'opens', type: 'boolean', default: false, description: 'Notify on email opens' },
      { displayName: 'Soft Bounce', name: 'soft_bounce', type: 'boolean', default: false, description: 'Notify on soft bounces' },
    ],
  },
  {
    displayName: 'List ID',
    name: 'webhookListId',
    type: 'string',
    required: true,
    displayOptions: { show: { resource: ['webhook'], operation: ['getListConfig', 'setListConfig'] } },
    default: '',
    description: 'ID of the mailing list',
  },
  {
    displayName: 'Callback URL',
    name: 'listCallbackUrl',
    type: 'string',
    required: true,
    displayOptions: { show: { resource: ['webhook'], operation: ['setListConfig'] } },
    default: '',
    placeholder: 'https://your-server.com/webhook',
    description: 'URL that Acumbamail will POST events to',
  },
  {
    displayName: 'Active',
    name: 'listActive',
    type: 'boolean',
    displayOptions: { show: { resource: ['webhook'], operation: ['setListConfig'] } },
    default: true,
    description: 'Whether the list webhook is active',
  },
  {
    displayName: 'Events',
    name: 'listEvents',
    type: 'collection',
    placeholder: 'Add Event',
    displayOptions: { show: { resource: ['webhook'], operation: ['setListConfig'] } },
    default: {},
    options: [
      { displayName: 'Click', name: 'click', type: 'boolean', default: false, description: 'Notify on link clicks' },
      { displayName: 'Complain', name: 'complain', type: 'boolean', default: false, description: 'Notify on spam complaints' },
      { displayName: 'Hard Bounce', name: 'hard_bounce', type: 'boolean', default: false, description: 'Notify on hard bounces' },
      { displayName: 'Opens', name: 'opens', type: 'boolean', default: false, description: 'Notify on email opens' },
      { displayName: 'Soft Bounce', name: 'soft_bounce', type: 'boolean', default: false, description: 'Notify on soft bounces' },
      { displayName: 'Subscribes', name: 'subscribes', type: 'boolean', default: false, description: 'Notify on new subscriptions' },
      { displayName: 'Unsubscribes', name: 'unsubscribes', type: 'boolean', default: false, description: 'Notify on unsubscriptions' },
    ],
  },
];
```

- [ ] **Step 4: Run test — expect PASS**

```bash
npm test -- --testPathPattern=WebhookDescription
```

Expected: PASS — 4 tests passed.

- [ ] **Step 5: Commit**

```bash
git add nodes/Acumbamail/descriptions/WebhookDescription.ts __tests__/unit/WebhookDescription.test.ts
git commit -m "feat: add WebhookDescription (4 operations)"
```

---

## Task 11: Main action node

**Files:**
- Create: `nodes/Acumbamail/Acumbamail.node.ts`

- [ ] **Step 1: Write Acumbamail.node.ts**

Create `nodes/Acumbamail/Acumbamail.node.ts`:

```typescript
import {
  IDataObject,
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
} from 'n8n-workflow';
import { acumbamailApiRequest } from './GenericFunctions';
import { listFields, listOperations } from './descriptions/ListDescription';
import { subscriberFields, subscriberOperations } from './descriptions/SubscriberDescription';
import { campaignFields, campaignOperations } from './descriptions/CampaignDescription';
import { templateFields, templateOperations } from './descriptions/TemplateDescription';
import { smtpFields, smtpOperations } from './descriptions/SmtpDescription';
import { webhookFields, webhookOperations } from './descriptions/WebhookDescription';

export class Acumbamail implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Acumbamail',
    name: 'acumbamail',
    icon: 'file:acumbamail.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with Acumbamail email marketing API',
    defaults: { name: 'Acumbamail' },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [{ name: 'acumbamailApi', required: true }],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          { name: 'Campaign', value: 'campaign' },
          { name: 'List', value: 'list' },
          { name: 'SMTP', value: 'smtp' },
          { name: 'Subscriber', value: 'subscriber' },
          { name: 'Template', value: 'template' },
          { name: 'Webhook', value: 'webhook' },
        ],
        default: 'list',
      },
      ...listOperations,
      ...subscriberOperations,
      ...campaignOperations,
      ...templateOperations,
      ...smtpOperations,
      ...webhookOperations,
      ...listFields,
      ...subscriberFields,
      ...campaignFields,
      ...templateFields,
      ...smtpFields,
      ...webhookFields,
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      const resource = this.getNodeParameter('resource', i) as string;
      const operation = this.getNodeParameter('operation', i) as string;

      let responseData: IDataObject | IDataObject[] = {};

      try {
        if (resource === 'list') {
          responseData = await executeList.call(this, operation, i);
        } else if (resource === 'subscriber') {
          responseData = await executeSubscriber.call(this, operation, i);
        } else if (resource === 'campaign') {
          responseData = await executeCampaign.call(this, operation, i);
        } else if (resource === 'template') {
          responseData = await executeTemplate.call(this, operation, i);
        } else if (resource === 'smtp') {
          responseData = await executeSmtp.call(this, operation, i);
        } else if (resource === 'webhook') {
          responseData = await executeWebhook.call(this, operation, i);
        } else {
          throw new NodeOperationError(this.getNode(), `Unknown resource: ${resource}`);
        }

        const executionData = this.helpers.constructExecutionMetaData(
          this.helpers.returnJsonArray(
            Array.isArray(responseData) ? responseData : [responseData],
          ),
          { itemData: { item: i } },
        );
        returnData.push(...executionData);
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: { error: (error as Error).message },
            pairedItem: { item: i },
          });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}

async function executeList(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  if (operation === 'getAll') {
    return acumbamailApiRequest.call(this, 'getLists') as Promise<IDataObject[]>;
  }
  if (operation === 'create') {
    const senderEmail = this.getNodeParameter('senderEmail', i) as string;
    const name = this.getNodeParameter('name', i) as string;
    const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
    return acumbamailApiRequest.call(this, 'createList', { name, sender_email: senderEmail, ...additionalFields });
  }
  if (operation === 'delete') {
    return acumbamailApiRequest.call(this, 'deleteList', { list_id: this.getNodeParameter('listId', i) });
  }
  if (operation === 'getStats') {
    return acumbamailApiRequest.call(this, 'getListStats', { list_id: this.getNodeParameter('listId', i) });
  }
  if (operation === 'getFields') {
    return acumbamailApiRequest.call(this, 'getListFields', { list_id: this.getNodeParameter('listId', i) });
  }
  if (operation === 'getFieldTypes') {
    return acumbamailApiRequest.call(this, 'getFields', { list_id: this.getNodeParameter('listId', i) });
  }
  if (operation === 'getSegments') {
    return acumbamailApiRequest.call(this, 'getListSegments', { list_id: this.getNodeParameter('listId', i) });
  }
  if (operation === 'getMergeFields') {
    return acumbamailApiRequest.call(this, 'getMergeFields', { list_id: this.getNodeParameter('listId', i) });
  }
  if (operation === 'addMergeTag') {
    return acumbamailApiRequest.call(this, 'addMergeTag', {
      list_id: this.getNodeParameter('listId', i),
      field_name: this.getNodeParameter('fieldName', i),
      field_type: this.getNodeParameter('fieldType', i),
    });
  }
  if (operation === 'getSubsStats') {
    return acumbamailApiRequest.call(this, 'getListSubsStats', {
      list_id: this.getNodeParameter('listId', i),
      block_index: this.getNodeParameter('blockIndex', i),
    });
  }
  if (operation === 'getForms') {
    return acumbamailApiRequest.call(this, 'getForms', { list_id: this.getNodeParameter('listId', i) });
  }
  throw new NodeOperationError(this.getNode(), `Unknown list operation: ${operation}`);
}

async function executeSubscriber(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  if (operation === 'getAll') {
    const listId = this.getNodeParameter('listId', i);
    const fields = this.getNodeParameter('additionalFieldsGetAll', i) as IDataObject;
    return acumbamailApiRequest.call(this, 'getSubscribers', { list_id: listId, ...fields });
  }
  if (operation === 'add') {
    const email = this.getNodeParameter('email', i) as string;
    const listId = this.getNodeParameter('listId', i);
    const additional = this.getNodeParameter('additionalFields', i) as IDataObject;
    const customFields = (additional.fields as { field: { key: string; value: string }[] } | undefined)?.field ?? [];
    const mergeFields: IDataObject = { email };
    customFields.forEach(({ key, value }) => { mergeFields[key] = value; });
    return acumbamailApiRequest.call(this, 'addSubscriber', {
      list_id: listId,
      merge_fields: mergeFields,
      double_optin: additional.double_optin ? 1 : 0,
      update_subscriber: additional.update_subscriber ? 1 : 0,
    });
  }
  if (operation === 'delete') {
    return acumbamailApiRequest.call(this, 'deleteSubscriber', {
      list_id: this.getNodeParameter('listId', i),
      email: this.getNodeParameter('email', i),
    });
  }
  if (operation === 'unsubscribe') {
    return acumbamailApiRequest.call(this, 'unsubscribeSubscriber', {
      list_id: this.getNodeParameter('listId', i),
      email: this.getNodeParameter('email', i),
    });
  }
  if (operation === 'batchAdd') {
    const listId = this.getNodeParameter('listId', i);
    const subscribersData = JSON.parse(this.getNodeParameter('subscribersData', i) as string) as IDataObject[];
    const additional = this.getNodeParameter('additionalFieldsBatch', i) as IDataObject;
    return acumbamailApiRequest.call(this, 'batchAddSubscribers', {
      list_id: listId,
      subscribers_data: subscribersData,
      update_subscriber: additional.update_subscriber ? 1 : 0,
      complete_json: 1,
    });
  }
  if (operation === 'deleteAll') {
    return acumbamailApiRequest.call(this, 'deleteAllSubscribers', { list_id: this.getNodeParameter('listId', i) });
  }
  if (operation === 'getDetails') {
    return acumbamailApiRequest.call(this, 'getSubscriberDetails', {
      list_id: this.getNodeParameter('listId', i),
      subscriber: this.getNodeParameter('email', i),
    });
  }
  if (operation === 'search') {
    return acumbamailApiRequest.call(this, 'searchSubscriber', { subscriber: this.getNodeParameter('searchQuery', i) });
  }
  if (operation === 'getInactive') {
    const additional = this.getNodeParameter('additionalFieldsInactive', i) as IDataObject;
    const dateFrom = new Date(this.getNodeParameter('dateFrom', i) as string);
    const dateTo = new Date(this.getNodeParameter('dateTo', i) as string);
    return acumbamailApiRequest.call(this, 'getInactiveSubscribers', {
      date_from: dateFrom.toISOString().split('T')[0],
      date_to: dateTo.toISOString().split('T')[0],
      full_info: additional.full_info ? 1 : 0,
    });
  }
  throw new NodeOperationError(this.getNode(), `Unknown subscriber operation: ${operation}`);
}

async function executeCampaign(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  if (operation === 'getAll') {
    return acumbamailApiRequest.call(this, 'getCampaigns', { complete_json: 1 });
  }
  if (operation === 'create') {
    const listIdsStr = this.getNodeParameter('listIds', i) as string;
    const listIds = listIdsStr.split(',').map((id) => parseInt(id.trim(), 10));
    const additional = this.getNodeParameter('additionalFields', i) as IDataObject;
    if (additional.date_send) {
      additional.date_send = new Date(additional.date_send as string).toISOString().replace('T', ' ').slice(0, 16);
    }
    return acumbamailApiRequest.call(this, 'createCampaign', {
      name: this.getNodeParameter('name', i),
      subject: this.getNodeParameter('subject', i),
      content: this.getNodeParameter('content', i),
      from_email: this.getNodeParameter('fromEmail', i),
      lists: listIds,
      complete_json: 1,
      ...additional,
    });
  }
  const endpointMap: Record<string, string> = {
    getBasicInfo: 'getCampaignBasicInformation',
    getTotalInfo: 'getCampaignTotalInformation',
    getClicks: 'getCampaignClicks',
    getOpeners: 'getCampaignOpeners',
    getOpenersByBrowser: 'getCampaignOpenersByBrowser',
    getOpenersByOs: 'getCampaignOpenersByOs',
    getOpenersByCountry: 'getCampaignOpenersByCountries',
    getSoftBounces: 'getCampaignSoftBounces',
    getByIsp: 'getCampaignInformationByISP',
    getLinks: 'getCampaignLinks',
  };
  if (endpointMap[operation]) {
    const campaignId = this.getNodeParameter('campaignId', i);
    return acumbamailApiRequest.call(this, endpointMap[operation], { campaign_id: campaignId });
  }
  if (operation === 'getStatsByDate') {
    const dateFrom = new Date(this.getNodeParameter('statsByDateFrom', i) as string);
    const dateTo = new Date(this.getNodeParameter('statsByDateTo', i) as string);
    return acumbamailApiRequest.call(this, 'getStatsByDate', {
      list_id: this.getNodeParameter('statsByDateListId', i),
      date_from: dateFrom.toISOString().split('T')[0],
      date_to: dateTo.toISOString().split('T')[0],
    });
  }
  throw new NodeOperationError(this.getNode(), `Unknown campaign operation: ${operation}`);
}

async function executeTemplate(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  if (operation === 'getAll') {
    return acumbamailApiRequest.call(this, 'getTemplates');
  }
  if (operation === 'create') {
    const additional = this.getNodeParameter('additionalFields', i) as IDataObject;
    return acumbamailApiRequest.call(this, 'createTemplate', {
      template_name: this.getNodeParameter('templateName', i),
      html_content: this.getNodeParameter('htmlContent', i),
      subject: this.getNodeParameter('subject', i),
      custom_category: additional.custom_category ?? '',
    });
  }
  if (operation === 'duplicate') {
    return acumbamailApiRequest.call(this, 'duplicateTemplate', {
      template_name: this.getNodeParameter('newTemplateName', i),
      origin_template_id: this.getNodeParameter('originTemplateId', i),
    });
  }
  if (operation === 'sendCampaign') {
    const listIdsStr = this.getNodeParameter('templateListIds', i) as string;
    const listIds = listIdsStr.split(',').map((id) => parseInt(id.trim(), 10));
    const additional = this.getNodeParameter('additionalFieldsSendCampaign', i) as IDataObject;
    if (additional.date_send) {
      additional.date_send = new Date(additional.date_send as string).toISOString().replace('T', ' ').slice(0, 16);
    }
    return acumbamailApiRequest.call(this, 'sendTemplateCampaign', {
      name: this.getNodeParameter('templateCampaignName', i),
      subject: this.getNodeParameter('templateCampaignSubject', i),
      template_id: this.getNodeParameter('templateId', i),
      from_email: this.getNodeParameter('templateFromEmail', i),
      lists: listIds,
      ...additional,
    });
  }
  throw new NodeOperationError(this.getNode(), `Unknown template operation: ${operation}`);
}

async function executeSmtp(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  if (operation === 'getCredits') {
    return acumbamailApiRequest.call(this, 'getCreditsSMTP');
  }
  if (operation === 'getStatus') {
    return acumbamailApiRequest.call(this, 'getEmailStatus', { email_key: this.getNodeParameter('emailKey', i) });
  }
  if (operation === 'sendBatch') {
    const messages = JSON.parse(this.getNodeParameter('messages', i) as string) as IDataObject[];
    return acumbamailApiRequest.call(this, 'send', { messages });
  }
  if (operation === 'sendEmail' || operation === 'sendCertified') {
    const additional = this.getNodeParameter('additionalFields', i) as IDataObject;
    const endpoint = operation === 'sendEmail' ? 'sendOne' : 'sendCertifiedEmail';
    return acumbamailApiRequest.call(this, endpoint, {
      to_email: this.getNodeParameter('toEmail', i),
      subject: this.getNodeParameter('emailSubject', i),
      body: this.getNodeParameter('emailContent', i),
      from_email: this.getNodeParameter('fromEmail', i),
      ...additional,
    });
  }
  throw new NodeOperationError(this.getNode(), `Unknown smtp operation: ${operation}`);
}

async function executeWebhook(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  if (operation === 'getSmtpConfig') {
    return acumbamailApiRequest.call(this, 'getSMTPWebhook');
  }
  if (operation === 'setSmtpConfig') {
    const events = this.getNodeParameter('smtpEvents', i) as IDataObject;
    return acumbamailApiRequest.call(this, 'configSMTPWebhook', {
      callback_url: this.getNodeParameter('smtpCallbackUrl', i),
      active: (this.getNodeParameter('smtpActive', i) as boolean) ? 1 : 0,
      delivered: events.delivered ? 1 : 0,
      hard_bounce: events.hard_bounce ? 1 : 0,
      soft_bounce: events.soft_bounce ? 1 : 0,
      complain: events.complain ? 1 : 0,
      opens: events.opens ? 1 : 0,
      click: events.click ? 1 : 0,
    });
  }
  if (operation === 'getListConfig') {
    return acumbamailApiRequest.call(this, 'getListWebhook', { list_id: this.getNodeParameter('webhookListId', i) });
  }
  if (operation === 'setListConfig') {
    const events = this.getNodeParameter('listEvents', i) as IDataObject;
    return acumbamailApiRequest.call(this, 'configListWebhook', {
      list_id: this.getNodeParameter('webhookListId', i),
      callback_url: this.getNodeParameter('listCallbackUrl', i),
      active: (this.getNodeParameter('listActive', i) as boolean) ? 1 : 0,
      subscribes: events.subscribes ? 1 : 0,
      unsubscribes: events.unsubscribes ? 1 : 0,
      hard_bounce: events.hard_bounce ? 1 : 0,
      soft_bounce: events.soft_bounce ? 1 : 0,
      complain: events.complain ? 1 : 0,
      opens: events.opens ? 1 : 0,
      click: events.click ? 1 : 0,
    });
  }
  throw new NodeOperationError(this.getNode(), `Unknown webhook operation: ${operation}`);
}
```

- [ ] **Step 2: Build and verify no TypeScript errors**

```bash
npm run build
```

Expected: `dist/` created, no TS errors.

- [ ] **Step 3: Run all unit tests**

```bash
npm test
```

Expected: all unit tests pass.

- [ ] **Step 4: Commit**

```bash
git add nodes/Acumbamail/Acumbamail.node.ts
git commit -m "feat: add main Acumbamail action node (46 operations)"
```

---

## Task 12: Trigger node

**Files:**
- Create: `nodes/AcumbamailTrigger/AcumbamailTrigger.node.ts`

- [ ] **Step 1: Write AcumbamailTrigger.node.ts**

Create `nodes/AcumbamailTrigger/AcumbamailTrigger.node.ts`:

```typescript
import {
  IDataObject,
  IHookFunctions,
  INodeType,
  INodeTypeDescription,
  IWebhookFunctions,
  IWebhookResponseData,
} from 'n8n-workflow';

export class AcumbamailTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Acumbamail Trigger',
    name: 'acumbamailTrigger',
    icon: 'file:acumbamail.svg',
    group: ['trigger'],
    version: 1,
    description: 'Starts the workflow when Acumbamail sends a webhook event. Configure the webhook URL in your Acumbamail account settings.',
    defaults: { name: 'Acumbamail Trigger' },
    inputs: [],
    outputs: ['main'],
    credentials: [],
    webhooks: [
      {
        name: 'default',
        httpMethod: 'POST',
        responseMode: 'onReceived',
        path: 'webhook',
      },
    ],
    properties: [
      {
        displayName: 'Webhook Type',
        name: 'webhookType',
        type: 'options',
        options: [
          { name: 'List Events', value: 'list', description: 'Receive events from a mailing list (subscribe, unsubscribe, bounces, etc.)' },
          { name: 'SMTP Events', value: 'smtp', description: 'Receive events from transactional emails (delivered, bounces, opens, etc.)' },
        ],
        default: 'list',
        description: 'Type of webhook events to receive',
      },
      {
        displayName: 'Setup Instructions',
        name: 'setupNotice',
        type: 'notice',
        default: 'Copy the webhook URL above and paste it into your Acumbamail account under Settings → Webhooks. Select the events you want to receive there.',
      },
    ],
  };

  webhookMethods = {
    default: {
      async checkExists(this: IHookFunctions): Promise<boolean> {
        return true;
      },
      async create(this: IHookFunctions): Promise<boolean> {
        return true;
      },
      async delete(this: IHookFunctions): Promise<boolean> {
        return true;
      },
    },
  };

  async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
    const bodyData = this.getBodyData();
    return {
      workflowData: [
        this.helpers.returnJsonArray([bodyData as IDataObject]),
      ],
    };
  }
}
```

- [ ] **Step 2: Build and verify no TS errors**

```bash
npm run build
```

Expected: `dist/nodes/AcumbamailTrigger/AcumbamailTrigger.node.js` exists.

- [ ] **Step 3: Verify dist contents**

```bash
node -e "
  const pkg = require('./package.json');
  const fs = require('fs');
  [...pkg.n8n.nodes, ...pkg.n8n.credentials].forEach(p => {
    console.log((fs.existsSync(p) ? '✅' : '❌') + ' ' + p);
  });
"
```

Expected: all 3 paths show ✅.

- [ ] **Step 4: Commit**

```bash
git add nodes/AcumbamailTrigger/AcumbamailTrigger.node.ts
git commit -m "feat: add AcumbamailTrigger webhook node"
```

---

## Task 13: Integration tests

**Files:**
- Create: `__tests__/integration/Acumbamail.integration.test.ts`

- [ ] **Step 1: Write integration tests**

Create `__tests__/integration/Acumbamail.integration.test.ts`:

```typescript
/**
 * Integration tests — require ACUMBAMAIL_TOKEN env var.
 * Run: ACUMBAMAIL_TOKEN=your-token npm run test:integration
 *
 * These tests create real resources and clean them up. They use a unique prefix
 * to avoid colliding with existing data.
 */
import { IExecuteFunctions } from 'n8n-workflow';

const TOKEN = process.env.ACUMBAMAIL_TOKEN;
const SKIP = !TOKEN;
const PREFIX = `n8n-test-${Date.now()}`;

if (SKIP) {
  console.log('⚠️  ACUMBAMAIL_TOKEN not set — skipping integration tests');
}

async function makeRequest(endpoint: string, body: Record<string, unknown> = {}): Promise<unknown> {
  const res = await fetch(`https://acumbamail.com/api/1/${endpoint}/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ auth_token: TOKEN, response_type: 'json', ...body }),
  });
  if (!res.ok) throw new Error(`${endpoint}: HTTP ${res.status}`);
  return res.json();
}

describe('Acumbamail Integration', () => {
  let listId: number;
  let campaignId: number;

  beforeAll(async () => {
    if (SKIP) return;
    const senderEmail = process.env.ACUMBAMAIL_SENDER_EMAIL ?? 'test@example.com';
    const res = await makeRequest('createList', {
      name: `${PREFIX}-list`,
      sender_email: senderEmail,
      description: 'n8n integration test list',
    }) as { id: number };
    listId = res.id ?? Number(Object.keys(res)[0]);
    expect(listId).toBeGreaterThan(0);
  });

  afterAll(async () => {
    if (SKIP || !listId) return;
    await makeRequest('deleteList', { list_id: listId }).catch(() => {});
  });

  (SKIP ? test.skip : test)('getLists returns array', async () => {
    const res = await makeRequest('getLists') as unknown[];
    expect(Array.isArray(res)).toBe(true);
  });

  (SKIP ? test.skip : test)('addSubscriber and getSubscriberDetails', async () => {
    const email = `${PREFIX}@example.com`;
    await makeRequest('addSubscriber', {
      list_id: listId,
      merge_fields: { email },
      double_optin: 0,
    });
    const details = await makeRequest('getSubscriberDetails', { list_id: listId, subscriber: email });
    expect(details).toBeDefined();
  });

  (SKIP ? test.skip : test)('searchSubscriber finds added subscriber', async () => {
    const email = `${PREFIX}@example.com`;
    const results = await makeRequest('searchSubscriber', { subscriber: email }) as unknown[];
    expect(results.length).toBeGreaterThan(0);
  });

  (SKIP ? test.skip : test)('getListStats returns stats object', async () => {
    const stats = await makeRequest('getListStats', { list_id: listId });
    expect(stats).toBeDefined();
  });

  (SKIP ? test.skip : test)('getListFields returns array', async () => {
    const fields = await makeRequest('getListFields', { list_id: listId });
    expect(fields).toBeDefined();
  });

  (SKIP ? test.skip : test)('getMergeFields returns result', async () => {
    const fields = await makeRequest('getMergeFields', { list_id: listId });
    expect(fields).toBeDefined();
  });

  (SKIP ? test.skip : test)('getCampaigns returns array', async () => {
    const campaigns = await makeRequest('getCampaigns', { complete_json: 1 }) as unknown[];
    expect(Array.isArray(campaigns)).toBe(true);
  });

  (SKIP ? test.skip : test)('getTemplates returns array', async () => {
    const templates = await makeRequest('getTemplates') as unknown[];
    expect(Array.isArray(templates)).toBe(true);
  });

  (SKIP ? test.skip : test)('getCreditsSMTP returns credits', async () => {
    const res = await makeRequest('getCreditsSMTP') as Record<string, unknown>;
    expect(res).toBeDefined();
  });

  (SKIP ? test.skip : test)('getSMTPWebhook returns config', async () => {
    const config = await makeRequest('getSMTPWebhook');
    expect(config).toBeDefined();
  });

  (SKIP ? test.skip : test)('getListWebhook returns config', async () => {
    const config = await makeRequest('getListWebhook', { list_id: listId });
    expect(config).toBeDefined();
  });
});
```

- [ ] **Step 2: Run unit tests — must still pass**

```bash
npm test
```

Expected: all unit tests pass (integration tests are in a separate pattern and skipped).

- [ ] **Step 3: Commit**

```bash
git add __tests__/integration/Acumbamail.integration.test.ts
git commit -m "feat: add integration tests (require ACUMBAMAIL_TOKEN)"
```

---

## Task 14: Build verification and pre-publish

- [ ] **Step 1: Clean build**

```bash
rm -rf dist && npm run build
```

Expected: `dist/` rebuilt from scratch, no errors.

- [ ] **Step 2: Verify dist completeness**

```bash
node -e "
  const pkg = require('./package.json');
  const fs = require('fs');
  const paths = [...pkg.n8n.nodes, ...pkg.n8n.credentials];
  const svgs = [
    'dist/nodes/Acumbamail/acumbamail.svg',
    'dist/nodes/AcumbamailTrigger/acumbamail.svg',
  ];
  [...paths, ...svgs].forEach(p => {
    console.log((fs.existsSync(p) ? '✅' : '❌') + ' ' + p);
  });
"
```

Expected: all 5 paths show ✅.

- [ ] **Step 3: Run all unit tests**

```bash
npm test
```

Expected: all pass.

- [ ] **Step 4: Dry-run pack**

```bash
npm pack --dry-run
```

Expected: output lists files under `dist/` including `.js`, `.d.ts`, `.svg` files.

- [ ] **Step 5: Update CHANGELOG.md with final 0.1.0 entry**

Ensure `CHANGELOG.md` accurately reflects the final state of 0.1.0.

- [ ] **Step 6: Commit**

```bash
git add CHANGELOG.md
git commit -m "chore: finalize 0.1.0 release — all 46 ops, trigger, tests passing"
```

- [ ] **Step 7: Push to GitHub**

```bash
git push -u origin main
```

- [ ] **Step 8: Publish to npm**

```bash
npm publish --access public
npm pkg fix
```

Expected: package published to npm as `n8n-nodes-acumbamail@0.1.0`.
