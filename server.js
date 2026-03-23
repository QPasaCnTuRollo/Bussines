const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_KEY || '');

// API INVENTARIO
app.get('/api/datos', async (req, res) => {
    const { data } = await supabase.from('inventario').select(`*, cuentas(nombre_gmail)`).order('id', { ascending: false });
    res.json(data || []);
});

app.post('/api/nuevo', async (req, res) => {
    const { error } = await supabase.from('inventario').insert([req.body]);
    res.json({ status: error ? "error" : "ok" });
});

app.delete('/api/reset-cuenta/:id', async (req, res) => {
    const { error } = await supabase.from('inventario').delete().eq('id_cuenta', req.params.id);
    res.json({ status: error ? "error" : "ok" });
});

// API CUENTAS
app.get('/api/cuentas', async (req, res) => {
    const { data } = await supabase.from('cuentas').select('*').order('nombre_gmail', { ascending: true });
    res.json(data || []);
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 V-MASTER ONLINE`));
