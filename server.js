const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// OBTENER CUENTAS
app.get('/api/cuentas', async (req, res) => {
    const { data, error } = await supabase.from('cuentas').select('*');
    if (error) return res.status(500).json(error);
    res.json(data);
});

// OBTENER DATOS INVENTARIO
app.get('/api/datos', async (req, res) => {
    const { data, error } = await supabase.from('inventario').select(`*, cuentas(nombre_gmail)`).order('id', { ascending: false });
    if (error) return res.status(500).json(error);
    res.json(data);
});

// NUEVO PRODUCTO
app.post('/api/nuevo', async (req, res) => {
    const { error } = await supabase.from('inventario').insert([req.body]);
    if (error) return res.status(500).json(error);
    res.json({ status: "ok" });
});

// EDITAR PRODUCTO
app.put('/api/editar/:id', async (req, res) => {
    const { error } = await supabase.from('inventario').update(req.body).eq('id', req.params.id);
    if (error) return res.status(500).json(error);
    res.json({ status: "ok" });
});

// ELIMINAR PRODUCTO
app.delete('/api/eliminar/:id', async (req, res) => {
    const { error } = await supabase.from('inventario').delete().eq('id', req.params.id);
    if (error) return res.status(500).json(error);
    res.json({ status: "ok" });
});

// VENDER PRODUCTO
app.put('/api/vender/:id', async (req, res) => {
    const { error } = await supabase.from('inventario').update({ estado: 'Vendido', fecha_venta: new Date().toISOString() }).eq('id', req.params.id);
    if (error) return res.status(500).json(error);
    res.json({ status: "ok" });
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log("Servidor V-Master Live"));
