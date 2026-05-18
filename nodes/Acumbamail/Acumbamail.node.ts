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
    return acumbamailApiRequest.call(this, 'getLists') as unknown as Promise<IDataObject[]>;
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
