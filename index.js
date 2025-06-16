import express from 'express'
import mysql from 'mysql2'

const app = express();
const port = 3001;

// Configura conexión a MySQL (ajusta user, password, host y dbname)
const connection = mysql.createConnection({
    host: 'localhost',       // si Node corre en host, si en Docker puede cambiar
    user: 'root',
    password: 'password',
    database: 'base_empleados',
    charset: 'utf8'
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    connection.query('SELECT * FROM personal', (err, results) => {
        if (err) {
            console.error('Error en la consulta SQL:', err);
            res.status(500).send('Error en consulta SQL');
            return;
        }
        if (results.length === 0) {
            return res.status(404).send('No hay empleados registrados');
        }
        console.log('Empleados encontrados:', results);
        res.status(200).send(
            '<!DOCTYPE html>' +
            '<html lang="es">' +
            '<head>' +
            '<meta charset="UTF-8">' +
            '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
            '<title>Empleados</title>' +
            '<style>' +
            'body { font-family: Arial, sans-serif; background: #f9f9f9; margin: 0; padding: 20px; }' +
            'h1 { color: #333; }' +
            'table { width: 100%; border-collapse: collapse; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }' +
            'th, td { border: 1px solid #ddd; padding: 10px 12px; text-align: left; }' +
            'th { background-color: #4CAF50; color: white; }' +
            'tr:nth-child(even) { background-color: #f2f2f2; }' +
            'button { margin: 2px; padding: 6px 14px; border: none; border-radius: 4px; cursor: pointer; font-size: 1em; }' +
            'button[onclick*="crear"] { background: #2196F3; color: #fff; }' +
            'button[onclick*="actualizar"] { background: #FFC107; color: #333; }' +
            'button[onclick*="borrar"] { background: #F44336; color: #fff; }' +
            'button:hover { opacity: 0.85; }' +
            '</style>' +
            '</head>' +
            '<body>' +
            '<h1>Lista de Empleados</h1>' +
            '<button onclick="window.location.href=\'/crear\'">Crear Nuevo</button>' +
            '<table>' +
            '<tr><th>ID</th><th>Nombre</th><th>Cargo</th><th>Sueldo</th><th>Acciones</th></tr>' +
            results.map(emp =>
                `<tr>
            <td>${emp.id}</td>
            <td>${emp.nombre}</td>
            <td>${emp.cargo}</td>
            <td>${emp.sueldo}</td>
            <td>
                <button onclick="window.location.href='/actualizar/${emp.id}'">Actualizar</button>
                <button onclick="window.location.href='/borrar/${emp.id}'">Borrar</button>
            </td>
        </tr>`
            ).join('') +
            '</table>' +
            '</body>' +
            '</html>'
        );
    });
});

app.get('/crear', (req, res) => {
    res.send(
        '<!DOCTYPE html>' +
        '<html lang="es">' +
        '<head>' +
        '<meta charset="UTF-8">' +
        '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
        '<title>Crear Empleado</title>' +
        '<style>' +
        'body { background: #f4f6f8; font-family: Arial, sans-serif; margin: 0; padding: 0; }' +
        '.container { min-height: 100vh; display: flex; align-items: center; justify-content: center; }' +
        '.card { background: #fff; padding: 32px 28px; border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); width: 350px; }' +
        'h1 { text-align: center; color: #333; margin-bottom: 24px; }' +
        'form { display: flex; flex-direction: column; gap: 16px; }' +
        'label { font-weight: bold; color: #555; margin-bottom: 4px; }' +
        'input[type="text"], input[type="number"] { padding: 8px 10px; border: 1px solid #ccc; border-radius: 5px; font-size: 1em; }' +
        'button { padding: 10px 0; border: none; border-radius: 5px; font-size: 1em; cursor: pointer; margin-top: 8px; background: #2196F3; color: #fff; font-weight: bold; }' +
        'button.cancel { background: #f44336; color: #fff; font-weight: bold; margin-top: 0; }' +
        'button:hover { opacity: 0.9; }' +
        '</style>' +
        '</head>' +
        '<body>' +
        '<div class="container">' +
        '<div class="card">' +
        '<h1>Crear Nuevo Empleado</h1>' +
        '<form action="/crear" method="POST">' +
        '<label>Nombre:</label>' +
        '<input type="text" name="nombre" required>' +
        '<label>Cargo:</label>' +
        '<input type="text" name="cargo" required>' +
        '<label>Sueldo:</label>' +
        '<input type="number" name="sueldo" required>' +
        '<button type="submit">Guardar</button>' +
        '<button type="button" class="cancel" onclick="window.location.href=\'/\'">Cancelar</button>' +
        '</form>' +
        '</div>' +
        '</div>' +
        '</body>' +
        '</html>'
    );
});

