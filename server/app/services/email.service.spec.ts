import { expect } from 'chai';
import { describe, beforeEach } from 'mocha';
import { testingContainer } from '../../test/test-utils';
import Types from '../types';

import { EmailService } from './email.service';

describe('Email Service', () => {
  let emailService: EmailService;

  beforeEach(async () => {
    await testingContainer().then((instance) => {
      emailService = instance[0].get<EmailService>(Types.EmailService);
    });
  });

  it('should instanciate correctly', (done: Mocha.Done) => {
    expect(emailService).to.be.instanceOf(EmailService);
    done();
  });
});
