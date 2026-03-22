const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Obtener Cuentas
app.get('/api/cuentas', async (req, res) => {
    const { data } = await supabase.from('cuentas').select('*');
    res.json(data);
});

// Obtener el historial de ventas (todo lo registrado)
app.get('/api/datos', async (req, res) => {
    const { data } = await supabase.from('inventario').select(`*, cuentas(nombre_gmail)`).order('id', { ascending: false });
    res.json(data);
});

// Registrar nueva venta (Gestor directo)
app.post('/api/nuevo', async (req, res) => {
    const { articulo, id_cuenta, precio_compra, envio_pago, precio_venta, unidades } = req.body;
    const { data, error } = await supabase.from('inventario').insert([
        { articulo, id_cuenta, precio_compra, envio_pago, precio_venta, unidades, estado: 'Vendido', fecha_venta: new Date().toISOString() }
    ]);
    res.json({ status: "ok" });
});

// Borrar registro
app.delete('/api/eliminar/:id', async (req, res) => {
    await supabase.from('inventario').delete().eq('id', req.params.id);
    res.json({ status: "ok" });
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log("V-Masters Core Online"));
