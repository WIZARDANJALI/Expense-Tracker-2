const BASE_URL = "https://expense-tracker-2-6s84.onrender.com";


// ---------------- SIGNUP ----------------
async function signup() {

    const data = {
        username: document.getElementById("username").value,
        email: document.getElementById("signupEmail").value,
        password: document.getElementById("signupPassword").value
    };

    const res = await fetch(`${BASE_URL}/signup`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data)
    });

    const result = await res.json();

    alert(result.message || "Signup successful");

    window.location.href = "login.html";
}


// ---------------- LOGIN ----------------
async function login() {

    const data = {
        email: document.getElementById("loginEmail").value,
        password: document.getElementById("loginPassword").value
    };

    const res = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data)
    });

    const result = await res.json();

    if (!res.ok) {
        alert(result.detail || "Login failed");
        return;
    }

    localStorage.setItem("token", result.access_token);

    alert("Login successful");

    window.location.href = "dashboard.html";
}


// ---------------- LOGOUT ----------------
function logout() {
    localStorage.removeItem("token");
    window.location.href = "login.html";
}


// ---------------- ADD EXPENSE ----------------
async function addExpense() {

    const data = {
        title: document.getElementById("title").value,
        amount: Number(document.getElementById("amount").value),
        category: document.getElementById("category").value,
        expense_date: document.getElementById("date").value
    };

    await fetch(`${BASE_URL}/expenses`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        body: JSON.stringify(data)
    });

    loadExpenses();
}


// ---------------- LOAD EXPENSES + SUMMARY FIX ----------------
async function loadExpenses() {

    const res = await fetch(`${BASE_URL}/expenses`, {
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        }
    });

    const data = await res.json();

    let rows = "";
    let total = 0;
    let count = data.length;
    let categoryCount = {};

    data.forEach(e => {

        rows += `
        <tr>
            <td>${e.id}</td>
            <td>${e.title}</td>
            <td>${e.amount}</td>
            <td>${e.category}</td>
        </tr>
        `;

        total += e.amount;

        categoryCount[e.category] =
            (categoryCount[e.category] || 0) + 1;
    });

    // FIX: table update (IMPORTANT)
    document.querySelector("#expenseTable tbody").innerHTML = rows;

    // SUMMARY CARDS (dashboard fix)
    const totalEl = document.getElementById("totalExpense");
    const countEl = document.getElementById("totalCount");
    const topEl = document.getElementById("topCategory");

    if (totalEl) totalEl.innerText = total;
    if (countEl) countEl.innerText = count;

    // top category
    let topCategory = "-";
    let max = 0;

    for (let cat in categoryCount) {
        if (categoryCount[cat] > max) {
            max = categoryCount[cat];
            topCategory = cat;
        }
    }

    if (topEl) topEl.innerText = topCategory;
}


// ---------------- LOAD BUDGET ----------------
async function loadBudgets() {

    const res = await fetch(`${BASE_URL}/budget`);

    const data = await res.json();

    let rows = "";

    data.forEach(b => {
        rows += `
        <tr>
            <td>${b.month}</td>
            <td>${b.budget_amount}</td>
        </tr>
        `;
    });

    document.querySelector("#budgetTable tbody").innerHTML = rows;
}


// ---------------- LOAD CHART ----------------
async function loadChart() {

    const res = await fetch(`${BASE_URL}/category-summary`);

    const data = await res.json();

    new Chart(document.getElementById("chart"), {
        type: "pie",
        data: {
            labels: Object.keys(data),
            datasets: [{
                data: Object.values(data)
            }]
        }
    });
}


// ---------------- AUTO LOAD DASHBOARD ----------------
window.onload = () => {

    if (window.location.pathname.includes("dashboard")) {
        loadExpenses();
        loadBudgets();
        loadChart();
    }
};