const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// CONFIGURACIÓN SUPABASE
const supabaseUrl = 'https://sjytztwzwbbwdrmjjshr.supabase.co'; 
const supabaseKey = 'TU_ANON_KEY_AQUÍ'; 
const supabase = createClient(supabaseUrl, supabaseKey);

// 1. Obtener todas las cuentas disponibles
app.get('/api/cuentas', async (req, res) => {
    const { data, error } = await supabase.from('cuentas').select('*');
    if (error) return res.status(500).json(error);
    res.json(data);
});

// 2. Obtener productos con el nombre del Gmail asociado
app.get('/api/datos', async (req, res) => {
    const { data, error } = await supabase
        .from('inventario')
        .select(`*, cuentas(nombre_gmail)`)
        .order('id', { ascending: false });
    if (error) return res.status(500).json(error);
    res.json(data);
});

// 3. Registrar nuevo producto asociado a una ID de cuenta
app.post('/api/nuevo', async (req, res) => {
    const { articulo, id_cuenta, p_compra, envio, p_venta, unidades } = req.body;
    const { error } = await supabase.from('inventario').insert([
        { articulo, id_cuenta, precio_compra: p_compra, envio_pago: envio, precio_venta: p_venta, unidades }
    ]);
    if (error) return res.status(500).json(error);
    res.json({ status: "ok" });
});

app.put('/api/vender/:id', async (req, res) => {
    const { error } = await supabase.from('inventario')
        .update({ estado: 'Vendido', fecha_venta: new Date().toISOString() })
        .eq('id', req.params.id);
    if (error) return res.status(500).json(error);
    res.json({ status: "ok" });
});

// ESCUCHAR EN 0.0.0.0 para permitir conexiones externas
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SERVIDOR ACCESIBLE EN EL PUERTO ${PORT}`);
});