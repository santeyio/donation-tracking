import json
import uuid

from flask import Flask, render_template, request, make_response, abort

from models import db, Donor, OneTimeDonation, MonthlyDonation, FlowFlags


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///../test.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)


@app.route("/")
def index():
    user_id = request.cookies.get('user_id')
    response = make_response(render_template("index.html"))
    if not user_id:
        user_id = str(uuid.uuid4())
        new_user = Donor(id=uuid.UUID(user_id))
        db.session.add(new_user)
        db.session.commit()
        response.set_cookie('user_id', user_id)
    return response


@app.route("/stats")
def stats():
    return render_template("stats.html")


@app.route("/user", methods=["PUT"])
@app.route("/user", methods=["GET"])
def user():
    """ Get and set donor info """
    user_id = request.cookies.get('user_id')
    if not user_id:
        abort(400, 'user_id required')

    if request.method == "GET":
        user = Donor.query.get(uuid.UUID(user_id))
        return user_query_to_json(user)

    if request.method == "PUT":
        update_user(user_id, request)
        return json.dumps({'status': 'success'})


@app.route("/flowstatus", methods=["GET", "POST"])
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
        return json.dumps(response)

    if request.method == "POST":
        status = request.get_json().get('status')
        status_query = FlowFlags.query.filter_by(flag_name="flowstatus").first()
        if status_query is None:
            create_status = FlowFlags(flag_name="flowstatus", flag_status=status)
            db.session.add(create_status)
        else:
            status_query.flag_status = status
        db.session.commit()
        return json.dumps({'status': 'success'})


##################################
##########  Helpers ##############
##################################

def update_user(user_id, request):
    user = Donor.query.get(uuid.UUID(user_id))
    jparse = request.get_json()
    for k, v in jparse.iteritems():
        if k == 'display': #TODO get rid of this hack -- I think the vue code needs to be changed
            continue
        setattr(user, k, v)
    print user
    db.session.commit()


def user_query_to_json(query):
    """
    turns a sqlalchemy query object into a json string
    :param query: sqlalchemy object
    """
    user = {
        'id': str(query.id),
        'first_name': query.first_name,
        'last_name': query.last_name,
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
        'cooking': query.cooking,
        'maintenance': query.maintenance,
        'administration': query.administration,
        'event_planning': query.event_planning,
        'table_host': query.table_host,
        'contact_me': query.contact_me,
        'tell_friends': query.tell_friends,
        'tell_church': query.tell_church,
        'one_time_donation': query.administration,
        'monthly_donation': query.administration,
    }
    return json.dumps(user)

def create_db():
    """ Helper to create a local test database """
    new_app = Flask(__name__)
    new_app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///../test.db'
    new_app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(new_app)
    db.create_all(app=new_app)
