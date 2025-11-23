async function getEmbedUrl(groupId, reportId) {
  try {
    const response = await axios.get(`${POWER_BI_API_BASE_URL}/groups/${groupId}/reports/${reportId}`, await generateHeaders());

    return response.data.embedUrl;
  } catch (error) {
    console.log(error.message);
  }
}

async function getDataSet(reportId) {
  try {
    const response = await axios.get(`${POWER_BI_API_BASE_URL}/groups/${reportId}`, await generateHeaders());

    return response.data.embedUrl;
  } catch (error) {
    console.log(error.message);
  }
}

async function getDataSets() {
  try {
    const response = await axios.get(`${POWER_BI_API_BASE_URL}/groups`, await generateHeaders());
    return response.data.value;
  } catch (error) {
    console.log(error.message);
  }
}

async function getReportsInGroup(groupId) {
  try {
    const response = await axios.get(`${POWER_BI_API_BASE_URL}/groups/${groupId}/reports`, await generateHeaders());
    return response.data.value;
  } catch (error) {
    console.log(error.message);
  }
}

async function getPagesInReport(reportId) {
  try {
    const response = await axios.get(`${POWER_BI_API_BASE_URL}/reports/${reportId}/pages`, await generateHeaders());

    return response.data.value;
  } catch (error) {
    console.log(error.message);
  }
}

module.exports = {
  getEmbedUrl,
  getReportsInGroup,
  getPagesInReport,
  getDataSet,
  getDataSets,
};
