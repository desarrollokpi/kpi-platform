const instancesServices = require("./instances.services");

exports.createIntance = async (req, res, next) => {
  try {
    const { name, baseUrl, apiUserName, apiPassword, accountIds } = req.body;

    const intance = await instancesServices.createIntance({
      name,
      baseUrl,
      apiUserName,
      apiPassword,
      accountIds,
    });

    res.status(201).json({
      message: "Instancia creada exitosamente",
      intance,
    });
  } catch (error) {
    next(error);
  }
};

exports.getIntanceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const intance = await instancesServices.getIntanceById(parseInt(id));

    res.json({ intance });
  } catch (error) {
    next(error);
  }
};

exports.getAllInstances = async (req, res, next) => {
  try {
    const { active, limit, offset, listed = "false", mode, accountId } = req.query;

    const isSelectMode = mode === "select" || listed === "true";

    if (isSelectMode) {
      const list = await instancesServices.getInstancesForSelect({ accountId });
      return res.json(list);
    }

    const options = {};
    if (active !== undefined) options.active = active === "true";
    if (limit) options.limit = parseInt(limit);
    if (offset) options.offset = parseInt(offset);
    if (accountId) options.accountId = parseInt(accountId);

    const instances = await instancesServices.getAllInstances(options);

    const totalCount =
      limit || offset
        ? await instancesServices.getIntanceCount({
            active: options.active,
            accountId: options.accountId,
          })
        : instances.length;

    res.json({ instances, count: instances.length, totalCount });
  } catch (error) {
    next(error);
  }
};

exports.updateIntance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, baseUrl, apiUserName, apiPassword, accountIds } = req.body;

    const parsedId = parseInt(id, 10);

    console.log("asdfkljasldkfhalskdfhalsdf");

    const intance = await instancesServices.updateIntance(parsedId, {
      name,
      baseUrl,
      apiUserName,
      apiPassword,
      accountIds,
    });

    res.json({
      message: "Instancia actualizada exitosamente",
      intance,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteIntance = async (req, res, next) => {
  try {
    const { id } = req.params;

    await instancesServices.deleteIntance(parseInt(id));

    res.json({
      message: "Instancia eliminada exitosamente",
    });
  } catch (error) {
    next(error);
  }
};

exports.activateIntance = async (req, res, next) => {
  try {
    const { id } = req.params;

    const intance = await instancesServices.activateIntance(parseInt(id));

    res.json({
      message: "Instancia activada exitosamente",
      intance,
    });
  } catch (error) {
    next(error);
  }
};

exports.deactivateIntance = async (req, res, next) => {
  try {
    const { id } = req.params;

    const intance = await instancesServices.deactivateIntance(parseInt(id));

    res.json({
      message: "Instancia desactivada exitosamente",
      intance,
    });
  } catch (error) {
    next(error);
  }
};

exports.getInstancesByAccount = async (req, res, next) => {
  try {
    const { accountId } = req.params;

    const instances = await instancesServices.getInstancesByAccount(parseInt(accountId));

    res.json({ instances, count: instances.length });
  } catch (error) {
    next(error);
  }
};

exports.getAccountsByIntance = async (req, res, next) => {
  try {
    const { id } = req.params;

    const accounts = await instancesServices.getAccountsByIntance(parseInt(id));

    res.json({ accounts, count: accounts.length });
  } catch (error) {
    next(error);
  }
};
