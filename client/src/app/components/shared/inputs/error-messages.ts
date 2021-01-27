export interface ErrorMessages<t> {
  pattern?: t;
  required?: t;
  maxlength?: t;
  minlength?: t;
  max?: t;
  min?: t;

  [key: string]: t | undefined;
}

export const defaultErrorMessages = (errorMessages: ErrorMessages<string> = {}): ErrorMessages<string> => {
  return {
    pattern: errorMessages.pattern || 'La valeur doit être conforme au patron',
    required: errorMessages.required || 'La valeur est requise',
    maxlength: errorMessages.maxlength || 'La chaîne doit être plus petite',
    minlength: errorMessages.minlength || 'La chaîne doit être plus grande',
    max: errorMessages.max || 'La valeur doit être plus petite',
    min: errorMessages.min || 'La valeur doit être plus grande',
  };
};
