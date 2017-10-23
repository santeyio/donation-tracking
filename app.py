import json
import uuid

from flask import Flask, render_template, request, make_response, abort, jsonify
from flask_socketio import SocketIO, emit

from models import db, Donor, OneTimeDonation, MonthlyDonation, FlowFlags


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///../test.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)
socketio = SocketIO(app)


##################################
###########    Views    ##########
##################################


@app.route("/")
def index():
    """ Load the main user form template and set a user_id cookie
    if it doesn't already exist.
    """
    user_id = request.cookies.get('user_id')
    response = make_response(render_template("index.html"))
    if user_id:
        # just checking to see if user exists -- this is mostly for
        # testing when you empty the db. When you clear the db your
        # device still has the user cookie set so we can't expect 
        # the user to exist in the DB necessarily. Create it if it
        # with the given id if it doesn't already exist. 
        user = Donor.query.get(uuid.UUID(user_id))
        if not user:
            create_user_by_id_str(user_id)
    if not user_id:
        user_id = str(uuid.uuid4())
        create_user_by_id_str(user_id)
        response.set_cookie('user_id', user_id)
    return response


@app.route("/stats")
def stats():
    """ Load the live statistics template """
    return render_template("stats.html")


@app.route("/admin")
def admin():
    """ Load the admin controls template """
    return render_template("admin.html")


##################################
###########     API    ###########
##################################


@app.route("/api/v1/user/<user_id>/donations", methods=["GET", "PUT"])
def donations(user_id=None):
    """ Attach and update donation objects to users """
    user_id = request.cookies.get('user_id')
    if not user_id:
        abort(400, 'user_id required')

    if request.method == "PUT":
        save_donations(user_id, request)
        emit_donation_update(user_id, request)
        return jsonify({'status': 'success'})

    if request.method == "GET":
        user = Donor.query.get(uuid.UUID(user_id))
        return jsonify(user_donations_to_dict(user))


@app.route("/api/v1/donations", methods=["GET"])
def all_current_donations():
    """ grab all donations from the database and return as json"""
    one_time_donations = OneTimeDonation.query.all()
    od_list = donations_to_list(one_time_donations)

    monthly_donations = MonthlyDonation.query.all()
    md_list = donations_to_list(monthly_donations)

    return jsonify({'one_time': od_list, 'monthly': md_list})


@app.route("/api/v1/user/<user_id>", methods=["GET", "PUT"])
def user(user_id=None):
    """ Get and set donor info """
    if not user_id:
        abort(400, 'user_id required')

    if request.method == "GET":
        user = Donor.query.get(uuid.UUID(user_id))
        return jsonify(user_query_to_dict(user))

    if request.method == "PUT":
        update_user(user_id, request)
        return jsonify({'status': 'success'})


@app.route("/api/v1/flowstatus", methods=["GET", "POST"])
def flowstatus():
    """ Get and update the status of where donors should be on the form """

    if request.method == "GET":
        status_query = FlowFlags.query.filter_by(flag_name="flowstatus").first()
        response = {'status': 1}
        if status_query is None:
            current_status = FlowFlags(flag_name="flowstatus", flag_status=1)
            db.session.add(current_status)
            db.session.commit()
        else:
            response = {'status': status_query.flag_status}
        return jsonify(response)

    if request.method == "POST":
        status = request.get_json().get('status')
        status_query = FlowFlags.query.filter_by(flag_name="flowstatus").first()
        if status_query is None:
            create_status = FlowFlags(flag_name="flowstatus", flag_status=status)
            db.session.add(create_status)
        else:
            status_query.flag_status = status
        db.session.commit()
        return jsonify({'status': 'success'})


##################################
##########  Sockets  #############
##################################

@socketio.on('testmessage')
def testmessage(message):
    print message

def emit_donation_update(user_id, request):
    """ emits a donation update to client display
    :param user_id: user id as a string
    :param request: flask request object
    """
    jparse = request.get_json()

    donation_update = {
            'user_id': user_id,
            'one_time_donation': jparse.get('one_time_donation'),
            'monthly_donation': jparse.get('monthly_donation'),
            'renewal': jparse.get('renewal'),
            'renewal_increase': jparse.get('renewal_increase')}
    socketio.emit('donation_update', donation_update)


##################################
##########  Helpers ##############
##################################

def create_user_by_id_str(user_id):
    new_user = Donor(
            id=uuid.UUID(user_id),
            one_time_donation = OneTimeDonation(),
            monthly_donation = MonthlyDonation())
    db.session.add(new_user)
    db.session.commit()

def update_user(user_id, request):
    user = Donor.query.get(uuid.UUID(user_id))
    jparse = request.get_json()
    for k, v in jparse.iteritems():
        if k == 'display': #TODO get rid of this hack -- I think the vue code needs to be changed
            continue
        setattr(user, k, v)
    print user
    db.session.commit()


def save_donations(user_id, request):
    user = Donor.query.get(uuid.UUID(user_id))
    jparse = request.get_json()

    if jparse.get('one_time_donation'):
        user.one_time_donation.amount = jparse.get('one_time_donation')
    if jparse.get('monthly_donation'):
        user.monthly_donation.amount = jparse.get('monthly_donation')
        user.monthly_donation.renewal = jparse.get('renewal')
        user.monthly_donation.renewal_increase = jparse.get('renewal_increase')
        user.monthly_donation.increase_donation = jparse.get('increase_donation')

    db.session.commit()


def user_query_to_dict(query):
    """
    turns a sqlalchemy query object into a json string
    :param query: sqlalchemy query object
    """
    user = {
        'id': str(query.id),
        'first_name': query.first_name,
        'last_name': query.last_name,
        'business_name': query.business_name,
        'email': query.email,
        'address': query.address,
        'city': query.city,
        'state': query.state,
        'zipcode': query.zipcode,
        'phone': query.phone,

        'email_subscribe': query.email_subscribe,
        'prayer_partner': query.prayer_partner,
        'volunteer': query.volunteer,
        'noah': query.noah,
        'nehemiah': query.nehemiah,
        'younglife': query.younglife,
        'field_trips': query.field_trips,
        'cooking': query.cooking,
        'maintenance': query.maintenance,
        'administration': query.administration,
        'event_planning': query.event_planning,
        'table_host': query.table_host,
        'contact_me': query.contact_me,
        'tell_friends': query.tell_friends,
        'tell_church': query.tell_church,
        'other': query.other,
    }
    return user


def user_donations_to_dict(user):
    """ 
    turns a sqlalchemy user query object into json string 
    :param user: sqlalchemy query object
    """
    donation_info = {
        'one_time_donation': user.one_time_donation.amount,
        'monthly_donation': user.monthly_donation.amount,
        'renewal': user.monthly_donation.renewal,
        'renewal_increase': user.monthly_donation.renewal_increase,
        'increase_donation': user.monthly_donation.increase_donation,
    }
    return donation_info


def donations_to_list(query):
    """
    turns a sqlalchemy donations query into a json string
    :param query: sqlalchemy query object to list
    """
    out_list = {}

    for donation in query:
        _d = {}
        for key, val in donation.__dict__.iteritems():
            if key[0] == '_' or key == 'donor_id':
                continue
            elif key == 'donor_id':
                _d['donor_id'] = str(val)
                continue
            else:
                _d[key] = val
        out_list[str(donation.donor_id)] = _d

    return out_list


def create_db():
    """ Helper to create a local test database """
    new_app = Flask(__name__)
    new_app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///../test.db'
    new_app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(new_app)
    db.create_all(app=new_app)
