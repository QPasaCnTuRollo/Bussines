const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// CONEXIÓN CON TU SUPABASE (Render usa las variables de entorno)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Obtener las cuentas registradas
app.get('/api/cuentas', async (req, res) => {
    const { data } = await supabase.from('cuentas').select('*');
    res.json(data || []);
});

// Obtener todas las ventas registradas
app.get('/api/datos', async (req, res) => {
    const { data } = await supabase.from('inventario')
        .select(`*, cuentas(nombre_gmail)`)
        .order('id', { ascending: false });
    res.json(data || []);
});

// Registrar una nueva venta realizada
app.post('/api/nuevo', async (req, res) => {
    const { articulo, id_cuenta, precio_compra, envio_pago, precio_venta, unidades } = req.body;
    const { error } = await supabase.from('inventario').insert([
        { 
            articulo, 
            id_cuenta, 
            precio_compra, 
            envio_pago, 
            precio_venta, 
            unidades, 
            estado: 'Vendido', 
            fecha_venta: new Date().toISOString() 
        }
    ]);
    if (error) return res.status(500).json(error);
    res.json({ status: "ok" });
});

// Eliminar un registro (por error o prueba)
app.delete('/api/eliminar/:id', async (req, res) => {
    await supabase.from('inventario').delete().eq('id', req.params.id);
    res.json({ status: "ok" });
});

// Servir la web
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log("V-MASTERS Core Online"));
