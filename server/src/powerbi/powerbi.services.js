const powerbiRepository = require("../common/powerbi.repository");

const getAccessToken = async () => {
  return await powerbiRepository.getAccessToken();
};

async function getEmbedUrl(groupId, reportId) {
  return await powerbiRepository.getEmbedUrl(groupId, reportId);
}

async function getDataSet(reportId) {
  return await powerbiRepository.getDataSet(reportId);
}

async function getDataSets() {
  return await powerbiRepository.getDataSets();
}

async function getReportsInGroup(groupId) {
  return await powerbiRepository.getReportsInGroup(groupId);
}

async function getPagesInReport(reportId) {
  return await powerbiRepository.getPagesInReport(reportId);
}

module.exports = {
  getAccessToken,
  getEmbedUrl,
  getReportsInGroup,
  getPagesInReport,
  getDataSet,
  getDataSets,
};
