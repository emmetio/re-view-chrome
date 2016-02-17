/**
 * Handle donation routines
 */
'use strict';

const currencies = {
    USD: '$',
    EUR: '€',
    RUB: ' руб.'
};

export function getData() {
    return Promise.all([getProduct(), isDonated()])
    .then(values => {
        var [product, donated] = values;
        return {product, donated};
    });
}

export function handler() {
    return sendMessage('donate');
}

export function isDonated() {
    return sendMessage('is-donated').catch(err => {
        console.error('donation check error', err);
        return false;
    });
}

/**
 * Check if user donated. Since this request is made before displaying UI,
 * we chould not block user for too long (in case if request takes too much time)
 */
export function checkDonated() {
    return Promise.race([
        isDonated(),
        new Promise(resolve => setTimeout(() => resolve(null), 1000))
    ]);
}

export function getProduct() {
    return sendMessage('get-donation-data').then(product => {
        var price = product.prices[0];
        var currency = currencies[price.currencyCode] || ` ${price.currencyCode}`;
        return {
            ...product,
            price: formatNum(price.valueMicros / 1000000) + currency
        };
    });
}

function formatNum(num) {
    return num.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}

function sendMessage(action, data) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({action, data}, response => {
            if (typeof response === 'undefined') {
                return reject(chrome.runtime.lastError);
            }

            response.error ? reject(response.error) : resolve(response.data);
        });
    });
}
