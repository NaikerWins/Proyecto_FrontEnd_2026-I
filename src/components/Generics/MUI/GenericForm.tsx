import React from 'react';
import { SelectChangeEvent } from '@mui/material';

import {
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Box,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';

// Define el tipo correcto para FormField
export interface FormField {
  name: string;
  label: string;
  type?:
    | 'text'
    | 'email'
    | 'password'
    | 'number'
    | 'date'
    | 'boolean'
    | 'select';
  required?: boolean;
  multiline?: boolean;
  rows?: number;
  options?: { value: any; label: string }[];
}

interface GenericFormProps {
  title: string;
  fields: FormField[];
  initialValues: Record<string, any>;
  onSubmit: (values: Record<string, any>) => void;
  submitLabel?: string;
  onCancel?: () => void;
  onFieldChange?: (name: string, value: any) => void; // ← aquí

}

const GenericForm: React.FC<GenericFormProps> = ({
  title,
  fields,
  initialValues,
  onSubmit,
  submitLabel = 'Guardar',
  onCancel,
  onFieldChange, // ← aquí

}) => {
  const [values, setValues] = React.useState(initialValues);

  const handleChange =
    (field: string) =>
    (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      const target = event.target;
      const value =
        target.type === 'checkbox'
          ? (target as HTMLInputElement).checked
          : target.value;
      setValues({ ...values, [field]: value });
      onFieldChange?.(field, value);
    };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(values);
  };

  interface GenericFormProps {
  title: string;
  fields: FormField[];
  initialValues: Record<string, any>;
  onSubmit: (values: Record<string, any>) => void;
  submitLabel?: string;
  onCancel?: () => void;
  onFieldChange?: (name: string, value: any) => void; // ← aquí
}

  const renderField = (field: FormField) => {
    if (field.type === 'boolean') {
      return (
        <FormControlLabel
          control={
            <Switch
              checked={!!values[field.name]}
              onChange={handleChange(field.name)}
              color="primary"
            />
          }
          label={field.label}
        />
      );
    }

    if (field.type === 'select' && field.options) {
      const handleSelectChange = (event: SelectChangeEvent) => {
        const value = event.target.value;
        setValues({ ...values, [field.name]: value });
        onFieldChange?.(field.name, value); // ← agregar esto

      };

      return (
        <FormControl fullWidth variant="outlined">
          <InputLabel>{field.label}</InputLabel>
          <Select
            value={values[field.name] || ''}
            onChange={handleSelectChange}
            label={field.label}
          >
            {field.options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    }

    return (
      <TextField
        fullWidth
        label={field.label}
        type={field.type || 'text'}
        value={values[field.name] || ''}
        onChange={handleChange(field.name)}
        required={field.required}
        variant="outlined"
        multiline={field.multiline}
        rows={field.rows}
      />
    );
  };

  return (
    <Card elevation={3}>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          {title}
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {fields.map((field) => (
              <Grid item xs={12} key={field.name}>
                {renderField(field)}
              </Grid>
            ))}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                {onCancel && (
                  <Button type="button" variant="outlined" onClick={onCancel}>
                    Cancelar
                  </Button>
                )}
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                >
                  {submitLabel}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

export default GenericForm;
