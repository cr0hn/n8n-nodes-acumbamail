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
