import { defaultErrorMessages } from './error-messages';

describe('ErrorMessages', () => {
  it('can get default error messages', () => {
    const errorMessages = defaultErrorMessages({ pattern: 'A' });
    expect(errorMessages.pattern).toEqual('A');
    expect(errorMessages.required).toEqual('La valeur est requise');
  });
});
