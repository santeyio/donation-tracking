import uuid

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy_utils import UUIDType


db = SQLAlchemy()

class Donor(db.Model):

    __tablename__ = 'donor'

    id = db.Column(UUIDType, primary_key=True)
    first_name = db.Column(db.String, default="")
    last_name = db.Column(db.String, default="")
    email = db.Column(db.String, default="")
    address = db.Column(db.String, default="")
    city = db.Column(db.String, default="")
    state = db.Column(db.String, default="")
    zipcode = db.Column(db.String, default="")
    phone = db.Column(db.String, default="")

    email_subscribe = db.Column(db.Boolean, default=False)
    prayer_partner = db.Column(db.Boolean, default=False)
    volunteer = db.Column(db.Boolean, default=False)
    noah = db.Column(db.Boolean, default=False)
    nehemiah = db.Column(db.Boolean, default=False)
    younglife = db.Column(db.Boolean, default=False)
    cooking = db.Column(db.Boolean, default=False)
    maintenance = db.Column(db.Boolean, default=False)
    administration = db.Column(db.Boolean, default=False)
    event_planning = db.Column(db.Boolean, default=False)
    table_host = db.Column(db.Boolean, default=False)
    contact_me = db.Column(db.Boolean, default=False)
    tell_friends = db.Column(db.Boolean, default=False)
    tell_church = db.Column(db.Boolean, default=False)

    one_time_donation = db.relationship("OneTimeDonation", uselist=False, back_populates="donor")
    monthly_donation = db.relationship("MonthlyDonation", uselist=False, back_populates="donor")


class OneTimeDonation(db.Model):

    __tablename__ = 'one_time_donation'

    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Integer, nullable=False)
    
    donor_id = db.Column(UUIDType, db.ForeignKey('donor.id'))
    donor = db.relationship("Donor", back_populates="one_time_donation")


class MonthlyDonation(db.Model):

    __tablename__ = 'monthly_donation'

    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Integer, nullable=False)
    renewal = db.Column(db.Boolean, default=False)
    renewal_increase = db.Column(db.Integer, default=0)

    donor_id = db.Column(UUIDType, db.ForeignKey('donor.id'))
    donor = db.relationship("Donor", back_populates="monthly_donation")

class FlowFlags(db.Model):

    __tablename__ = 'flow_flags'

    flag_name = db.Column(db.String, primary_key=True)
    flag_status = db.Column(db.Integer, default=1)
