document.addEventListener('DOMContentLoaded', () => {
    loadExpenses(); // Load existing expenses when the page loads
});

document.getElementById('expense-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const expenseForm = document.getElementById('expense-form');
    const expenseHistory = document.getElementById('expense-history');
    const expenseDetails = document.getElementById('expenseDetails');

    // Get input values
    const name = document.getElementById('expense-name').value;
    const desc = document.getElementById('expense-desc').value;
    const category = document.getElementById('expense-category').value;
    const amount = parseFloat(document.getElementById('expense-amount').value);
    const card = document.getElementById('expense-card').value;

    // Validation: Ensure all fields are filled
    if (!name || !desc || !category || isNaN(amount) || !card) {
        alert('All fields are required!');
        return;
    }

    // Create an expense object
    const expense = {
        name: name,
        description: desc,
        category: category,
        card: card,
        amount: parseFloat(amount)
    };

    try {
        // Send expense to the server
        const response = await fetch('/expenses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(expense)
        });
        const newExpense = await response.json();

        // Add the new expense to the list and display it
        displayExpense(newExpense);

        // Update total
        const totalElement = document.getElementById('total-amount');
        const currentTotal = parseFloat(totalElement.textContent);
        totalElement.textContent = (currentTotal + amount).toFixed(2);

        // Clear the form
        expenseForm.reset();
    } catch (error) {
        console.error('Error saving expense:', error);
    }
});

async function loadExpenses() {
    try {
        const response = await fetch('/expenses');
        const expenses = await response.json();

        expenses.forEach(expense => {
            displayExpense(expense);

            // Update total
            const totalElement = document.getElementById('total-amount');
            const currentTotal = parseFloat(totalElement.textContent);
            totalElement.textContent = (currentTotal + expense.amount).toFixed(2);
        });
    } catch (error) {
        console.error('Error fetching expenses:', error);
    }
}

function displayExpense(expense) {
    const expenseHistory = document.getElementById('expense-history');

    const li = document.createElement('li');
    li.innerHTML = `<div style="display: flex; align-items: center; justify-content: space-between;">
            <span>${expense.name}</span>
            <span>$${expense.amount.toFixed(2)}</span>
            <button class="delete-btn" data-expense-id="${expense._id}">x</button>
        </div>`;
    li.dataset.expenseId = expense._id;
    li.classList.add('cursor-pointer', 'hover:bg-gray-100', 'p-2', 'rounded');

    // Add click event to display details
    li.addEventListener('click', function () {
        showExpenseDetails(expense);
    });

    li.querySelector('.delete-btn').addEventListener('click', async function (event) {
        event.stopPropagation(); // Prevent triggering the detail view
        await deleteExpense(expense._id);
    });

    expenseHistory.appendChild(li);
}

async function deleteExpense(id) {
    try {
        const response = await fetch(`/expenses/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            const expenseItem = document.querySelector(`[data-expense-id="${id}"]`);
            if (expenseItem) {
                const deletedExpenseAmount = parseFloat(expenseItem.querySelector('span:last-child').textContent.replace('$', ''));
                expenseItem.remove();

                const totalElement = document.getElementById('total-amount');
                const currentTotal = parseFloat(totalElement.textContent);
                totalElement.textContent = (currentTotal - deletedExpenseAmount).toFixed(2);
            }
        } else {
            console.error('Error deleting expense:', await response.text());
        }
    } catch (error) {
        console.error('Error deleting expense:', error);
    }
}
