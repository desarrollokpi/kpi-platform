const axios = require("axios");
const adal = require("adal-node");

const config = {
  username: process.env.POWER_BI_USERNAME,
  password: process.env.POWER_BI_PASSWORD,
  clientId: process.env.POWER_BI_CLIENT_ID,
  resource: process.env.POWER_BI_RESOURCE,
};

async function generateHeaders() {
  const token = await getAccessToken();

  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
  };
}

async function getAccessToken() {
  const authority = "https://login.windows.net/common/oauth2/token";

  let context = new adal.AuthenticationContext(authority, true);

  return new Promise((resolve, reject) => {
    context.acquireTokenWithUsernamePassword(
      config.resource,
      config.username,
      config.password,
      config.clientId,

      (error, accessToken) => {
        if (!error) {
          resolve(accessToken.accessToken);
        } else {
          reject(error);
        }
      }
    );
  });
}

module.exports = {
  generateHeaders,
  getAccessToken,
};
