import React from "react";
import { Grid, IconButton, Collapse, ListItem, ListItemText, Typography, ListItemSecondaryAction } from "@mui/material";
import ActiveIndicator from "../layout/ActiveIndicator";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import ReportsTable from "./ReportsTable";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import useResponsive from "./../../hooks/useResponsive";
import ReportGroupSectionsTable from "../sections/ReportGroupSectionsTable";
import CircularLoading from "@layout/CircularLoading";

const ReportGroupsItem = ({ reportsGroup }) => {
  const { sections, loading: sectionsLoading } = useSelector((state) => state.sections);
  const navigate = useNavigate();
  const matchMd = useResponsive("md");

  const [open, setOpen] = React.useState(false);

  const handleToggleCollapse = () => {
    setOpen(!open);
  };

  const handleEdit = () => {
    navigate(`/admins/reports-groups/update/${reportsGroup.id}`);
  };

  return (
    <>
      <ListItem dense>
        <Grid container alignItems="center" justifyContent="center">
          {matchMd && (
            <Grid item md={4}>
              <ListItemText>
                <Typography variant="body1">{reportsGroup.code}</Typography>
              </ListItemText>
            </Grid>
          )}

          <Grid item xs={9} md={4}>
            <ListItemText>
              <Typography variant="body1">{reportsGroup.name}</Typography>
            </ListItemText>
          </Grid>

          {matchMd && (
            <>
              <Grid item md={2}>
                <ListItemText>
                  <Typography variant="body1">{reportsGroup.sections.length}</Typography>
                </ListItemText>
              </Grid>
              <Grid item md={1}>
                <ListItemText>
                  <ActiveIndicator active={reportsGroup.active} />
                </ListItemText>
              </Grid>
            </>
          )}

          <Grid item xs={3} md={1}>
            <ListItemSecondaryAction>
              <IconButton onClick={handleToggleCollapse} disabled={reportsGroup.sections.length === 0}>
                <VisibilityIcon color={reportsGroup.sections.length === 0 ? "grey" : "primary"} />
              </IconButton>

              <IconButton onClick={handleEdit}>
                <EditIcon color="success" />
              </IconButton>
            </ListItemSecondaryAction>
          </Grid>
        </Grid>
      </ListItem>

      <Collapse in={open} timeout="auto" unmountOnExit>
        {sectionsLoading && sections.length === 0 ? <CircularLoading /> : <ReportGroupSectionsTable sections={reportsGroup.sections} />}
      </Collapse>
    </>
  );
};

export default ReportGroupsItem;
