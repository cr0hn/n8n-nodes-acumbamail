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
