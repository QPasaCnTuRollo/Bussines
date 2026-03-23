const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_KEY || '');

// --- PRODUCTOS ---
app.get('/api/datos', async (req, res) => {
    const { data } = await supabase.from('inventario').select(`*, cuentas(nombre_gmail)`).order('id', { ascending: false });
    res.json(data || []);
});

app.post('/api/nuevo', async (req, res) => {
    const { error } = await supabase.from('inventario').insert([req.body]);
    res.json({ status: error ? "error" : "ok", detalle: error?.message });
});

app.put('/api/editar/:id', async (req, res) => {
    const { error } = await supabase.from('inventario').update(req.body).eq('id', req.params.id);
    res.json({ status: error ? "error" : "ok" });
});

app.delete('/api/eliminar/:id', async (req, res) => {
    await supabase.from('inventario').delete().eq('id', req.params.id);
    res.json({ status: "ok" });
});

// --- CUENTAS ---
app.get('/api/cuentas', async (req, res) => {
    const { data } = await supabase.from('cuentas').select('*');
    res.json(data || []);
});

app.put('/api/cuentas/:id', async (req, res) => {
    const { error } = await supabase.from('cuentas').update(req.body).eq('id', req.params.id);
    res.json({ status: error ? "error" : "ok" });
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 V-Masters Live`));
