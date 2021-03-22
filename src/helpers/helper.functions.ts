import * as moment from 'moment';

export function getDateFromStringDDMMYYYY(date: string): Date {
  if (!date || date == null) {
    return null;
  }

  const varDate = moment(date, 'DD/MM/YYYY').toDate();
  return varDate;
}

export function getDateFromStringISO(date: string): Date {
  if (!date || date == null) {
    return null;
  }

  const varDate = moment(date, 'YYYY-MM-DD').toDate();
  return varDate;
}

export function getDateNow(): Date {
  return new Date(Date.now());
}

export function getNumbersFromString(str: string) {
  const res = str.replace(/\D/g, '');
  return res;
}

export function getInterfaceObject(object: any, reduced: any): any {
  var reducer = require('lodash');
  return reducer.assign(reduced, reducer.pick(object, reducer.keys(reduced)));
}
