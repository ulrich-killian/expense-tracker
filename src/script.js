class ExpenseTracker {
    constructor() {
        this.transactions = this.loadTransactions();
        this.currentFilter = 'all';
        this.transactionToDelete = null;
        this.init();
    }
  
    init() {

        document.getElementById('date').valueAsDate = new Date();
        
        this.updateUI();
        this.setupEventListeners();
    }
  

    showToast(message, type = 'error', duration = 5000) {

      const existingToasts = document.querySelectorAll('.toast');
      if (existingToasts.length >= 3) {
        existingToasts[0].remove();
      }

      const toast = document.createElement('div');
      toast.className = `toast ${type}`;

      const icon = type === 'success' ? 'fas fa-check-circle' : 
                   type === 'info' ? 'fas fa-info-circle' : 
                   'fas fa-exclamation-circle';

      toast.innerHTML = `
        <i class="${icon}"></i>
        <span>${message}</span>
        <button class="close-btn" aria-label="Close notification">
          <i class="fas fa-times"></i>
        </button>
        <div class="progress-bar"></div>
      `;

      let toastContainer = document.getElementById('toast-container');
      if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        document.body.appendChild(toastContainer);
      }

      toastContainer.appendChild(toast);

      const closeBtn = toast.querySelector('.close-btn');
      closeBtn.addEventListener('click', () => {
        this.removeToast(toast);
      });
      const timeoutId = setTimeout(() => {
        this.removeToast(toast);
      }, duration);

      toast.dataset.timeoutId = timeoutId;
    }
  
    removeToast(toast) {

      if (toast.dataset.timeoutId) {
        clearTimeout(parseInt(toast.dataset.timeoutId));
      }

      toast.classList.add('slide-out');

      setTimeout(() => {
        toast.remove();
      }, 400);
    }

    showSuccess(message, duration = 3000) {
      this.showToast(message, 'success', duration);
    }
  
    showError(message, duration = 5000) {
      this.showToast(message, 'error', duration);
    }
  
    showInfo(message, duration = 4000) {
      this.showToast(message, 'info', duration);
    }

    saveTransactions() {
        localStorage.setItem('expenseTrackerTransactions', JSON.stringify(this.transactions));
    }
  
    loadTransactions() {
        const data = localStorage.getItem('expenseTrackerTransactions');
        return data ? JSON.parse(data) : [];
    }

    addTransaction(description, amount, type, date, category) {
        const transaction = {
            id: Date.now(),
            description,
            amount: parseFloat(amount),
            type,
            date: date || new Date().toISOString().split('T')[0],
            category
        };
  
        this.transactions.unshift(transaction);
        this.saveTransactions();
        this.updateUI();

        this.showSuccess(`${type === 'income' ? '💰 Income' : '💸 Expense'} added: ${description} - CFA ${parseFloat(amount).toFixed(2)}`);
        
        if (typeof updateCharts === 'function') {
            updateCharts(this.transactions);
        }
    }
  
    deleteTransaction(id) {
        const transaction = this.transactions.find(t => t.id === id);
        this.transactions = this.transactions.filter(t => t.id !== id);
        this.saveTransactions();
        this.updateUI();

        this.showInfo(`Deleted: ${transaction.description} - CFA ${transaction.amount.toFixed(2)}`);
        
        if (typeof updateCharts === 'function') {
            updateCharts(this.transactions);
        }
    }
  
    clearAllTransactions() {
        if (confirm('Are you sure you want to delete ALL transactions? This cannot be undone.')) {
            const count = this.transactions.length;
            this.transactions = [];
            localStorage.removeItem('expenseTrackerTransactions');
            this.updateUI();

            this.showInfo(`Cleared all ${count} transactions`);
            
            if (typeof updateCharts === 'function') {
                updateCharts(this.transactions);
            }
        }
    }

    calculateTotals() {
        const income = this.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
  
        const expense = this.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
  
        const balance = income - expense;
  
        return { balance, income, expense };
    }

    getFilteredTransactions() {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
  
        return this.transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            
            switch(this.currentFilter) {
                case 'income':
                    return transaction.type === 'income';
                case 'expense':
                    return transaction.type === 'expense';
                case 'month':
                    return transactionDate.getMonth() === currentMonth && 
                           transactionDate.getFullYear() === currentYear;
                default:
                    return true;
            }
        });
    }

    updateUI() {
        const totals = this.calculateTotals();
        const filteredTransactions = this.getFilteredTransactions();

        document.getElementById('totalBalance').textContent = 
            `CFA ${totals.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
        document.getElementById('totalIncome').textContent = 
            `CFA ${totals.income.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
        document.getElementById('totalExpense').textContent = 
            `CFA ${totals.expense.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
        

        document.getElementById('transactionCount').textContent = 
            `${filteredTransactions.length} transaction${filteredTransactions.length !== 1 ? 's' : ''}`;
    
        this.renderTransactionsList(filteredTransactions);
    }
  
    renderTransactionsList(transactions) {
        const transactionsList = document.getElementById('transactionsList');
        
        if (transactions.length === 0) {
            transactionsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-receipt"></i>
                    <h3>No transactions found</h3>
                    <p>${this.currentFilter === 'all' ? 'Add your first transaction to get started!' : 
                        'No transactions match the current filter'}</p>
                </div>
            `;
            return;
        }
  
        transactionsList.innerHTML = transactions.map(transaction => `
            <div class="transaction-item ${transaction.type}">
                <div class="transaction-info">
                    <div class="transaction-description">${transaction.description}</div>
                    <div class="transaction-meta">
                        <span class="transaction-date">
                            <i class="far fa-calendar"></i> ${this.formatDate(transaction.date)}
                        </span>
                        <span class="transaction-category">
                            <i class="fas fa-tag"></i> ${transaction.category}
                        </span>
                    </div>
                </div>
                <div class="transaction-amount">
                    ${transaction.type === 'income' ? '+' : '-'}CFA ${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div class="transaction-actions">
                    <button class="delete-btn" onclick="expenseTracker.showDeleteModal(${transaction.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
  

    formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }

    showDeleteModal(id) {
        this.transactionToDelete = id;
        document.getElementById('deleteModal').style.display = 'flex';
    }
  
    hideDeleteModal() {
        this.transactionToDelete = null;
        document.getElementById('deleteModal').style.display = 'none';
    }
  

    setupEventListeners() {

        document.getElementById('transactionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const description = document.getElementById('description').value.trim();
            const amount = document.getElementById('amount').value;
            const type = document.getElementById('type').value;
            const date = document.getElementById('date').value;
            const category = document.getElementById('category').value;

            if (!description || !amount || amount <= 0) {
                this.showError('Please enter a valid description and amount (amount must be greater than 0)');
                return;
            }
            
            this.addTransaction(description, amount, type, date, category);

            document.getElementById('transactionForm').reset();
            document.getElementById('date').valueAsDate = new Date();
            document.getElementById('description').focus();
        });

        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;

                if (this.currentFilter !== 'all') {
                    const filterName = this.currentFilter === 'income' ? 'Income' :
                                      this.currentFilter === 'expense' ? 'Expenses' : 'This Month';
                    this.showInfo(`Filter applied: ${filterName}`);
                }
                
                this.updateUI();
            });
        });

        document.getElementById('cancelDelete').addEventListener('click', () => {
            this.hideDeleteModal();
        });
  
        document.getElementById('confirmDelete').addEventListener('click', () => {
            if (this.transactionToDelete) {
                this.deleteTransaction(this.transactionToDelete);
                this.hideDeleteModal();
            }
        });

        document.getElementById('clearAllBtn').addEventListener('click', () => {
            this.clearAllTransactions();
        });

        document.getElementById('deleteModal').addEventListener('click', (e) => {
            if (e.target.id === 'deleteModal') {
                this.hideDeleteModal();
            }
        });

        document.addEventListener('keydown', (e) => {

            if (e.key === 'Escape' && document.getElementById('deleteModal').style.display === 'flex') {
                this.hideDeleteModal();
            }

            if (e.ctrlKey && e.key === 'Enter' && 
                (e.target.id === 'description' || e.target.id === 'amount')) {
                document.getElementById('transactionForm').requestSubmit();
            }
        });
    }
  }
  
  let expenseTracker;
  
  document.addEventListener('DOMContentLoaded', () => {
    expenseTracker = new ExpenseTracker();
    
    setTimeout(() => {
        const transactionCount = expenseTracker.transactions.length;
        if (transactionCount === 0) {
            expenseTracker.showInfo('👋 Welcome! Start by adding your first transaction.', 6000);
        } else {
            expenseTracker.showSuccess(`Welcome back! You have ${transactionCount} transaction${transactionCount !== 1 ? 's' : ''}`, 4000);
        }
    }, 1000);
  });