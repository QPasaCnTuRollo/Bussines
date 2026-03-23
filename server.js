const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const cors = require('cors');

const app = express();

// Configuración básica
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Verificar variables antes de conectar para evitar que el servidor explote
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ ERROR: Faltan las variables SUPABASE_URL o SUPABASE_KEY en Render.");
}

const supabase = createClient(supabaseUrl || '', supabaseKey || '');

// Endpoints
app.get('/api/cuentas', async (req, res) => {
    try {
        const { data, error } = await supabase.from('cuentas').select('*');
        if (error) throw error;
        res.json(data || []);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/datos', async (req, res) => {
    try {
        const { data, error } = await supabase.from('inventario').select(`*, cuentas(nombre_gmail)`).order('id', { ascending: false });
        if (error) throw error;
        res.json(data || []);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/nuevo', async (req, res) => {
    try {
        const venta = {
            articulo: req.body.articulo,
            id_cuenta: parseInt(req.body.id_cuenta),
            precio_compra: parseFloat(req.body.precio_compra) || 0,
            precio_venta: parseFloat(req.body.precio_venta) || 0,
            unidades: 1,
            estado: 'Vendido',
            fecha_venta: new Date().toISOString()
        };

        const { error } = await supabase.from('inventario').insert([venta]);
        if (error) return res.status(400).json({ detalle: error.message });
        
        res.json({ status: "ok" });
    } catch (err) {
        res.status(500).json({ detalle: err.message });
    }
});

app.delete('/api/eliminar/:id', async (req, res) => {
    await supabase.from('inventario').delete().eq('id', req.params.id);
    res.json({ status: "ok" });
});

// Servir el HTML
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor V-Masters corriendo en puerto ${PORT}`);
});
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log("Servidor V-Masters Activo"));
