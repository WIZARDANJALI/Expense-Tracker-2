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

    window.location.href = "index.html";
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
    window.location.href = "index.html";
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

// ---------------- DELETE EXPENSE ----------------
async function deleteExpense(id) {

    const confirmDelete =
        confirm("Delete this expense?");

    if (!confirmDelete) return;

    try {

        const res = await fetch(
            `${BASE_URL}/expenses/${id}`,
            {
                method: "DELETE"
            }
        );

        const result = await res.json();

        alert(result.message);

        loadExpenses();
        loadChart();

    } catch (error) {

        console.error(error);

        alert("Error deleting expense");
    }
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
        <td>₹${e.amount}</td>
        <td>${e.category}</td>

        <td>
            <button
                class="delete-btn"
                onclick="deleteExpense(${e.id})"
            >
                Delete
            </button>
        </td>
    </tr>
    `;

    total += e.amount;

    categoryCount[e.category] =
        (categoryCount[e.category] || 0) + 1;
});

    // TABLE
    document.querySelector("#expenseTable tbody").innerHTML = rows;

    // SUMMARY CARDS
    const totalEl = document.getElementById("totalExpense");
    const countEl = document.getElementById("totalCount");
    const topEl = document.getElementById("topCategory");

    if (totalEl) totalEl.innerText = `₹${total}`;
    if (countEl) countEl.innerText = count;

    let topCategory = "-";
    let max = 0;

    for (let cat in categoryCount) {
        if (categoryCount[cat] > max) {
            max = categoryCount[cat];
            topCategory = cat;
        }
    }

    if (topEl) topEl.innerText = topCategory;

    // BUDGET PROGRESS
    const budget = 50000;

    const percentage = Math.min(
        (total / budget) * 100,
        100
    );

    const fill = document.getElementById("progressFill");

    if (fill) {
        fill.style.width = percentage + "%";
    }

    const budgetText =
        document.getElementById("budgetText");

    if (budgetText) {
        budgetText.innerText =
            `₹${total} / ₹${budget} Used`;
    }

    // RECENT ACTIVITY
    const activity =
        document.getElementById("activityList");

    if (activity) {

        activity.innerHTML = "";

        data
            .slice(-5)
            .reverse()
            .forEach(expense => {

                activity.innerHTML += `
                <li>
                    ${expense.title}
                    - ₹${expense.amount}
                </li>
                `;
            });

        if (data.length === 0) {
            activity.innerHTML =
                "<li>No expenses added yet</li>";
        }
    }
}

// ---------------- LOAD CHART ----------------
let expenseChart = null;

async function loadChart() {

    try {

        const res = await fetch(`${BASE_URL}/category-summary`);

        const data = await res.json();

        const chartCanvas =
            document.getElementById("chart");

        if (!chartCanvas) return;

        if (expenseChart) {
            expenseChart.destroy();
        }

        expenseChart = new Chart(chartCanvas, {

            type: "doughnut",

            data: {
                labels: Object.keys(data),

                datasets: [{
                    data: Object.values(data),

                    backgroundColor: [
                        "#3b82f6",
                        "#10b981",
                        "#f59e0b",
                        "#ef4444",
                        "#8b5cf6",
                        "#06b6d4"
                    ],

                    borderWidth: 0
                }]
            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {

                        position: "bottom",

                        labels: {
                            color: "#ffffff",
                            padding: 20
                        }
                    }
                }
            }
        });

    } catch (error) {

        console.error("Chart Error:", error);
    }
}

// ---------------- AUTO LOAD DASHBOARD ----------------
window.onload = () => {

    if (
        window.location.pathname.includes("dashboard")
    ) {

        loadExpenses();
        loadChart();
    }
};