class ErrorDescriptions {
  constructor(
    errorCode: string,
    performedAction: string,
    errorDescription?: string,
  ) {
    this.errorCode = errorCode;
    this.performedAction = performedAction;
    this.errorDescription = errorDescription;
  }
  errorCode: string;
  performedAction: string;
  errorDescription?: string;
}

/***** API AND GENERAL ERRORS */

export const CELCOINAPI_AUTOHRIZE_PAYMENT_ERROR = new ErrorDescriptions(
  '101',
  'Authorize Payment - Unhanded Celcoin API Error',
);

export const CELCOINAPI_AUTHORIZE_PAYMENT_UNHANDED_ERROR = new ErrorDescriptions(
  '110',
  'Authorize Payment - Unhanded Error',
);

export const CELCOINAPI_PERFORM_PAYMENT_ERROR = new ErrorDescriptions(
  '104',
  'Perform Payment',
);

export const CELCOINAPI_PERFORM_PAYMENT_UNHANDED_ERROR = new ErrorDescriptions(
  '120',
  'Perform Payment - Unhanded Error',
);

export const CELCOINAPI_CONFIRM_PAYMENT_ERROR = new ErrorDescriptions(
  '103',
  'Confirm Payment',
);

export const CELCOINAPI_CANCEL_PAYMENT_ERROR = new ErrorDescriptions(
  '104',
  'Cancel Payment',
);

export const CELCOINAPI_CONFIRM_PAYMENT_UNHANDED_ERROR = new ErrorDescriptions(
  '130',
  'Confirm Payment - Unhanded Error',
);

export const CELCOINAPI_CANCEL_PAYMENT_UNHANDED_ERROR = new ErrorDescriptions(
  '131',
  'Cancel Payment - Unhanded Error',
);

/***** BD NOT FOUND ERRORS */
const ID_NOT_FOUND_DESCRIPTION = 'Payment ID not found';

export const CELCOINAPI_DB_NOT_FOUND_PAYMENT_ID_PERFORM_PAYMENT = new ErrorDescriptions(
  '201',
  'Perform Payment',
  ID_NOT_FOUND_DESCRIPTION,
);

export const CELCOINAPI_DB_NOT_FOUND_PAYMENT_ID_CONFIRM_PAYMENT = new ErrorDescriptions(
  '202',
  'Confirm Payment',
  ID_NOT_FOUND_DESCRIPTION,
);

export const CELCOINAPI_DB_NOT_FOUND_PAYMENT_ID_CANCEL_PAYMENT = new ErrorDescriptions(
  '203',
  'Cancel Payment',
  ID_NOT_FOUND_DESCRIPTION,
);

/***** BD ERRORS */

export const CELCOINAPI_DB_EXCEPTION_SAVE_PAYMENT = new ErrorDescriptions(
  '301',
  'Save a New Payment',
);

export const CELCOINAPI_DB_EXCEPTION_UPDATE_PAYMENT = new ErrorDescriptions(
  '302',
  'Update Payment',
);

export const CELCOINAPI_DB_EXCEPTION_GET_PAYMENT_BY_ID = new ErrorDescriptions(
  '303',
  'Get Payment by id',
);

export const CELCOINAPI_DB_EXCEPTION_SAVE_PAYMENT_STATUS = new ErrorDescriptions(
  '304',
  'Save a New Payment Status',
);

export const CELCOINAPI_DB_EXCEPTION_GET_STATUS_BY_ID = new ErrorDescriptions(
  '305',
  'Get Status by id',
);
