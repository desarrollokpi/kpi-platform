import React from "react";
import AdminAccount from "../../components/accounts/AdminAccount";
import useRead from "../../hooks/useRead";
import { readReportsByAdmin } from "../../state/reports/reportsActions";
import { readLogo } from "../../state/admins/adminsActions";
import { readContractByAdmin } from "../../state/contracts/contractsActions";
import { readIdentificationDocuments } from "../../state/identificationDocuments/identificationDocumentsActions";
import { readCurrencies } from "../../state/currencies/currenciesActions";
import { readCountries, readRegions, readZones } from "../../state/locations/locationsActions";

const AccountPage = () => {
  useRead(readReportsByAdmin, readLogo, readContractByAdmin, readCountries, readRegions, readZones, readCurrencies, readIdentificationDocuments);

  return <AdminAccount />;
};

export default AccountPage;
