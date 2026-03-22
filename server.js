const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const cors = require('cors');

const app = express();

// Middlewares básicos
app.use(cors());
app.use(express.json());

// CONFIGURACIÓN DE RUTAS ESTÁTICAS
app.use(express.static(path.join(__dirname, 'public')));

// CONFIGURACIÓN DE SUPABASE (Usando Variables de Entorno de Render)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ ERROR CRÍTICO: Faltan las variables SUPABASE_URL o SUPABASE_KEY en Render.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

// --- ENDPOINTS DE LA API ---

// 1. Obtener todas las cuentas (para el desplegable)
app.get('/api/cuentas', async (req, res) => {
    const { data, error } = await supabase.from('cuentas').select('*');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// 2. Obtener inventario (con el nombre del Gmail asociado)
app.get('/api/datos', async (req, res) => {
    const { data, error } = await supabase
        .from('inventario')
        .select(`*, cuentas(nombre_gmail)`)
        .order('id', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// 3. Registrar nuevo producto
app.post('/api/nuevo', async (req, res) => {
    const { articulo, id_cuenta, p_compra, envio, p_venta, unidades } = req.body;
    const { error } = await supabase.from('inventario').insert([
        { articulo, id_cuenta, precio_compra: p_compra, envio_pago: envio, precio_venta: p_venta, unidades, estado: 'Stock' }
    ]);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ status: "ok" });
});

// 4. Marcar como vendido
app.put('/api/vender/:id', async (req, res) => {
    const { error } = await supabase.from('inventario')
        .update({ estado: 'Vendido', fecha_venta: new Date().toISOString() })
        .eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ status: "ok" });
});

// Ruta especial para fotos de perfil (opcional, si no las pones en /public directamente)
app.get('/api/profiles/:name', (req, res) => {
  const file = path.join(__dirname, 'public', req.params.name);
  res.sendFile(file);
});

// RUTA RAIZ: Fuerza la carga del index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// INICIO DEL SERVIDOR
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`
    🚀 V-MASTER CLOUD ACTIVADO [eDEX-UI Core]
    📡 Puerto Render: ${PORT}
    `);
});
