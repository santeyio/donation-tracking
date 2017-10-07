import uuid

from flask_sqlalchemy import SQLAlchemy


db = SQLAlchemy()

class Donor(db.Model):

    __tablename__ = 'donor'

    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String, nullable=False)
    last_name = db.Column(db.String, nullable=False)
    email = db.Column(db.String, nullable=False, unique=True)
    city = db.Column(db.String, default="None Provided")
    state = db.Column(db.String, default="None Provided")
    zipcode = db.Column(db.String, default="None Provided")
    phone = db.Column(db.String, default="None Provided")

    email_subscribe = db.Column(db.Boolean)
    prayer_partner = db.Column(db.Boolean)
    volunteer = db.Column(db.Boolean)
    noah = db.Column(db.Boolean)
    nehemiah = db.Column(db.Boolean)
    younglife = db.Column(db.Boolean)
    cooking = db.Column(db.Boolean)
    maintenance = db.Column(db.Boolean)
    administration = db.Column(db.Boolean)
    event_planning = db.Column(db.Boolean)
    table_host = db.Column(db.Boolean)
    contact_me = db.Column(db.Boolean)
    tell_friends = db.Column(db.Boolean)
    tell_church = db.Column(db.Boolean)

    one_time_donations = db.relationship("OneTimeDonation", uselist=False, back_populates="donor")
    monthly_donations = db.relationship("MonthlyDonation", uselist=False, back_populates="donor")


class OneTimeDonation(db.Model):

    __tablename__ = 'one_time_donation'

    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Integer, nullable=False)
    
    donor_id = db.Column(db.Integer, db.ForeignKey('donor.id'))
    donor = db.relationship("Donor", back_populates="one_time_donations")


class MonthlyDonation(db.Model):

    __tablename__ = 'monthly_donation'

    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Integer, nullable=False)

    donor_id = db.Column(db.Integer, db.ForeignKey('donor.id'))
    donor = db.relationship("Donor", back_populates="monthly_donations")