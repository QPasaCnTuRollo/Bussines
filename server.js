const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_KEY || '');

// MIDDLEWARE DE LOGS (Para ver qué pasa en Render)
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// API CUENTAS
app.get('/api/cuentas', async (req, res) => {
    const { data, error } = await supabase.from('cuentas').select('*').order('nombre_gmail', { ascending: true });
    if (error) return res.status(500).json(error);
    res.json(data || []);
});

app.put('/api/cuentas/:id', async (req, res) => {
    const { error } = await supabase.from('cuentas').update(req.body).eq('id', req.params.id);
    res.json({ status: error ? "error" : "ok" });
});

app.delete('/api/cuentas/:id', async (req, res) => {
    // Borrado en cascada manual (si no está configurado en Supabase)
    await supabase.from('inventario').delete().eq('id_cuenta', req.params.id);
    const { error } = await supabase.from('cuentas').delete().eq('id', req.params.id);
    res.json({ status: error ? "error" : "ok" });
});

// API INVENTARIO
app.get('/api/datos', async (req, res) => {
    const { data, error } = await supabase.from('inventario').select(`*, cuentas(nombre_gmail)`).order('id', { ascending: false });
    if (error) return res.status(500).json(error);
    res.json(data || []);
});

app.post('/api/nuevo', async (req, res) => {
    const { error } = await supabase.from('inventario').insert([req.body]);
    res.json({ status: error ? "error" : "ok", msg: error?.message });
});

app.put('/api/editar/:id', async (req, res) => {
    const { error } = await supabase.from('inventario').update(req.body).eq('id', req.params.id);
    res.json({ status: error ? "error" : "ok" });
});

app.delete('/api/eliminar/:id', async (req, res) => {
    const { error } = await supabase.from('inventario').delete().eq('id', req.params.id);
    res.json({ status: error ? "error" : "ok" });
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 V-MASTERS CORE ONLINE - PORT ${PORT}`));
