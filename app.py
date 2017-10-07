from flask import Flask, render_template

from models import db, Donor, OneTimeDonation, MonthlyDonation


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///../test.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/stats")
def stats():
    return render_template("stats.html")
