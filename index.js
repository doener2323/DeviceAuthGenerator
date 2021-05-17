const axios = require('axios');
const fs = require('fs');
const path = require('path');
const open = require('open');

class DeviceAuthGenerator {

    get directory() {
        return `${path.dirname(require.main.filename)}`;
    }

    constructor() {

        this.config = require(`${this.directory}\\config`)
    }


    /**
     * Make a request with axios.
     * @param {string} method Request method.
     * @param {string} url URL to request.
     * @param {string} payload Payload in request.
     * @param {JSON} headers Headers in request.
     * @returns {string}
     */
    async makeRequest(method, url, payload, headers) {
        var req = await axios.request(
            {
                method: method,
                url: url,
                data: payload,
                headers: headers || {
                    'User-Agent': this.config.userAgent
                }
            }
        ).catch((err) => {
            return err.response;
        });
        return req;
    }

    /**
     * Generates a access token.
     * @returns {string}
     */
    async getAccessToken(){
        var req = await this.makeRequest(
            'POST',
            this.config.endpoints.OAuth,
            'grant_type=client_credentials',
            {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': this.config.userAgent,
                Authorization: `basic ${this.config.clientToken}`
            }
        ).catch((err) => {
            console.log(err);
            return err.response;
        });
        return req.data;
    }

    /**
     * Creates a device Code.
     * @returns {JSON}
     * @param {string} accessToken Used access Token to authorize.
     */
    async createDeviceCode(accessToken) {
        var req = await this.makeRequest(
            'POST',
            this.config.endpoints.deviceCode,
            'prompt=login',
            {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': this.config.userAgent,
                Authorization: `bearer ${accessToken.access_token}`
            }
        ).catch((err) => {
            console.log(err);
            return err.response;
        });
        return req.data;
    }

    /**
     * Await device Code authorization.
     * @returns {JSON}
     * @param {string} deviceCode Used device Code to check the authorization for.
     */
    async awaitAuthorization(deviceCode) {
        console.log("Awaiting authorization.")
        while (true) {
            var req = await this.makeRequest(
                "POST",
                this.config.endpoints.OAuth,
                `grant_type=device_code&device_code=${deviceCode.device_code}`,
                {
                    "Content-Type": "application/x-www-form-urlencoded",
                    'User-Agent': this.config.userAgent,
                    Authorization: `basic ${this.config.switchToken}`
                }
            ).catch( {
                
            });
            if (req.status === 200) {
                break;
            }
            else {
                if (req.data.errorCode === 'errors.com.epicgames.not_found') {
                    console.log("Device code not found, time probably ran out.")
                    return;
                }
                else {
                    
                }
            }
        }

        var exchangeCode = await this.makeRequest(
            "GET",
            this.config.endpoints.exchangeCode,
            null,
            {
                Authorization: `bearer ${req.data.access_token}`
            }
        )

        var request = await this.makeRequest(
            "POST",
            this.config.endpoints.OAuth,
            `grant_type=exchange_code&exchange_code=${exchangeCode.data.code}`,
            {
                Authorization: `basic ${this.config.iosToken}`,
                'User-Agent': this.config.userAgent,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
        )
        return request;
    }

    /**
     * Await device Code authorization.
     * @returns {JSON}
     * @param {string} accessToken Used access Token for authorization.
     * @param {string} accountId Account Id to generate the device Auths for the right account.
     * @param {string} displayName Display Name of account.
     * 
     */
    async createDeviceAuths(accountId, accessToken, displayName) {
        var req = await this.makeRequest(
            "POST",
            this.config.endpoints.deviceAuth.replace("{0}", accountId),
            null,
            {
                Authorization: `bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'User-Agent': this.config.userAgent
            }
        )
        return {
            deviceId: req.data.deviceId,
            accountId: req.data.accountId,
            secret: req.data.secret,
            userAgent: req.data.userAgent,
            displayName: displayName,
            created: {
                location: req.data.created.location,
                ipAddress: req.data.created.ipAddress,
                datetime: req.data.created.dateTime,
            }
        }
    }

    /**
     * Await device Code authorization.
     * @param {JSON} deviceAuths Data to be saved
     */
    async saveDeviceAuths(deviceAuths) {
        await fs.writeFileSync(
            `${this.directory}\\accounts\\${deviceAuths.displayName}.json`,
            JSON.stringify(deviceAuths, null, 3), 
        )
        console.log(`Saved device Auths for ${deviceAuths.displayName} (${deviceAuths.accountId}) in ${this.directory}\\accounts\\${deviceAuths.displayName}.json`)
    }

    async start() {
        var accessToken = await this.getAccessToken();
        console.log("DeviceAuthGenerator made by doener. Credits to xMistt / Oli for inspiration.");

        console.log('Opening device code link in a new tab.')
        var deviceCode = await this.createDeviceCode(accessToken);
        await open(deviceCode.verification_uri_complete);
        var authorization = await this.awaitAuthorization(deviceCode);
        var deviceAuths = await this.createDeviceAuths(authorization.data.account_id, authorization.data.access_token, authorization.data.displayName);
        await this.saveDeviceAuths(deviceAuths);
    }


    /**
     * Init function
     */
    init() {
        this.start();
    }

}

const DeviceAuthGen = new DeviceAuthGenerator();
DeviceAuthGen.init();