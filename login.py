from flask import Flask, request, render_template, redirect, session, flash
import mysql.connector

# Create a new Flask application
app = Flask(__name__)
app.secret_key = 'your_secret_key'

# Establish a connection to the MySQL database
db = mysql.connector.connect(
    host="localhost",
    user="yuhu",
    password="hello1234",
    database="yuhu"
)

# Get a cursor object to execute SQL queries
cursor = db.cursor()

# Define a function to validate the user's credentials


def validate_login(username, password):
    # Execute a SELECT query to check if the username and password match
    sql = "SELECT * FROM users WHERE username = %s AND password = %s"
    params = (username, password)
    cursor.execute(sql, params)

    # If a matching record is found, return True, else return False
    return cursor.fetchone() is not None

# Define a route to render the login form


@app.route('/')
def login():
    return render_template('login.html')

# Define a route to handle the login form submission


@app.route('/login', methods=['POST'])
def do_login():
    username = request.form['username']
    password = request.form['password']

    # Validate the user's credentials
    if validate_login(username, password):
        # If the credentials are valid, create a session or token for the user
        session['username'] = username
        return redirect('/dashboard')
    else:
        # If the credentials are invalid, show an error message
        flash('Invalid username or password')
        return redirect('http://127.0.0.1:3000/test2/login.html')


"""
# Define a route to render the dashboard page



@app.route('/dashboard')
def dashboard():
    if 'username' in session:
        return render_template('dashboard.html')
    else:
        return redirect('http://127.0.0.1:3000/test2/login.html')

# Define a route to handle logout requests


@app.route('/logout')
def logout():
    session.pop('username', None)
    return redirect('http://127.0.0.1:3000/test2/login.html')
"""

# Run the Flask application
if __name__ == '__main__':
    app.run()