app.post('/crear', (req, res) => {
    const { nombre, cargo, sueldo } = req.body;
    connection.query(
        'INSERT INTO personal (nombre, cargo, sueldo) VALUES (?, ?, ?)',
        [nombre, cargo, sueldo],
        (err, results) => {
            if (err) {
                console.error('Error al crear empleado:', err);
                res.status(500).send('Error al crear empleado');
                return;
            }
            console.log('Empleado creado con ID:', results.insertId);
            res.redirect('/');
        }
    );
});

app.get('/actualizar/:id', (req, res) => {
    const id = req.params.id;
    connection.query('SELECT * FROM personal WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error('Error al obtener empleado:', err);
            res.status(500).send('Error al obtener empleado');
            return;
        }
        if (results.length === 0) {
            return res.status(404).send('Empleado no encontrado');
        }
        res.send(
            '<!DOCTYPE html>' +
            '<html lang="es">' +
            '<head>' +
            '<meta charset="UTF-8">' +
            '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
            '<title>Actualizar Empleado</title>' +
            '<style>' +
            'body { background: #f4f6f8; font-family: Arial, sans-serif; margin: 0; padding: 0; }' +
            '.container { min-height: 100vh; display: flex; align-items: center; justify-content: center; }' +
            '.card { background: #fff; padding: 32px 28px; border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); width: 350px; }' +
            'h1 { text-align: center; color: #333; margin-bottom: 24px; }' +
            'form { display: flex; flex-direction: column; gap: 16px; }' +
            'label { font-weight: bold; color: #555; margin-bottom: 4px; }' +
            'input[type="text"], input[type="number"] { padding: 8px 10px; border: 1px solid #ccc; border-radius: 5px; font-size: 1em; }' +
            'button { padding: 10px 0; border: none; border-radius: 5px; font-size: 1em; cursor: pointer; margin-top: 8px; }' +
            'button[type="submit"] { background: #4CAF50; color: #fff; font-weight: bold; }' +
            'button.cancel { background: #f44336; color: #fff; font-weight: bold; margin-top: 0; }' +
            'button:hover { opacity: 0.9; }' +
            '</style>' +
            '</head>' +
            '<body>' +
            '<div class="container">' +
            '<div class="card">' +
            '<h1>Actualizar Empleado</h1>' +
            `<form action="/actualizar/${id}" method="POST">` +
            '<label>Nombre:</label>' +
            `<input type="text" name="nombre" value="${results[0].nombre}" required>` +
            '<label>Cargo:</label>' +
            `<input type="text" name="cargo" value="${results[0].cargo}" required>` +
            '<label>Sueldo:</label>' +
            `<input type="number" name="sueldo" value="${results[0].sueldo}" required>` +
            '<button type="submit">Actualizar</button>' +
            '<button type="button" class="cancel" onclick="window.location.href=\'/\'">Cancelar</button>' +
            '</form>' +
            '</div>' +
            '</div>' +
            '</body>' +
            '</html>'
        )
    })
});

app.post('/actualizar/:id', (req, res) => {
    const id = req.params.id;
    const { nombre, cargo, sueldo } = req.body;
    connection.query('UPDATE personal SET nombre = ?, cargo = ?, sueldo = ? WHERE id = ?',
        [nombre, cargo, sueldo, id],
        (err, results) => {
            if (err) {
                console.error('Error al actualizar empleado:', err);
                res.status(500).send('Error al actualizar empleado');
                return;
            }
            if (results.affectedRows === 0) {
                return res.status(404).send('Empleado no encontrado');
            }
            return res.redirect('/');
        }
    )
})

app.get('/borrar/:id', (req, res) => {
    const id = req.params.id;
    connection.query('DELETE FROM personal WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error('Error al borrar empleado:', err);
            res.status(500).send('Error al borrar empleado');
            return;
        }
        if (results.affectedRows === 0) {
            return res.status(404).send('Empleado no encontrado');
        }
        res.redirect('/');
    });
});


app.listen(port, () => {
    console.log(`Servidor web corriendo en http://localhost:${port}`);
});
