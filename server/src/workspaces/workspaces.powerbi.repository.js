const powerBiRepository = require("../common/powerbi.repository");

exports.readWorkspaces = async (workspaces) => {
  const filter = workspaces.map((workspace) => `id eq '${workspace}'`).join(" or ");

  const response = await powerBiRepository.read(`/groups?$filter=${filter}`);

  if (!response.value) return [];

  return response.value;
};
