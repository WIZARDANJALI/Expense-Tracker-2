from pydantic import BaseModel

class Signup(BaseModel):
    username: str
    email: str
    password: str

class Login(BaseModel):
    email: str
    password: str

class Expense(BaseModel):
    title: str
    amount: float
    category: str
    expense_date: str

class Budget(BaseModel):
    month: str
    budget_amount: float

class UpdateExpense(BaseModel):
    title: str
    amount: float
    category: str
    expense_date: str