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
