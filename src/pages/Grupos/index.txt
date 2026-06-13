import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  Avatar,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import { Add, Search, Group, Lock, Public } from '@mui/icons-material';
import { grupoService } from '../../services/grupoService';
import { Grupo } from '../../models/Grupo';
import { useMensajeriaContext } from '../../context/MensajeriaContext';
import Swal from 'sweetalert2';
import { Autocomplete, CircularProgress } from '@mui/material';
import { personaService, PersonaBasica } from '../../services/personaService';

const GruposPage: React.FC = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.id;
  const userName = user.name;

  const { unirseGrupo, salirGrupo } = useMensajeriaContext();
  const navigate = useNavigate();

  const [gruposPublicos, setGruposPublicos] = useState<Grupo[]>([]);
  const [misGrupos, setMisGrupos] = useState<Grupo[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [dialogCrear, setDialogCrear] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form crear grupo
  const [nuevoGrupo, setNuevoGrupo] = useState({
    nombre: '',
    descripcion: '',
    tipo: 'publico',
  });
  const [miembrosSeleccionados, setMiembrosSeleccionados] = useState<
    PersonaBasica[]
  >([]);
  const [opcionesMiembros, setOpcionesMiembros] = useState<PersonaBasica[]>([]);
  const [inputMiembro, setInputMiembro] = useState('');
  const [buscandoMiembros, setBuscandoMiembros] = useState(false);

  useEffect(() => {
    if (inputMiembro.length < 2) {
      setOpcionesMiembros([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setBuscandoMiembros(true);
      const personas = await personaService.buscarPersonas(inputMiembro);
      // Excluir al propio usuario y a los ya seleccionados
      const yaSeleccionadosIds = miembrosSeleccionados.map((m) => m.id);
      setOpcionesMiembros(
        personas.filter(
          (p) => p.id !== userId && !yaSeleccionadosIds.includes(p.id),
        ),
      );
      setBuscandoMiembros(false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [inputMiembro, userId, miembrosSeleccionados]);

  const fetchGrupos = async () => {
    try {
        console.log('Iniciando fetchGrupos...');
        const [publicos, mios] = await Promise.all([
            grupoService.getGruposPublicos(),
            grupoService.getGruposByUsuario(userId),
        ]);
        console.log('Publicos:', publicos);
        console.log('Mios:', mios);
        setGruposPublicos(publicos);
        setMisGrupos(mios);

        mios.forEach((g: Grupo) => {
            if (g.id) unirseGrupo(g.id);
        });
        console.log('fetchGrupos completado');
    } catch (error) {
        console.error("Error al cargar grupos:", error);
    } finally {
        setLoading(false);
        console.log('Loading puesto en false');
    }
};

  const handleCrearGrupo = async () => {
    if (!nuevoGrupo.nombre.trim()) {
      Swal.fire({
        title: 'Error',
        text: 'El nombre es obligatorio',
        icon: 'error',
      });
      return;
    }

    if (miembrosSeleccionados.length < 2) {
      Swal.fire({
        title: 'Error',
        text: 'Agrega al menos 2 miembros',
        icon: 'error',
      });
      return;
    }

    const miembros = miembrosSeleccionados.map((m) => ({
      userId: m.id,
      nombre: m.name,
    }));

    const grupo = await grupoService.crearGrupo(userId, userName, {
      nombre: nuevoGrupo.nombre,
      descripcion: nuevoGrupo.descripcion || undefined,
      tipo: nuevoGrupo.tipo,
      miembros,
    });

    if (grupo) {
      Swal.fire({
        title: 'Éxito',
        text: 'Grupo creado correctamente',
        icon: 'success',
        timer: 2000,
      });
      setDialogCrear(false);
      setNuevoGrupo({ nombre: '', descripcion: '', tipo: 'publico' });
      setMiembrosSeleccionados([]);
      fetchGrupos();
    } else {
      Swal.fire({
        title: 'Error',
        text: 'Error al crear el grupo',
        icon: 'error',
      });
    }
  };

  const handleUnirse = async (grupo: Grupo) => {
    const resultado = await grupoService.unirse(grupo.id!, userId, userName);
    if (resultado) {
      if (grupo.id) unirseGrupo(grupo.id);
      Swal.fire({
        title: 'Éxito',
        text: `Te uniste a "${grupo.nombre}"`,
        icon: 'success',
        timer: 2000,
      });
      fetchGrupos();
    } else {
      Swal.fire({
        title: 'Error',
        text: 'Error al unirse al grupo',
        icon: 'error',
      });
    }
  };

  const handleSalir = async (grupo: Grupo) => {
    const result = await Swal.fire({
      title: '¿Abandonar grupo?',
      text: `¿Seguro que quieres salir de "${grupo.nombre}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      const res = await grupoService.salir(grupo.id!, userId);
      if (res) {
        if (grupo.id) salirGrupo(grupo.id);
        Swal.fire({
          title: 'Éxito',
          text: 'Saliste del grupo',
          icon: 'success',
          timer: 2000,
        });
        fetchGrupos();
      }
    }
  };

  const esMiembro = (grupo: Grupo) => misGrupos.some((g) => g.id === grupo.id);

  const gruposFiltrados = gruposPublicos.filter(
    (g) =>
      g.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      g.descripcion?.toLowerCase().includes(busqueda.toLowerCase()),
  );

  if (loading) return <Typography>Cargando...</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4" fontWeight="bold">
          Grupos
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" onClick={() => navigate('/mensajes')}>
            Ir a mensajes
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setDialogCrear(true)}
          >
            Crear grupo
          </Button>
        </Box>
      </Box>

      {/* Mis grupos */}
      {misGrupos.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Mis grupos
          </Typography>
          <Grid container spacing={2}>
            {misGrupos.map((grupo) => (
              <Grid item xs={12} sm={6} md={4} key={grupo.id}>
                <Card elevation={2}>
                  <CardContent>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        mb: 1,
                      }}
                    >
                      <Avatar sx={{ bgcolor: 'secondary.main' }}>
                        <Group />
                      </Avatar>
                      <Box>
                        <Typography fontWeight="bold">
                          {grupo.nombre}
                        </Typography>
                        <Chip
                          label={grupo.tipo}
                          size="small"
                          icon={
                            grupo.tipo === 'publico' ? (
                              <Public fontSize="small" />
                            ) : (
                              <Lock fontSize="small" />
                            )
                          }
                          color={
                            grupo.tipo === 'publico' ? 'success' : 'default'
                          }
                        />
                      </Box>
                    </Box>
                    {grupo.descripcion && (
                      <Typography variant="body2" color="text.secondary">
                        {grupo.descripcion}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary">
                      {grupo.miembros?.length || 0} miembros
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" onClick={() => navigate('/mensajes')}>
                      Mensajes
                    </Button>
                    {grupo.adminId !== userId && (
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleSalir(grupo)}
                      >
                        Salir
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Grupos públicos */}
      <Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography variant="h6">Grupos públicos</Typography>
          <TextField
            size="small"
            placeholder="Buscar grupos..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Grid container spacing={2}>
          {gruposFiltrados.map((grupo) => (
            <Grid item xs={12} sm={6} md={4} key={grupo.id}>
              <Card elevation={2}>
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      mb: 1,
                    }}
                  >
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <Group />
                    </Avatar>
                    <Typography fontWeight="bold">{grupo.nombre}</Typography>
                  </Box>
                  {grupo.descripcion && (
                    <Typography variant="body2" color="text.secondary">
                      {grupo.descripcion}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary">
                    {grupo.miembros?.length || 0} miembros · Admin:{' '}
                    {grupo.adminNombre}
                  </Typography>
                </CardContent>
                <CardActions>
                  {esMiembro(grupo) ? (
                    <Chip
                      label="Ya eres miembro"
                      color="success"
                      size="small"
                    />
                  ) : (
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => handleUnirse(grupo)}
                    >
                      Unirse
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Dialog crear grupo */}
      <Dialog
        open={dialogCrear}
        onClose={() => setDialogCrear(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Crear nuevo grupo</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="Nombre del grupo"
              value={nuevoGrupo.nombre}
              onChange={(e) =>
                setNuevoGrupo({ ...nuevoGrupo, nombre: e.target.value })
              }
              required
            />
            <TextField
              fullWidth
              label="Descripción"
              value={nuevoGrupo.descripcion}
              onChange={(e) =>
                setNuevoGrupo({ ...nuevoGrupo, descripcion: e.target.value })
              }
              multiline
              rows={2}
            />
            <TextField
              fullWidth
              select
              label="Tipo"
              value={nuevoGrupo.tipo}
              onChange={(e) =>
                setNuevoGrupo({ ...nuevoGrupo, tipo: e.target.value })
              }
              SelectProps={{ native: true }}
            >
              <option value="publico">Público</option>
              <option value="privado">Privado</option>
            </TextField>
            {/* Reemplaza el TextField de miembrosTexto con esto */}
            <Autocomplete
              multiple
              options={opcionesMiembros}
              value={miembrosSeleccionados}
              onChange={(_, newValue) => setMiembrosSeleccionados(newValue)}
              inputValue={inputMiembro}
              onInputChange={(_, newInputValue) =>
                setInputMiembro(newInputValue)
              }
              getOptionLabel={(option) => `${option.name} (${option.email})`}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              loading={buscandoMiembros}
              noOptionsText={
                inputMiembro.length < 2
                  ? 'Escribe al menos 2 caracteres'
                  : 'No se encontraron personas'
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Miembros"
                  placeholder="Busca por nombre o email..."
                  helperText={`${miembrosSeleccionados.length} seleccionados (mínimo 2)`}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {buscandoMiembros ? (
                          <CircularProgress color="inherit" size={16} />
                        ) : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              renderOption={(props, option) => (
                <li {...props} key={option.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar
                      sx={{
                        width: 28,
                        height: 28,
                        bgcolor: 'primary.main',
                        fontSize: 14,
                      }}
                    >
                      {option.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2">{option.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.email}
                      </Typography>
                    </Box>
                  </Box>
                </li>
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogCrear(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleCrearGrupo}>
            Crear grupo
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GruposPage;
