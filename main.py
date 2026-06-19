from fastapi import FastAPI
from schemas import Signup, Login, Expense, Budget, UpdateExpense
from database import supabase
from auth import create_access_token
from typing import List
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # allow frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------
# SIGNUP
# -------------------------

@app.post("/signup")
def signup(user: Signup):

    data = {
        "username": user.username,
        "email": user.email,
        "password": user.password
    }

    result = (
        supabase
        .table("users")
        .insert(data)
        .execute()
    )

    return {
        "message": "User Registered"
    }


# -------------------------
# LOGIN
# -------------------------

@app.post("/login")
def login(user: Login):

    result = (
        supabase
        .table("users")
        .select("*")
        .eq("email", user.email)
        .execute()
    )

    if len(result.data) == 0:
        return {"message": "User not found"}

    db_user = result.data[0]

    if db_user["password"] != user.password:
        return {"message": "Wrong password"}

    token = create_access_token(
        {"email": user.email}
    )

    return {
        "access_token": token
    }


# -------------------------
# ADD EXPENSE
# -------------------------

@app.post("/expenses")
def add_expense(expense: Expense):

    data = expense.dict()
    

    supabase.table(
        "expenses"
    ).insert(data).execute()

    return {
        "message": "Expense Added"
    }


# -------------------------
# GET EXPENSES
# -------------------------

@app.get("/expenses")
def get_expenses():

    result = (
        supabase
        .table("expenses")
        .select("*")
        .execute()
    )

    return result.data


# -------------------------
# DELETE EXPENSE
# -------------------------

@app.delete("/expenses/{expense_id}")
def delete_expense(expense_id: int):

    supabase.table(
        "expenses"
    ).delete().eq(
        "id",
        expense_id
    ).execute()

    return {
        "message": "Expense Deleted"
    }


# -------------------------
# SET BUDGET
# -------------------------

@app.post("/budget")
def set_budget(budgets: List[Budget]):

    data = [budget.dict() for budget in budgets]

    supabase.table("budgets").insert(data).execute()

    return {
        "message": "Budgets Added"
    }

@app.get("/budget")
def get_budgets():

    result = (
        supabase
        .table("budgets")
        .select("*")
        .execute()
    )

    return result.data

@app.put("/budget/{budget_id}")
def update_budget(
    budget_id: int,
    budget: Budget
):

    supabase.table(
        "budgets"
    ).update({
        "month": budget.month,
        "budget_amount": budget.budget_amount
    }).eq(
        "id",
        budget_id
    ).execute()

    return {
        "message": "Budget Updated"
    }
    
@app.delete("/budget/{budget_id}")
def delete_budget(
    budget_id: int
):

    supabase.table(
        "budgets"
    ).delete().eq(
        "id",
        budget_id
    ).execute()

    return {
        "message": "Budget Deleted"
    }
    
# -------------------------
# DASHBOARD
# -------------------------

@app.get("/dashboard")
def dashboard():

    expenses = (
        supabase
        .table("expenses")
        .select("*")
        .execute()
    )

    budgets = (
        supabase
        .table("budgets")
        .select("*")
        .execute()
    )

    total_spent = sum(
        expense["amount"]
        for expense in expenses.data
    )

    budget = 0

    if budgets.data:
        budget = budgets.data[-1]["monthly_budget"]

    return {
        "budget": budget,
        "spent": total_spent,
        "remaining": budget - total_spent
    }

@app.put("/expenses/{expense_id}")
def update_expense(
    expense_id: int,
    expense: UpdateExpense
):

    result = (
        supabase
        .table("expenses")
        .update({
            "title": expense.title,
            "amount": expense.amount,
            "category": expense.category,
            "expense_date": expense.expense_date
        })
        .eq("id", expense_id)
        .execute()
    )

    return {
        "message": "Expense Updated"
    }
    
@app.get("/monthly-summary")
def monthly_summary():

    budgets = (
        supabase
        .table("budgets")
        .select("*")
        .execute()
    )

    result = []

    for budget in budgets.data:

        result.append(
            {
                "month": budget["month"],
                "budget": budget["budget_amount"]
            }
        )

    return result

from datetime import datetime

@app.get("/monthly-summary")
def monthly_summary():

    expenses = (
        supabase
        .table("expenses")
        .select("*")
        .execute()
    )

    summary = {}

    for expense in expenses.data:

        month = datetime.strptime(
            expense["expense_date"],
            "%Y-%m-%d"
        ).strftime("%B")

        summary[month] = summary.get(
            month,
            0
        ) + expense["amount"]

    return summary

@app.get("/category-summary")
def category_summary():

    expenses = (
        supabase
        .table("expenses")
        .select("*")
        .execute()
    )

    summary = {}

    for expense in expenses.data:

        category = expense["category"]

        summary[category] = (
            summary.get(category,0)
            + expense["amount"]
        )

    return summary

@app.get("/")
def home():
    return {"message": "Expense Tracker API is running 🚀"}