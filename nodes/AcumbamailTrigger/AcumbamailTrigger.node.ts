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
