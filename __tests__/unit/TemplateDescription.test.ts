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
