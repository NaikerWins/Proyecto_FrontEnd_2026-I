import React, { useEffect, useState, useRef } from "react";
import { Container, Typography, Box, TextField, Button, List, ListItem,
    ListItemText, Divider, Chip, Badge, Avatar, Paper, Tabs, Tab,
    InputAdornment, IconButton } from "@mui/material";
import { Send, Search } from "@mui/icons-material";
import { mensajeService } from "../../services/mensajeService";
import { grupoService } from "../../services/grupoService";
import { useMensajeriaContext } from "../../context/MensajeriaContext";
import { Mensaje } from "../../models/Mensaje";
import { Grupo } from "../../models/Grupo";
import Swal from "sweetalert2";
import { Autocomplete, CircularProgress } from "@mui/material";
import { personaService, PersonaBasica } from "../../services/personaService";

const MensajesPage: React.FC = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id;
    const userName = user.name;

    const { mensajesNuevos, unirseGrupo, limpiarMensajesNuevos } = useMensajeriaContext();

    const [tabActiva, setTabActiva] = useState(0);
    const [mensajes, setMensajes] = useState<Mensaje[]>([]);
    const [grupos, setGrupos] = useState<Grupo[]>([]);
    const [conversacionActiva, setConversacionActiva] = useState<any>(null);
    const [contenido, setContenido] = useState("");
    const [busqueda, setBusqueda] = useState("");
    const [loading, setLoading] = useState(true);
    const mensajesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchData();
        limpiarMensajesNuevos();
    }, []);

    // Actualizar cuando lleguen mensajes nuevos via WebSocket
    useEffect(() => {
        if (mensajesNuevos.length > 0) {
            fetchData();
        }
    }, [mensajesNuevos]);

    // Scroll al final cuando lleguen mensajes
    useEffect(() => {
        mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [mensajes, conversacionActiva]);

    const fetchData = async () => {
        try {
            const [mensajesData, gruposData] = await Promise.all([
                mensajeService.getMensajesRecibidos(userId),
                grupoService.getGruposByUsuario(userId),
            ]);
            setMensajes(mensajesData);
            setGrupos(gruposData);

            // Unirse a las salas de grupos via WebSocket
            gruposData.forEach((g: Grupo) => {
                if (g.id) unirseGrupo(g.id);
            });
        } catch (error) {
            console.error("Error al cargar datos:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEnviarMensaje = async () => {
        if (!contenido.trim() || !conversacionActiva) return;

        try {
            if (conversacionActiva.tipo === 'directo') {
                await mensajeService.enviarMensajeDirecto(
                    userId,
                    userName,
                    conversacionActiva.emisorId,
                    conversacionActiva.emisorNombre,
                    contenido,
                );
            } else if (conversacionActiva.tipo === 'grupo') {
                await mensajeService.enviarMensajeGrupo(
                    userId,
                    userName,
                    conversacionActiva.grupoId,
                    contenido,
                );
            }
            setContenido("");
            fetchData();
        } catch (error) {
            Swal.fire({ title: "Error", text: "Error al enviar mensaje", icon: "error" });
        }
    };

    const handleEnviarAlerta = async () => {
        const { value: formValues } = await Swal.fire({
            title: 'Enviar Alerta Masiva',
            html: `
                <textarea id="swal-contenido" class="swal2-textarea" placeholder="Mensaje de alerta (máx. 500 caracteres)"></textarea>
                <select id="swal-alcance" class="swal2-select">
                    <option value="todos">Todos los usuarios</option>
                    <option value="ruta">Usuarios por ruta</option>
                    <option value="zona">Usuarios por zona</option>
                </select>
                <div style="margin-top:8px">
                    <input type="checkbox" id="swal-urgente" />
                    <label for="swal-urgente" style="margin-left:8px">Marcar como urgente</label>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Enviar',
            cancelButtonText: 'Cancelar',
            preConfirm: () => ({
                contenido: (document.getElementById('swal-contenido') as HTMLTextAreaElement)?.value,
                alcance: (document.getElementById('swal-alcance') as HTMLSelectElement)?.value,
                esUrgente: (document.getElementById('swal-urgente') as HTMLInputElement)?.checked,
            }),
        });

        if (formValues && formValues.contenido) {
            await mensajeService.enviarAlertaMasiva(
                userId,
                userName,
                formValues.contenido,
                formValues.alcance,
                formValues.esUrgente,
            );
            Swal.fire({ title: "Éxito", text: "Alerta enviada correctamente", icon: "success", timer: 2000 });
        }
    };

    const handleSeleccionarConversacion = async (msg: Mensaje) => {
        setConversacionActiva(msg);
        if (msg.destinatarioId && !msg.leido) {
            await mensajeService.marcarLeido(msg.destinatarioId, userId);
            fetchData();
        }
    };

    const mensajesFiltrados = mensajes.filter((m) =>
        m.emisorNombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        m.contenido.toLowerCase().includes(busqueda.toLowerCase())
    );

    if (loading) return <Typography>Cargando...</Typography>;

    return (
        <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: '1px solid #e0e0e0' }}>
                <Typography variant="h5" fontWeight="bold">Mensajería</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button variant="outlined" size="small" onClick={() => setTabActiva(2)}>
                        Nuevo mensaje
                    </Button>
                    <Button variant="contained" color="error" size="small" onClick={handleEnviarAlerta}>
                        Alerta masiva
                    </Button>
                </Box>
            </Box>

            <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* Panel izquierdo — Lista de conversaciones */}
                <Box sx={{ width: 320, borderRight: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ p: 1 }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Buscar mensajes..."
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

                    <Tabs value={tabActiva} onChange={(_, v) => setTabActiva(v)} variant="fullWidth" sx={{ borderBottom: '1px solid #e0e0e0' }}>
                        <Tab label="Todos" />
                        <Tab label="Grupos" />
                        <Tab label="Nuevo" />
                    </Tabs>

                    {/* Tab 0 — Todos los mensajes */}
                    {tabActiva === 0 && (
                        <List sx={{ flex: 1, overflow: 'auto', p: 0 }}>
                            {mensajesFiltrados.length === 0 ? (
                                <Box sx={{ p: 3, textAlign: 'center' }}>
                                    <Typography color="text.secondary" variant="body2">
                                        No hay mensajes
                                    </Typography>
                                </Box>
                            ) : (
                                mensajesFiltrados.map((msg, index) => (
                                    <React.Fragment key={index}>
                                        <ListItem
                                            button
                                            selected={conversacionActiva?.id === msg.id}
                                            onClick={() => handleSeleccionarConversacion(msg)}
                                            sx={{ alignItems: 'flex-start', py: 1.5 }}
                                        >
                                            <Avatar sx={{ bgcolor: 'primary.main', mr: 1.5, mt: 0.5, width: 40, height: 40 }}>
                                                {msg.emisorNombre.charAt(0)}
                                            </Avatar>
                                            <ListItemText
                                                primary={
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <Typography variant="subtitle2" fontWeight={msg.leido ? 'normal' : 'bold'} noWrap sx={{ maxWidth: 150 }}>
                                                            {msg.emisorNombre}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {msg.fechaEnvio ? new Date(msg.fechaEnvio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                        </Typography>
                                                    </Box>
                                                }
                                                secondary={
                                                    <Box>
                                                        {msg.tipo === 'grupo' && (
                                                            <Typography variant="caption" color="primary">{msg.grupoNombre} · </Typography>
                                                        )}
                                                        <Typography variant="body2" noWrap color={msg.leido ? 'text.secondary' : 'text.primary'}>
                                                            {msg.contenido}
                                                        </Typography>
                                                    </Box>
                                                }
                                            />
                                            {!msg.leido && (
                                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', mt: 1, ml: 0.5, flexShrink: 0 }} />
                                            )}
                                        </ListItem>
                                        <Divider />
                                    </React.Fragment>
                                ))
                            )}
                        </List>
                    )}

                    {/* Tab 1 — Grupos */}
                    {tabActiva === 1 && (
                        <List sx={{ flex: 1, overflow: 'auto', p: 0 }}>
                            {grupos.length === 0 ? (
                                <Box sx={{ p: 3, textAlign: 'center' }}>
                                    <Typography color="text.secondary" variant="body2">
                                        No perteneces a ningún grupo
                                    </Typography>
                                    <Button size="small" sx={{ mt: 1 }} onClick={() => window.location.href = '/grupos'}>
                                        Ver grupos públicos
                                    </Button>
                                </Box>
                            ) : (
                                grupos.map((grupo, index) => (
                                    <React.Fragment key={index}>
                                        <ListItem
                                            button
                                            onClick={() => setConversacionActiva({
                                                tipo: 'grupo',
                                                grupoId: grupo.id,
                                                grupoNombre: grupo.nombre,
                                                emisorNombre: grupo.nombre,
                                            })}
                                        >
                                            <Avatar sx={{ bgcolor: 'secondary.main', mr: 1.5 }}>
                                                {grupo.nombre.charAt(0)}
                                            </Avatar>
                                            <ListItemText
                                                primary={grupo.nombre}
                                                secondary={`${grupo.miembros?.length || 0} miembros · ${grupo.tipo}`}
                                            />
                                        </ListItem>
                                        <Divider />
                                    </React.Fragment>
                                ))
                            )}
                        </List>
                    )}

                    {/* Tab 2 — Nuevo mensaje */}
                    {tabActiva === 2 && (
                        <NuevoMensajePanel
                            userId={userId}
                            userName={userName}
                            onEnviado={() => {
                                setTabActiva(0);
                                fetchData();
                            }}
                        />
                    )}
                </Box>

                {/* Panel derecho — Conversación activa */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {conversacionActiva ? (
                        <>
                            {/* Header de la conversación */}
                            <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Avatar sx={{ bgcolor: 'primary.main' }}>
                                    {conversacionActiva.emisorNombre.charAt(0)}
                                </Avatar>
                                <Box>
                                    <Typography fontWeight="bold">{conversacionActiva.emisorNombre}</Typography>
                                    {conversacionActiva.tipo === 'grupo' && (
                                        <Typography variant="caption" color="text.secondary">Grupo</Typography>
                                    )}
                                </Box>
                            </Box>

                            {/* Área de mensajes */}
                            <Box sx={{ flex: 1, overflow: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {mensajes
                                    .filter((m) =>
                                        conversacionActiva.tipo === 'grupo'
                                            ? m.grupoId === conversacionActiva.grupoId
                                            : m.emisorId === conversacionActiva.emisorId || m.emisorId === userId
                                    )
                                    .map((msg, index) => (
                                        <Box
                                            key={index}
                                            sx={{
                                                display: 'flex',
                                                justifyContent: msg.emisorId === userId ? 'flex-end' : 'flex-start',
                                            }}
                                        >
                                            <Paper
                                                sx={{
                                                    p: 1.5,
                                                    maxWidth: '70%',
                                                    bgcolor: msg.emisorId === userId ? 'primary.main' : 'grey.100',
                                                    color: msg.emisorId === userId ? 'white' : 'text.primary',
                                                    borderRadius: 2,
                                                }}
                                            >
                                                {conversacionActiva.tipo === 'grupo' && msg.emisorId !== userId && (
                                                    <Typography variant="caption" fontWeight="bold" display="block">
                                                        {msg.emisorNombre}
                                                    </Typography>
                                                )}
                                                <Typography variant="body2">{msg.contenido}</Typography>
                                                <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', textAlign: 'right', mt: 0.5 }}>
                                                    {msg.fechaEnvio ? new Date(msg.fechaEnvio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                </Typography>
                                            </Paper>
                                        </Box>
                                    ))
                                }
                                <div ref={mensajesEndRef} />
                            </Box>

                            {/* Input de mensaje */}
                            <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0', display: 'flex', gap: 1 }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Escribe un mensaje..."
                                    value={contenido}
                                    onChange={(e) => setContenido(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleEnviarMensaje();
                                        }
                                    }}
                                    multiline
                                    maxRows={3}
                                />
                                <IconButton
                                    color="primary"
                                    onClick={handleEnviarMensaje}
                                    disabled={!contenido.trim()}
                                >
                                    <Send />
                                </IconButton>
                            </Box>
                        </>
                    ) : (
                        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2 }}>
                            <Typography variant="h6" color="text.secondary">
                                Selecciona una conversación
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                O inicia un nuevo mensaje desde la pestaña "Nuevo"
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

// Subcomponente para enviar nuevo mensaje
const NuevoMensajePanel: React.FC<{
    userId: string;
    userName: string;
    onEnviado: () => void;
}> = ({ userId, userName, onEnviado }) => {
    const [destinatario, setDestinatario] = useState<PersonaBasica | null>(null);
    const [contenido, setContenido] = useState('');
    const [opciones, setOpciones] = useState<PersonaBasica[]>([]);
    const [buscando, setBuscando] = useState(false);
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        if (inputValue.length < 2) {
            setOpciones([]);
            return;
        }

        const timeoutId = setTimeout(async () => {
            setBuscando(true);
            const personas = await personaService.buscarPersonas(inputValue);
            // Excluir al propio usuario de los resultados
            setOpciones(personas.filter((p) => p.id !== userId));
            setBuscando(false);
        }, 300); // debounce de 300ms

        return () => clearTimeout(timeoutId);
    }, [inputValue, userId]);

    const handleEnviar = async () => {
        if (!destinatario || !contenido.trim()) {
            Swal.fire({ title: "Error", text: "Selecciona un destinatario y escribe un mensaje", icon: "error" });
            return;
        }

        const resultado = await mensajeService.enviarMensajeDirecto(
            userId,
            userName,
            destinatario.id,
            destinatario.name,
            contenido,
        );

        if (resultado) {
            Swal.fire({ title: "Éxito", text: "Mensaje enviado", icon: "success", timer: 1500 });
            setDestinatario(null);
            setContenido('');
            onEnviado();
        } else {
            Swal.fire({ title: "Error", text: "Error al enviar el mensaje", icon: "error" });
        }
    };

    return (
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold">Nuevo mensaje directo</Typography>

            <Autocomplete
                options={opciones}
                value={destinatario}
                onChange={(_, newValue) => setDestinatario(newValue)}
                inputValue={inputValue}
                onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
                getOptionLabel={(option) => `${option.name} (${option.email})`}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                loading={buscando}
                noOptionsText={inputValue.length < 2 ? "Escribe al menos 2 caracteres" : "No se encontraron personas"}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        size="small"
                        label="Persona destino"
                        placeholder="Busca por nombre o email..."
                        InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                                <>
                                    {buscando ? <CircularProgress color="inherit" size={16} /> : null}
                                    {params.InputProps.endAdornment}
                                </>
                            ),
                        }}
                    />
                )}
                renderOption={(props, option) => (
                    <li {...props} key={option.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.main', fontSize: 14 }}>
                                {option.name.charAt(0)}
                            </Avatar>
                            <Box>
                                <Typography variant="body2">{option.name}</Typography>
                                <Typography variant="caption" color="text.secondary">{option.email}</Typography>
                            </Box>
                        </Box>
                    </li>
                )}
            />

            <TextField
                fullWidth
                size="small"
                label="Mensaje"
                value={contenido}
                onChange={(e) => setContenido(e.target.value)}
                multiline
                rows={3}
                inputProps={{ maxLength: 500 }}
                helperText={`${contenido.length}/500`}
            />

            <Button
                variant="contained"
                onClick={handleEnviar}
                startIcon={<Send />}
                disabled={!destinatario || !contenido.trim()}
            >
                Enviar mensaje
            </Button>
        </Box>
    );
};

export default MensajesPage;