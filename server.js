const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const cors = require('cors');

const app = express();

// CONFIGURACIÓN
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// CONEXIÓN SUPABASE
const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_KEY || '');

// 1. LISTAR CUENTAS
app.get('/api/cuentas', async (req, res) => {
    try {
        const { data } = await supabase.from('cuentas').select('*');
        res.json(data || []);
    } catch (e) { res.status(500).send(e); }
});

// 2. LISTAR DATOS INVENTARIO
app.get('/api/datos', async (req, res) => {
    try {
        const { data } = await supabase.from('inventario').select(`*, cuentas(nombre_gmail)`).order('id', { ascending: false });
        res.json(data || []);
    } catch (e) { res.status(500).send(e); }
});

// 3. INSERTAR PRODUCTO (EL QUE DABA EL ERROR)
app.post('/api/nuevo', async (req, res) => {
    try {
        const { articulo, id_cuenta, precio_compra, precio_venta } = req.body;
        
        const { error } = await supabase.from('inventario').insert([
            { 
                articulo: articulo, 
                id_cuenta: parseInt(id_cuenta), 
                precio_compra: parseFloat(precio_compra) || 0, 
                precio_venta: parseFloat(precio_venta) || 0,
                fecha_venta: new Date().toISOString()
            }
        ]);

        if (error) throw error;
        res.json({ status: "ok" });
    } catch (err) {
        console.error("Error Supabase:", err.message);
        res.status(400).json({ detalle: err.message });
    }
});

// 4. ELIMINAR
app.delete('/api/eliminar/:id', async (req, res) => {
    await supabase.from('inventario').delete().eq('id', req.params.id);
    res.json({ status: "ok" });
});

// 5. SERVIR HTML
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// INICIO DEL SERVIDOR
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 V-Masters Live on Port ${PORT}`);
});
