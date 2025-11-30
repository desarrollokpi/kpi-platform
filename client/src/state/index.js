import { combineReducers } from "redux";

import authReducer from "./auth/authReducer";
import accountsReducer from "./accounts/accountsReducer";
import usersReducer from "./users/usersReducer";
import reportsReducer from "./reports/reportsReducer";
import workspacesReducer from "./workspaces/workspacesReducer";
import dashboardsReducer from "./dashboards/dashboardsReducer";
import instancesReducer from "./instances/instancesReducer";
import rolesReducer from "./roles/rolesReducer";
import usersDashboardsReducer from "./usersDashboards/usersDashboardsReducer";

export default combineReducers({
  auth: authReducer,
  accounts: accountsReducer,
  users: usersReducer,
  reports: reportsReducer,
  workspaces: workspacesReducer,
  dashboards: dashboardsReducer,
  instances: instancesReducer,
  roles: rolesReducer,
  usersDashboards: usersDashboardsReducer,
});
