import React from "react";
import MuiAlert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { useSelector } from "react-redux";

const Alerts = () => {
  const { message } = useSelector((state) => state.auth);

  if (!message) {
    return null;
  }

  return (
    <Box my={2}>
      <Stack alignItems="center">
        <MuiAlert severity={message.severity || "error"}>{message.text}</MuiAlert>
      </Stack>
    </Box>
  );
};

export default Alerts;
