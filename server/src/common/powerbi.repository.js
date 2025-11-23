const POWER_BI_API_BASE_URL = "https://api.powerbi.com/v1.0/myorg";
const powerBiConfig = require("../config/powerbi.config");
const axios = require("axios");

async function read(endPoint) {
  try {
    console.log(`${POWER_BI_API_BASE_URL}${endPoint}`);
    const response = await axios.get(`${POWER_BI_API_BASE_URL}${endPoint}`, await powerBiConfig.generateHeaders());

    return response.data;
  } catch (error) {
    console.log(error.message);
    return [];
  }
}

async function getAccessToken() {
  return await powerBiConfig.getAccessToken();
}

async function getEmbedUrl(groupId, reportId) {
  try {
    const response = await axios.get(`${POWER_BI_API_BASE_URL}/groups/${groupId}/reports/${reportId}`, await powerBiConfig.generateHeaders());

    return response.data.embedUrl;
  } catch (error) {
    console.log(error.message);
  }
}

async function getDataSet(reportId) {
  try {
    const response = await axios.get(`${POWER_BI_API_BASE_URL}/groups/${reportId}`, await powerBiConfig.generateHeaders());

    return response.data.embedUrl;
  } catch (error) {
    console.log(error.message);
  }
}

async function getDataSets() {
  try {
    const response = await axios.get(`${POWER_BI_API_BASE_URL}/groups`, await powerBiConfig.generateHeaders());
    return response.data.value;
  } catch (error) {
    console.log(error.message);
  }
}

async function getReportsInGroup(groupId) {
  try {
    const response = await axios.get(`${POWER_BI_API_BASE_URL}/groups/${groupId}/reports`, await powerBiConfig.generateHeaders());
    return response.data.value;
  } catch (error) {
    console.log(error.message);
  }
}

async function getPagesInReport(reportId) {
  try {
    const response = await axios.get(`${POWER_BI_API_BASE_URL}/reports/${reportId}/pages`, await powerBiConfig.generateHeaders());

    return response.data.value;
  } catch (error) {
    console.log(error.message);
  }
}

module.exports = {
  read,
  getAccessToken,
  getEmbedUrl,
  getReportsInGroup,
  getPagesInReport,
  getDataSet,
  getDataSets,
};
