import { registerAs } from '@nestjs/config';

export default registerAs('celcoinApi', () => {
    
    const base_api_url: string = process.env.NODE_ENV = 'development' ? 'https://sandbox-apicorp.celcoin.com.br' : '';
    const current_version: string = '/v5';
    const billpayment_base_url: string = '/transactions/billpayments';

    function setBaseUrl(urlEndPoint: string, baseUrlEndPoint?: string): string {
        if(!baseUrlEndPoint) {
            baseUrlEndPoint = '';
        }
       return base_api_url + current_version + baseUrlEndPoint + urlEndPoint;
    }
    
    return {
        current_version,
        services_endpoints: {
            auth_token_url: setBaseUrl('/token'),
            authorize_billpayment_url: setBaseUrl('/authorize', billpayment_base_url),
            perform_billpyment_url: setBaseUrl('', billpayment_base_url),
            confirm_billpayment_url: setBaseUrl('/{transactionId}/capture', billpayment_base_url),
            cancel_billpayment_url: setBaseUrl('/{transactionId}/void', billpayment_base_url),
            reverse_billpayment_url: setBaseUrl('/{transactionId}/reverse', billpayment_base_url),
        },
    };

});