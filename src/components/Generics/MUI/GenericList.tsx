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
  Chip,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import { Edit, Delete, Visibility } from "@mui/icons-material";

interface Action {
  name: string;
  label: string;
  color?: "primary" | "secondary" | "error" | "warning" | "info" | "success";
  variant?: "text" | "outlined" | "contained";
  icon?: React.ReactNode;
}

interface GenericTableProps {
  data: Record<string, any>[];
  columns: string[];
  actions: Action[];
  onAction: (name: string, item: Record<string, any>) => void;
  title?: string;
}

const GenericTable: React.FC<GenericTableProps> = ({ 
  data, 
  columns, 
  actions, 
  onAction,
  title 
}) => {
  const getActionIcon = (actionName: string) => {
    switch (actionName) {
      case "edit": return <Edit />;
      case "delete": return <Delete />;
      case "view": return <Visibility />;
      default: return null;
    }
  };

  return (
    <Box>
      {title && (
        <Typography variant="h5" component="h2" gutterBottom>
          {title}
        </Typography>
      )}
      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.main' }}>
              {columns.map((col) => (
                <TableCell 
                  key={col} 
                  align="center" 
                  sx={{ fontWeight: 'bold', color: 'white' }}
                >
                  {col.toUpperCase()}
                </TableCell>
              ))}
              <TableCell 
                align="center" 
                sx={{ fontWeight: 'bold', color: 'white' }}
              >
                ACCIONES
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length > 0 ? (
              data.map((item, index) => (
                <TableRow key={index} hover>
                  {columns.map((col) => (
                    <TableCell key={col} align="center">
                      {item[col] || '-'}
                    </TableCell>
                  ))}
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                      {actions.map((action) => (
                        <Button
                          key={action.name}
                          variant={action.variant || "outlined"}
                          color={action.color || "primary"}
                          size="small"
                          onClick={() => onAction(action.name, item)}
                          startIcon={getActionIcon(action.name)}
                        >
                          {action.label}
                        </Button>
                      ))}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length + 1} align="center">
                  <Chip 
                    label="No hay datos disponibles" 
                    color="default" 
                    variant="outlined"
                  />
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