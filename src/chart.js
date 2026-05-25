
let balanceChart = null;
let categoryChart = null;


function updateCharts(transactions = []) {

    const totals = calculateTotalsFromTransactions(transactions);
    
  
    const categoryData = {};
    transactions.forEach(t => {
        if (t.type === 'expense') {
            categoryData[t.category] = (categoryData[t.category] || 0) + t.amount;
        }
    });

 
    const categories = Object.keys(categoryData);
    const amounts = Object.values(categoryData);
    
   
    const hasTransactionData = transactions.length > 0;
    const hasExpenseData = categories.length > 0;

    
    updateBalanceChart(totals, hasTransactionData);
    
   
    updateCategoryChart(categories, amounts, hasExpenseData);
}


function calculateTotalsFromTransactions(transactions) {
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const expense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const balance = income - expense;

    return { balance, income, expense };
}


function updateBalanceChart(totals, hasData) {
    const balanceCanvas = document.getElementById('balanceChart');
    if (!balanceCanvas) {
        console.error('Balance chart canvas not found!');
        return;
    }
    
    const balanceCtx = balanceCanvas.getContext('2d');
    
   
    if (balanceChart) {
        balanceChart.destroy();
    }
    
 
    balanceChart = new Chart(balanceCtx, {
        type: 'bar',
        data: {
            labels: ['Income', 'Expenses', 'Balance'],
            datasets: [{
                label: 'Amount (CFA)',
                data: [
                    hasData ? totals.income : 0,
                    hasData ? totals.expense : 0,
                    hasData ? totals.balance : 0
                ],
                backgroundColor: [
                    'rgba(46, 204, 113, 0.8)',
                    'rgba(231, 76, 60, 0.8)',
                    'rgba(52, 152, 219, 0.8)'
                ],
                borderColor: [
                    'rgb(39, 174, 96)',
                    'rgb(192, 57, 43)',
                    'rgb(41, 128, 185)'
                ],
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `CFA ${context.raw.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
                        }
                    },
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: { size: 14 },
                    bodyFont: { size: 14 },
                    padding: 12
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        callback: function(value) {
                            return 'CFA ' + value.toLocaleString();
                        },
                        font: {
                            size: 12
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 13,
                            weight: 'bold'
                        }
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        }
    });
}

function updateCategoryChart(categories, amounts, hasData) {
    const categoryCanvas = document.getElementById('categoryChart');
    if (!categoryCanvas) {
        console.error('Category chart canvas not found!');
        return;
    }
    
    const categoryCtx = categoryCanvas.getContext('2d');
    
    if (categoryChart) {
        categoryChart.destroy();
    }
    
    if (!hasData) {
      
        categoryChart = new Chart(categoryCtx, {
            type: 'doughnut',
            data: {
                labels: ['No Expenses'],
                datasets: [{
                    data: [1],
                    backgroundColor: ['rgba(200, 200, 200, 0.3)'],
                    borderColor: ['rgba(200, 200, 200, 0.5)'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: false
                    }
                },
                cutout: '70%'
            }
        });
        
    
        const ctx = categoryCtx;
        const width = categoryCanvas.width;
        const height = categoryCanvas.height;
        
       
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 14px Arial';
        ctx.fillStyle = '#999';
        ctx.fillText('No expenses yet', width / 2, height / 2);
        ctx.restore();
        
    } else {
      
        const generateColors = (count) => {
            const colors = [];
            for (let i = 0; i < count; i++) {
                const hue = (i * 137.5) % 360;
                colors.push(`hsl(${hue}, 70%, 60%)`);
            }
            return colors;
        };

       
        categoryChart = new Chart(categoryCtx, {
            type: 'pie',
            data: {
                labels: categories,
                datasets: [{
                    data: amounts,
                    backgroundColor: generateColors(categories.length),
                    borderColor: 'white',
                    borderWidth: 2,
                    hoverOffset: 15
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            padding: 15,
                            usePointStyle: true,
                            pointStyle: 'circle',
                            font: {
                                size: 12
                            },
                            color: '#333'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const total = amounts.reduce((a, b) => a + b, 0);
                                const percentage = ((context.raw / total) * 100).toFixed(1);
                                return `${context.label}: CFA ${context.raw.toLocaleString()} (${percentage}%)`;
                            }
                        },
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleFont: { size: 14 },
                        bodyFont: { size: 14 },
                        padding: 12
                    }
                },
                animation: {
                    animateScale: true,
                    animateRotate: true,
                    duration: 1000
                }
            }
        });
    }
}


function initCharts() {
    
    const savedData = localStorage.getItem('expenseTrackerTransactions');
    const transactions = savedData ? JSON.parse(savedData) : [];
    
    
    updateCharts(transactions);
}
document.addEventListener('DOMContentLoaded', initCharts);

window.updateCharts = updateCharts;