import React, { useEffect, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import ReportsGroups from "../components/reports/ReportGroups";
import { readReportGroupsByAdmin, readReportsByAdmin } from "../state/reports/reportsActions";
import { readSectionsByAdmin } from "../state/sections/sectionsActions";
import useRead from "./../hooks/useRead";
import Paper from "@mui/material/Paper";
import AddIcon from "@mui/icons-material/Add";
import PositionedButton from "./../components/layout/PositionedButton";
import { useNavigate } from "react-router-dom";
import CreateReportGroupButton from "../components/reports/CreateReportGroupButton";
import { embedDashboard } from "@superset-ui/embedded-sdk";
import axios from "axios";

const TestingPage = () => {
  useRead(readReportGroupsByAdmin, readReportsByAdmin, readSectionsByAdmin);
  const supersetContainer = useRef(null);

  const DASHBOARD_ID = "ec973de1-789b-46a0-84ed-7c3de1fd4684";

  const fetchGuestToken = useCallback(async (dashboardId) => {
    try {
      const { data } = await axios.post("/superset/generate-embedded", {
        dashboardId,
      });

      return data;
    } catch (error) {
      console.error("Error obteniendo embedded info", error);
      return null;
    }
  }, []);

  const generateEmbedded = useCallback(
    async (dashboardId) => {
      const supersetConfig = await fetchGuestToken(dashboardId);

      if (supersetConfig && supersetContainer.current) {
        await embedDashboard({
          id: supersetConfig.dashboardId,
          supersetDomain: supersetConfig.supersetDomain,
          mountPoint: supersetContainer.current,
          fetchGuestToken: () => supersetConfig.token,
          dashboardUiConfig: {
            hideTitle: true,
            hideTab: true,
            hideChartControls: true,
            filters: {
              visible: false,
            },
          },
          // iframeSandboxExtras: ["allow-top-navigation", "allow-popups-to-escape-sandbox"],
          // debug: true,
          // referrerPolicy: "unsafe-url",
        });

        const iframe = supersetContainer.current.querySelector("iframe");

        if (iframe) {
          iframe.style.width = "100%";
          iframe.style.height = "100vh";
        }
      }
    },
    [supersetContainer]
  );

  useEffect(() => {
    generateEmbedded(DASHBOARD_ID);
  }, [generateEmbedded, DASHBOARD_ID]);

  return (
    <Paper className="container">
      <h1>TestingPage</h1>
      <div className="superset-container" ref={supersetContainer}></div>
    </Paper>
  );
};

export default TestingPage;
