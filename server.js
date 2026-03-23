app.post('/api/nuevo', async (req, res) => {
    try {
        // Solo enviamos lo estrictamente necesario para evitar errores de columnas inexistentes
        const { articulo, id_cuenta, precio_compra, precio_venta } = req.body;

        const { data, error } = await supabase
            .from('inventario')
            .insert([
                { 
                    articulo: articulo, 
                    id_cuenta: parseInt(id_cuenta), 
                    precio_compra: parseFloat(precio_compra) || 0, 
                    precio_venta: parseFloat(precio_venta) || 0,
                    fecha_venta: new Date().toISOString()
                    // Si 'estado' o 'unidades' te dan error, no los pongas aquí; 
                    // deja que Supabase use sus valores por defecto.
                }
            ]);

        if (error) {
            console.error("Error detallado de Supabase:", error.message);
            return res.status(400).json({ detalle: error.message });
        }
        
        res.json({ status: "ok" });
    } catch (err) {
        console.error("Error en el bloque catch:", err.message);
        res.status(500).json({ detalle: err.message });
    }
});
