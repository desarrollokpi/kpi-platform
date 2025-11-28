import React, { useState, useMemo } from "react";
import { useTheme } from "@mui/material/styles";
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableFooter, TablePagination, TableRow, Paper, IconButton, Switch } from "@mui/material";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import LastPageIcon from "@mui/icons-material/LastPage";
import useResponsive from "../../hooks/useResponsive";

const ROWS_PER_PAGE_OPTIONS = [5, 10, 25, 50];

const TablePaginationActions = (props) => {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (event) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton onClick={handleFirstPageButtonClick} disabled={page === 0} aria-label="first page">
        {theme.direction === "rtl" ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton onClick={handleBackButtonClick} disabled={page === 0} aria-label="previous page">
        {theme.direction === "rtl" ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>
      <IconButton onClick={handleNextButtonClick} disabled={page >= Math.ceil(count / rowsPerPage) - 1} aria-label="next page">
        {theme.direction === "rtl" ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>
      <IconButton onClick={handleLastPageButtonClick} disabled={page >= Math.ceil(count / rowsPerPage) - 1} aria-label="last page">
        {theme.direction === "rtl" ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </Box>
  );
};

const getValueFromPath = (obj, path) => {
  if (!path) return undefined;
  return path.split(".").reduce((acc, part) => (acc && acc[part] != null ? acc[part] : undefined), obj);
};

const formatDateValue = (value) => {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString();
};

const DefaultRow = ({ item, headersConfig, actions }) => (
  <TableRow>
    {headersConfig.map((header, index) => {
      const rawValue = getValueFromPath(item, header.key);
      let content = "";

      if (typeof header.render === "function") {
        content = header.render(rawValue, item);
      } else {
        switch (header.type) {
          case "boolean": {
            const checked = Boolean(rawValue);
            const disabled = typeof header.isToggleDisabled === "function" ? header.isToggleDisabled(item) : false;

            content = <Switch checked={checked} disabled={disabled} onChange={(e) => header.onToggle && header.onToggle(item, e.target.checked)} />;
            break;
          }

          case "date":
            content = formatDateValue(rawValue);
            break;

          case "number":
            content = rawValue != null ? String(rawValue) : "";
            break;

          case "string":
          default:
            content = rawValue != null ? String(rawValue) : "";
            break;
        }
      }

      return (
        <TableCell key={index} align={header.align}>
          {content}
        </TableCell>
      );
    })}

    {actions && actions.length > 0 && (
      <TableCell align="center">
        <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
          {actions
            .filter((action) => (typeof action.hidden === "function" ? !action.hidden(item) : true))
            .map((action, actionIndex) => (
              <IconButton
                key={actionIndex}
                onClick={() => action.onClick(item)}
                disabled={action.disabled ? action.disabled(item) : false}
                color={action.color || "default"}
                size="small"
                title={action.tooltip || ""}
              >
                {action.icon}
              </IconButton>
            ))}
        </Box>
      </TableCell>
    )}
  </TableRow>
);

const PaginatedTable = ({
  headers,
  data,
  renderRow,
  actions,
  size = "small",
  rowsPerPageOptions = ROWS_PER_PAGE_OPTIONS,
  defaultRowsPerPage = 10,
  showPagination = true,
  mode,
  page: controlledPage,
  rowsPerPage: controlledRowsPerPage,
  totalCount,
  onPageChange: onPageChangeCallback,
  onRowsPerPageChange: onRowsPerPageChangeCallback,
}) => {
  const matchMd = useResponsive("md");
  const [internalPage, setInternalPage] = useState(0);
  const [internalRowsPerPage, setInternalRowsPerPage] = useState(defaultRowsPerPage);

  const isServerMode = mode === "server" || (onPageChangeCallback && onRowsPerPageChangeCallback);

  const page = isServerMode ? controlledPage : internalPage;
  const rowsPerPage = isServerMode ? controlledRowsPerPage : internalRowsPerPage;
  const count = isServerMode ? totalCount : data.length;

  const headersConfig = useMemo(() => {
    const inferColumnType = (key, explicitType) => {
      if (explicitType) return explicitType;

      if (!data || data.length === 0) return "string";

      const sampleValue = getValueFromPath(data[0], key);

      if (typeof sampleValue === "boolean") return "boolean";
      if (typeof sampleValue === "number") return "number";
      if (sampleValue instanceof Date) return "date";
      if (typeof sampleValue === "string" && !Number.isNaN(Date.parse(sampleValue))) return "date";

      return "string";
    };

    let resolvedHeaders;

    if (!headers || headers.length === 0) {
      if (data.length > 0) {
        resolvedHeaders = Object.keys(data[0]).map((key) => {
          const type = inferColumnType(key);

          return {
            label: key.charAt(0).toUpperCase() + key.slice(1),
            key,
            align: "left",
            type,
            hideOnMobile: false,
          };
        });
      } else {
        resolvedHeaders = [];
      }
    } else {
      resolvedHeaders = headers.map((header) => {
        if (typeof header === "string") {
          const keyFromLabel = header.toLowerCase().replace(/\s+/g, "");

          if (data.length > 0 && Object.prototype.hasOwnProperty.call(data[0], header)) {
            return {
              label: header,
              key: header,
              align: "left",
              type: inferColumnType(header),
              hideOnMobile: false,
            };
          }

          const matchingKey =
            data.length > 0
              ? Object.keys(data[0]).find((k) => k.toLowerCase() === header.toLowerCase() || k.toLowerCase().replace(/\s+/g, "") === keyFromLabel)
              : null;

          const finalKey = matchingKey || keyFromLabel;

          return {
            label: header,
            key: finalKey,
            align: "left",
            type: inferColumnType(finalKey),
            hideOnMobile: false,
          };
        }

        const rawKey = header.key || header.label.toLowerCase().replace(/\s+/g, "");

        let finalKey = rawKey;
        if (data.length > 0 && !Object.prototype.hasOwnProperty.call(data[0], rawKey)) {
          const matchingKey = Object.keys(data[0]).find((k) => k.toLowerCase() === rawKey.toLowerCase());
          finalKey = matchingKey || rawKey;
        }

        const inferredType = inferColumnType(finalKey, header.type);

        return {
          ...header,
          label: header.label,
          key: finalKey,
          align: header.align || "center",
          type: inferredType || "string",
          hideOnMobile: Boolean(header.hideOnMobile),
        };
      });
    }

    if (!matchMd) {
      return resolvedHeaders.filter((h) => !h.hideOnMobile);
    }

    return resolvedHeaders;
  }, [headers, data, matchMd]);

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - count) : 0;

  const handleChangePage = (event, newPage) => {
    if (isServerMode) {
      onPageChangeCallback(newPage);
    } else {
      setInternalPage(newPage);
    }
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    if (isServerMode) {
      onRowsPerPageChangeCallback(newRowsPerPage);
    } else {
      setInternalRowsPerPage(newRowsPerPage);
      setInternalPage(0);
    }
  };

  const paginatedData = isServerMode
    ? data
    : showPagination
    ? rowsPerPage > 0
      ? data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      : data
    : data;

  const hasActions = actions && actions.length > 0;
  const totalColumns = headersConfig.length + (hasActions ? 1 : 0);

  const defaultRenderRow = (item, index) => <DefaultRow key={index} item={item} headersConfig={headersConfig} actions={actions} />;

  // Pasamos headersConfig como tercer argumento (no rompe funciones que solo usen 2)
  const rowRenderer = renderRow || defaultRenderRow;

  return (
    <TableContainer component={Paper}>
      <Table size={size}>
        <TableHead>
          <TableRow sx={{ fontWeight: "bold" }}>
            {headersConfig.map((header, index) => (
              <TableCell key={index} sx={{ fontWeight: "bold" }} align={header.align}>
                {header.label}
              </TableCell>
            ))}
            {hasActions && (
              <TableCell sx={{ fontWeight: "bold" }} align="center">
                Acciones
              </TableCell>
            )}
          </TableRow>
        </TableHead>

        <TableBody>
          {paginatedData.map((item, index) => rowRenderer(item, index, headersConfig))}
          {showPagination && emptyRows > 0 && (
            <TableRow style={{ height: (size === "small" ? 33 : 53) * emptyRows }}>
              <TableCell colSpan={totalColumns} />
            </TableRow>
          )}
        </TableBody>

        {showPagination && (
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={rowsPerPageOptions}
                colSpan={totalColumns}
                count={count}
                rowsPerPage={rowsPerPage}
                page={page}
                labelRowsPerPage={"Elementos por página"}
                slotProps={{
                  select: {
                    inputProps: {
                      "aria-label": "Elementos por página",
                    },
                    native: true,
                  },
                }}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                ActionsComponent={TablePaginationActions}
              />
            </TableRow>
          </TableFooter>
        )}
      </Table>
    </TableContainer>
  );
};

export default PaginatedTable;
