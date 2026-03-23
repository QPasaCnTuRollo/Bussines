const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.get('/api/cuentas', async (req, res) => {
    const { data } = await supabase.from('cuentas').select('*');
    res.json(data || []);
});

app.get('/api/datos', async (req, res) => {
    const { data } = await supabase.from('inventario').select(`*, cuentas(nombre_gmail)`).order('id', { ascending: false });
    res.json(data || []);
});

app.post('/api/nuevo', async (req, res) => {
    try {
        const venta = {
            articulo: req.body.articulo,
            id_cuenta: parseInt(req.body.id_cuenta),
            precio_compra: parseFloat(req.body.precio_compra) || 0,
            precio_venta: parseFloat(req.body.precio_venta) || 0,
            envio_pago: 0, // Lo enviamos a 0 porque ahora el envío es global manual
            unidades: 1,
            estado: 'Vendido',
            fecha_venta: new Date().toISOString()
        };

        const { error } = await supabase.from('inventario').insert([venta]);
        
        // SI HAY ERROR, LO DEVOLVEMOS AL FRONTEND PARA VERLO
        if (error) {
            console.error("Fallo Supabase:", error);
            return res.status(400).json({ detalle: error.message });
        }
        res.json({ status: "ok" });
    } catch (err) {
        console.error("Error de servidor:", err);
        res.status(500).json({ detalle: err.message });
    }
});

app.delete('/api/eliminar/:id', async (req, res) => {
    await supabase.from('inventario').delete().eq('id', req.params.id);
    res.json({ status: "ok" });
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log("Servidor V-Masters Activo"));
