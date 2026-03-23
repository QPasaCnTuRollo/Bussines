const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_KEY || ''
);

// ══════════════════════════════════
// API PRODUCTOS / INVENTARIO
// ══════════════════════════════════

// Obtener todos los registros
app.get('/api/datos', async (req, res) => {
    const { data, error } = await supabase
        .from('inventario')
        .select(`*, cuentas(nombre_gmail)`)
        .order('id', { ascending: false });
    res.json(data || []);
});

// Nuevo registro
app.post('/api/nuevo', async (req, res) => {
    const { error } = await supabase.from('inventario').insert([req.body]);
    res.json({ status: error ? 'error' : 'ok', error });
});

// Editar registro
app.put('/api/editar-item/:id', async (req, res) => {
    const { error } = await supabase
        .from('inventario')
        .update(req.body)
        .eq('id', req.params.id);
    res.json({ status: error ? 'error' : 'ok' });
});

// Eliminar registro
app.delete('/api/eliminar-item/:id', async (req, res) => {
    const { error } = await supabase
        .from('inventario')
        .delete()
        .eq('id', req.params.id);
    res.json({ status: error ? 'error' : 'ok' });
});

// ══════════════════════════════════
// API CUENTAS
// ══════════════════════════════════

// Obtener todas las cuentas
app.get('/api/cuentas', async (req, res) => {
    const { data, error } = await supabase
        .from('cuentas')
        .select('*')
        .order('nombre_gmail', { ascending: true });
    res.json(data || []);
});

// Crear nueva cuenta
app.post('/api/cuentas', async (req, res) => {
    const { error } = await supabase.from('cuentas').insert([req.body]);
    res.json({ status: error ? 'error' : 'ok', error });
});

// Editar nombre de cuenta
app.put('/api/editar-cuenta/:id', async (req, res) => {
    const { error } = await supabase
        .from('cuentas')
        .update(req.body)
        .eq('id', req.params.id);
    res.json({ status: error ? 'error' : 'ok' });
});

// Resetear (borrar inventario) de una cuenta
app.delete('/api/reset-cuenta/:id', async (req, res) => {
    const { error } = await supabase
        .from('inventario')
        .delete()
        .eq('id_cuenta', req.params.id);
    res.json({ status: error ? 'error' : 'ok' });
});

// Fallback → SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🟢 V-MASTERS SYSTEM ONLINE · PORT ${PORT}`);
});
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 V-MASTER ELITE ONLINE`));
