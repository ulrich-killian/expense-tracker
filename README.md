Expense Tracker
This app was built with plain JavaScript and DOM manipulation. It helps track expenses and income, especially for micro-businesses, and includes a chart for clear user experience. Users can add an input, a description and an amount (positive for income, negative for expense).

Tech Stack

    JavaScript

    HTML

    CSS

Installation & Setup
Clone the repository:

git clone https://github.com/ulrich-killian/expense-tracker

Architecture & Logic
Project Structure:
text

 src/chart.js        # Chart display logic
 index.html          # Main HTML file
 src/script.js       # DOM manipulation and logic
 style.css           # Styling
 README.md           # Project description

Key Design Decisions
The goal was to create a responsive and user-friendly app for tracking expenses and income.

State Management
We use localStorage to store JSON-parsed data, ensuring persistence across page reloads since no backend is included at this stage.
