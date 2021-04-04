"""
Routes and views for the flask application.
"""

from datetime import datetime
from flask import render_template
from a_new_hope import app

@app.route('/')
@app.route('/home')
def home():
    """Renders the home page."""
    return render_template(
        'index.html',
        title='Home Page',
        year=datetime.now().year,
    )

@app.route('/contact')
def contact():
    """Renders the contact page."""
    return render_template(
        'contact.html',
        title='Contact',
        year=datetime.now().year,
        message='Your contact page.'
    )

@app.route('/about')
def about():
    """Renders the about page."""
    return render_template(
        'about.html',
        title='About',
        year=datetime.now().year,
        message='Your application description page.'
    )

@app.route('/register')
def register():
    """Renders the register page."""
    return render_template(
        'register.html',
        title='Sign Up',
        year=datetime.now().year,
        message='Your application user register page.'
    )

@app.route('/login')
def login():
    """Renders the login page."""
    return render_template(
        'login.html',
        title='Log In',
        year=datetime.now().year,
        message='Your application user login page.'
    )