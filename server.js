const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_KEY || '');

// ═══════════════════════════════════════════════════
// PRODUCTOS / INVENTARIO
// ═══════════════════════════════════════════════════

app.get('/api/datos', async (req, res) => {
    const { data, error } = await supabase
        .from('inventario')
        .select('*, cuentas(nombre_gmail, estado)')
        .order('id', { ascending: false });
    if (error) console.error('GET /api/datos:', error.message);
    res.json(data || []);
});

app.post('/api/nuevo', async (req, res) => {
    const payload = { ...req.body };
    if (!payload.fecha_venta) payload.fecha_venta = new Date().toISOString();
    // Ensure id_cuenta is a number
    if (payload.id_cuenta) payload.id_cuenta = parseInt(payload.id_cuenta);
    // Remove any undefined fields
    Object.keys(payload).forEach(k => { if (payload[k] === undefined || payload[k] === null && k !== 'precio_compra') delete payload[k]; });
    console.log('POST /api/nuevo payload:', JSON.stringify(payload));
    const { data, error } = await supabase
        .from('inventario')
        .insert([payload])
        .select();
    if (error) {
        console.error('POST /api/nuevo ERROR:', error.message, '| code:', error.code, '| details:', error.details);
        return res.status(500).json({ status: 'error', error: error.message, code: error.code });
    }
    console.log('POST /api/nuevo OK, id:', data?.[0]?.id);
    res.json({ status: 'ok', data });
});

app.put('/api/editar-item/:id', async (req, res) => {
    const { error } = await supabase
        .from('inventario')
        .update(req.body)
        .eq('id', req.params.id);
    if (error) console.error('PUT /api/editar-item:', error.message);
    res.json({ status: error ? 'error' : 'ok' });
});

app.delete('/api/eliminar-item/:id', async (req, res) => {
    const { error } = await supabase
        .from('inventario')
        .delete()
        .eq('id', req.params.id);
    if (error) console.error('DELETE /api/eliminar-item:', error.message);
    res.json({ status: error ? 'error' : 'ok' });
});

// ═══════════════════════════════════════════════════
// CUENTAS
// ═══════════════════════════════════════════════════

app.get('/api/cuentas', async (req, res) => {
    const { data, error } = await supabase
        .from('cuentas')
        .select('*')
        .order('nombre_gmail', { ascending: true });
    if (error) {
        console.error('GET /api/cuentas:', error.message);
        return res.status(500).json({ status: 'error', error: error.message });
    }
    // Normalise: ensure estado field always exists (default 'abierta')
    const normalised = (data || []).map(c => ({
        ...c,
        estado: c.estado || 'abierta',
        correo: c.correo || '',
        modelo_movil: c.modelo_movil || ''
    }));
    res.json(normalised);
});

app.post('/api/cuentas', async (req, res) => {
    const { data, error } = await supabase
        .from('cuentas')
        .insert([req.body])
        .select();
    if (error) {
        console.error('POST /api/cuentas:', error.message);
        return res.status(500).json({ status: 'error', error: error.message });
    }
    res.json({ status: 'ok', data });
});

app.put('/api/editar-cuenta/:id', async (req, res) => {
    // Only include fields that are actually present in the request
    const allowed = ['nombre_gmail', 'correo', 'modelo_movil', 'estado'];
    const update = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) update[k] = req.body[k]; });
    if (Object.keys(update).length === 0) {
        return res.json({ status: 'ok', msg: 'nothing to update' });
    }
    const { error } = await supabase
        .from('cuentas')
        .update(update)
        .eq('id', req.params.id);
    if (error) {
        console.error('PUT /api/editar-cuenta:', error.message);
        return res.status(500).json({ status: 'error', error: error.message });
    }
    res.json({ status: 'ok' });
});

app.delete('/api/reset-cuenta/:id', async (req, res) => {
    const { error } = await supabase
        .from('inventario')
        .delete()
        .eq('id_cuenta', req.params.id);
    if (error) console.error('DELETE /api/reset-cuenta:', error.message);
    res.json({ status: error ? 'error' : 'ok' });
});

app.delete('/api/eliminar-cuenta/:id', async (req, res) => {
    await supabase.from('inventario').delete().eq('id_cuenta', req.params.id);
    const { error } = await supabase.from('cuentas').delete().eq('id', req.params.id);
    if (error) console.error('DELETE /api/eliminar-cuenta:', error.message);
    res.json({ status: error ? 'error' : 'ok' });
});

// ═══════════════════════════════════════════════════
// ESTADÍSTICAS MENSUALES
// ═══════════════════════════════════════════════════

app.get('/api/stats-mensuales', async (req, res) => {
    const { data, error } = await supabase
        .from('stats_mensuales')
        .select('*')
        .order('anio', { ascending: true })
        .order('mes', { ascending: true });
    if (error) console.error('GET /api/stats-mensuales:', error.message);
    res.json(data || []);
});

app.post('/api/stats-mensuales', async (req, res) => {
    const { data, error } = await supabase
        .from('stats_mensuales')
        .upsert([req.body], { onConflict: 'anio,mes' })
        .select();
    if (error) {
        console.error('POST /api/stats-mensuales:', error.message);
        return res.status(500).json({ status: 'error', error: error.message });
    }
    res.json({ status: 'ok', data });
});

app.put('/api/stats-mensuales/:id', async (req, res) => {
    const { error } = await supabase
        .from('stats_mensuales')
        .update(req.body)
        .eq('id', req.params.id);
    if (error) console.error('PUT /api/stats-mensuales:', error.message);
    res.json({ status: error ? 'error' : 'ok' });
});

app.delete('/api/stats-mensuales/:id', async (req, res) => {
    const { error } = await supabase
        .from('stats_mensuales')
        .delete()
        .eq('id', req.params.id);
    if (error) console.error('DELETE /api/stats-mensuales:', error.message);
    res.json({ status: error ? 'error' : 'ok' });
});

// ═══════════════════════════════════════════════════
// HISTORIAL CUENTAS CERRADAS / BLOQUEADAS
// ═══════════════════════════════════════════════════

app.get('/api/historial-cuentas', async (req, res) => {
    const { data, error } = await supabase
        .from('historial_cuentas')
        .select('*')
        .order('fecha_cierre', { ascending: false });
    if (error) console.error('GET /api/historial-cuentas:', error.message);
    res.json(data || []);
});

app.post('/api/historial-cuentas', async (req, res) => {
    const { data, error } = await supabase
        .from('historial_cuentas')
        .insert([req.body])
        .select();
    if (error) {
        console.error('POST /api/historial-cuentas:', error.message);
        return res.status(500).json({ status: 'error', error: error.message });
    }
    res.json({ status: 'ok', data });
});

app.delete('/api/historial-cuentas/:id', async (req, res) => {
    const { error } = await supabase
        .from('historial_cuentas')
        .delete()
        .eq('id', req.params.id);
    if (error) console.error('DELETE /api/historial-cuentas:', error.message);
    res.json({ status: error ? 'error' : 'ok' });
});

// ═══════════════════════════════════════════════════
// RUTAS SPA
// ═══════════════════════════════════════════════════

app.get('/cpanel', (req, res) => res.sendFile(path.join(__dirname, 'public', 'cpanel.html')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`🟢 V-MASTERS SYSTEM ONLINE · PORT ${PORT}`));
