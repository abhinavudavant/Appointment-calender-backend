const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const moment = require('moment');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

app.get('/appointments', (req, res) => {
    db.query('SELECT * FROM Appointments', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

app.post('/appointments', (req, res) => {
    const { title, start_time, end_time, doctor_id } = req.body;

    const formattedStartTime = moment(start_time).format('YYYY-MM-DD HH:mm:ss');
    const formattedEndTime = moment(end_time).format('YYYY-MM-DD HH:mm:ss');

    if (!title || !formattedStartTime || !formattedEndTime) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    db.query(
        'INSERT INTO appointments (title, start_time, end_time, doctor_id) VALUES (?, ?, ?, ?)',
        [title, formattedStartTime, formattedEndTime, doctor_id],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: err.message });
            }
            res.status(201).send('Appointment added');
        }
    );
});

app.put('/appointments/:id', (req, res) => {
    const { start_time, end_time } = req.body;
    const { id } = req.params;

    if (!start_time || !end_time) {
        return res.status(400).json({ error: 'Start time and end time are required' });
    }

    const formattedStartTime = moment(start_time).format('YYYY-MM-DD HH:mm:ss');
    const formattedEndTime = moment(end_time).format('YYYY-MM-DD HH:mm:ss');

    db.query(
        'UPDATE appointments SET start_time = ?, end_time = ? WHERE id = ?',
        [formattedStartTime, formattedEndTime, id],
        (err, result) => {
            if (err) {
                console.error('Error updating appointment:', err);
                return res.status(500).json({ error: 'Failed to update appointment' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Appointment not found' });
            }
            res.status(200).json({ message: 'Appointment updated successfully' });
        }
    );
});

app.get('/', (req, res) => {
    res.send('Backend is working!');
});

app.delete('/appointments/:id', (req, res) => {
    const { id } = req.params;
    
    db.query('DELETE FROM appointments WHERE id = ?', [id], (err, result) => {
        if (err) {
            console.error('Error deleting appointment:', err);
            return res.status(500).json({ error: 'Failed to delete appointment' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Appointment not found' });
        }
        res.status(200).json({ message: 'Appointment deleted successfully' });
    });
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err.stack);
        return;
    }
    console.log('Connected to the database');
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
