const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect('mongodb://localhost:27017/finalproject');

// Define User Schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// Define Expense Schema
const expenseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    category: { type: String },
    card: { type: String },
    amount: { type: Number, required: true }
});
const Expense = mongoose.model('Expense', expenseSchema);

app.post('/register', async (req, res) => {
    try {
        const { name, email } = req.body;
        console.log('Received data:', { name, email });
        const newUser = new User({ name, email });
        await newUser.save();
        res.redirect('/expense.html');
    } catch (error) {
        console.error('Error saving user:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/user/:email', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email });
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/expense.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'expense.html'));
});

// Create a new expense
app.post('/expenses', async (req, res) => {
    try {
        const { name, description, category, card, amount } = req.body;
        const newExpense = new Expense({ name, description, category, card, amount });
        await newExpense.save();
        res.status(201).json(newExpense);
    } catch (error) {
        console.error('Error creating expense:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Get all expenses
app.get('/expenses', async (req, res) => {
    try {
        const expenses = await Expense.find();
        res.json(expenses);
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Delete an expense
app.delete('/expenses/:id', async (req, res) => {
    try {
        const result = await Expense.deleteOne({ _id: req.params.id });
        if (result.deletedCount === 0) {
            return res.status(404).send('Expense not found');
        }
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(5000, () => {
    console.log('Server running on port 5000');
});
