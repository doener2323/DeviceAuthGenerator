const os = require('os');

module.exports = {

    userAgent: `DeviceAuthGenerator/1.0.0 ${os.type()}/${os.release()}`,

    clientToken: "YjA3MGYyMDcyOWY4NDY5M2I1ZDYyMWM5MDRmYzViYzI6SEdAWEUmVEdDeEVKc2dUIyZfcDJdPWFSbyN+Pj0+K2M2UGhSKXpYUA==",
    switchToken: "NTIyOWRjZDNhYzM4NDUyMDhiNDk2NjQ5MDkyZjI1MWI6ZTNiZDJkM2UtYmY4Yy00ODU3LTllN2QtZjNkOTQ3ZDIyMGM3",
    iosToken: "MzQ0NmNkNzI2OTRjNGE0NDg1ZDgxYjc3YWRiYjIxNDE6OTIwOWQ0YTVlMjVhNDU3ZmI5YjA3NDg5ZDMxM2I0MWE=",

    endpoints: {
        OAuth: "https://account-public-service-prod03.ol.epicgames.com/account/api/oauth/token",
        deviceCode: "https://account-public-service-prod03.ol.epicgames.com/account/api/oauth/deviceAuthorization",
        exchangeCode: "https://account-public-service-prod03.ol.epicgames.com/account/api/oauth/exchange",
        deviceAuth: "https://account-public-service-prod.ol.epicgames.com/account/api/public/account/{0}/deviceAuth"
    }

}