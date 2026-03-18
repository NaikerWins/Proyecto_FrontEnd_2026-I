import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  Typography,
} from "@mui/material";

interface Action {
  name: string;
  label: string;
  color?: "primary" | "secondary" | "error" | "info" | "success" | "warning";
}

interface GenericTableProps {
  data: Record<string, any>[];
  columns: string[];
  columnNames?: Record<string, string>;
  actions: Action[];
  onAction: (name: string, item: Record<string, any>) => void;
  title?: string;
}

const GenericTable: React.FC<GenericTableProps> = ({
  data,
  columns,
  columnNames = {},
  actions,
  onAction,
  title
}) => {
  const getColumnName = (column: string) => {
    return columnNames[column] || column.charAt(0).toUpperCase() + column.slice(1);
  };

  return (
    <Box>
      {title && (
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
      )}

      <TableContainer component={Paper} elevation={3}>
        <Table sx={{ minWidth: 650 }} aria-label="generic table">
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.main' }}>
              {columns.map((col) => (
                <TableCell
                  key={col}
                  sx={{
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '0.875rem'
                  }}
                >
                  {getColumnName(col)}
                </TableCell>
              ))}
              {actions.length > 0 && (
                <TableCell
                  sx={{
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '0.875rem'
                  }}
                >
                  Acciones
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length > 0 ? (
              data.map((item, index) => (
                <TableRow
                  key={index}
                  sx={{
                    '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                    '&:last-child td, &:last-child th': { border: 0 }
                  }}
                >
                  {columns.map((col) => (
                    <TableCell key={col}>
                      {item[col]}
                    </TableCell>
                  ))}
                  {actions.length > 0 && (
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {actions.map((action) => (
                          <Button
                            key={action.name}
                            variant="contained"
                            size="small"
                            color={action.color}
                            onClick={() => onAction(action.name, item)}
                            sx={{
                              minWidth: 'auto',
                              fontSize: '0.75rem'
                            }}
                          >
                            {action.label}
                          </Button>
                        ))}
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                  align="center"
                  sx={{ py: 3 }}
                >
                  <Typography variant="body2" color="text.secondary">
                    No hay datos disponibles
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default GenericTable;