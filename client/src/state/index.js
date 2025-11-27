import { combineReducers } from "redux";

import authReducer from "./auth/authReducer";
import accountsReducer from "./accounts/accountsReducer";
import usersReducer from "./users/usersReducer";
import reportsReducer from "./reports/reportsReducer";
import adminsReducer from "./admins/adminsReducer";
import powerbiReducer from "./powerbi/powerbiReducer";
import workspacesReducer from "./workspaces/workspacesReducer";
import sectionsReducer from "./sections/sectionsReducer";
import contractsReducer from "./contracts/contractsReducer";
import locationsReducer from "./locations/locationsReducer";
import identificationDocumentsReducer from "./identificationDocuments/identificationDocumentsReducer";
import currenciesReducer from "./currencies/currenciesReducer";
import invoicesReducer from "./invoices/invoicesReducer";
import termsAndConditionsReducer from "./termsAndConditions/termsAndConditionsReducer";
import usersGroupsReducer from "./usersGroups/usersGroupsReducer";
import dashboardsReducer from "./dashboards/dashboardsReducer";
import instancesReducer from "./instances/instancesReducer";
import rolesReducer from "./roles/rolesReducer";
import usersDashboardsReducer from "./usersDashboards/usersDashboardsReducer";

export default combineReducers({
  auth: authReducer,
  accounts: accountsReducer,
  users: usersReducer,
  reports: reportsReducer,
  admins: adminsReducer,
  powerbi: powerbiReducer,
  workspaces: workspacesReducer,
  sections: sectionsReducer,
  contracts: contractsReducer,
  locations: locationsReducer,
  identificationDocuments: identificationDocumentsReducer,
  currencies: currenciesReducer,
  invoices: invoicesReducer,
  termsAndConditions: termsAndConditionsReducer,
  usersGroups: usersGroupsReducer,
  dashboards: dashboardsReducer,
  instances: instancesReducer,
  roles: rolesReducer,
  usersDashboards: usersDashboardsReducer,
});
