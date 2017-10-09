var EventBus = new Vue();

var section1 = new Vue({
  el: '#section1',
  data: {
    display: true,
		first_name: "",
		last_name: "",
		email: "",
		phone: "",
		address: "",
		city: "",
		state: "",
		zipcode: "",
  },
  methods: {
    next: function(){
      var self = this;
      axios.get('/flowstatus')
        .then(function(res){
          if (res.data.status > 1){
            self.display = false;
            EventBus.$emit('section1-next', true);
          } else {
            overlay_on();
          }
        })
    },
    submit: function(){
      var self = this;
      axios.put('/user', self.$data)
        .then(function(res){
          if (res.data.status == 'success'){
            humane.log(
              'Thanks! :)',
              {addnCls: 'humane-flatty-success'}
            )
          }
        });
    },
  },
  beforeCreate: function(){
    var self = this;
    axios.get('/user')
      .then(function(res){
        self.$data.first_name = res.data.first_name
        self.$data.last_name = res.data.last_name
        self.$data.email = res.data.email
        self.$data.phone = res.data.phone
        self.$data.address = res.data.address
        self.$data.city = res.data.city
        self.$data.state = res.data.state
        self.$data.zipcode = res.data.zipcode
      })
  },
  created: function(){
    var self = this;
    EventBus.$on('section2-back', function(data){
      self.display = true;
    });
  },
})

var section2 = new Vue({
  el: '#section2',
  data: {
    display: false,
    email_subscribe: false,
    prayer_partner: false,
    volunteer: false,
    noah: false,
    nehemiah: false,
    younglife: false,
    cooking: false,
    maintenance: false,
    administration: false,
    event_planning: false,
    table_host: false,
    contact_me: false,
    tell_friends: false,
    tell_church: false,
  },
  methods: {
    next: function(){
      var self = this;
      axios.get('/flowstatus')
        .then(function(res){
          if (res.data.status > 2){
            self.display = false;
            EventBus.$emit('section2-next', true);
          } else {
            overlay_on();
          }
        })
    },
    back: function(){
      this.display = false;
      EventBus.$emit('section2-back', true);
    },
    submit: function(){
      var self = this;
      axios.put('/user', self.$data)
        .then(function(res){
          if (res.data.status == 'success'){
            humane.log(
              'Thanks! :)',
              {addnCls: 'humane-flatty-success'}
            )
          }
        });
    },
  },
  beforeCreate: function(){
    var self = this;
    axios.get('/user')
      .then(function(res){
        self.$data.email_subscribe = res.data.email_subscribe
        self.$data.last_name = res.data.prayer_partner
        self.$data.volunteer = res.data.volunteer
        self.$data.noah = res.data.noah
        self.$data.nehemiah = res.data.nehemiah
        self.$data.younglife = res.data.younglife
        self.$data.cooking = res.data.cooking
        self.$data.maintenance = res.data.maintenance
        self.$data.administration = res.data.administration
        self.$data.event_planning = res.data.event_planning
        self.$data.table_host = res.data.table_host
        self.$data.contact_me = res.data.contact_me
        self.$data.tell_friends = res.data.tell_friends
        self.$data.tell_church = res.data.tell_church
      })
  },
  created: function(){
    var self = this;
    EventBus.$on('section1-next', function(data){
      self.display = true;
    });
    EventBus.$on('section3-back', function(data){
      self.display = true;
    });
  },
})

var section3 = new Vue({
  el: '#section3',
  data: {
    display: false,
    one_time_donation: 0,
    monthly_donation: 0,
  },
  methods: {
    next: function(){
      var self = this;
      axios.get('/flowstatus')
        .then(function(res){
          if (res.data.status > 3){
            self.display = false;
            EventBus.$emit('section3-next', true);
          } else {
            overlay_on();
          }
        })
      },
      back: function(){
        this.display = false;
        EventBus.$emit('section3-back', true);
      },
      submit: function(){
      },
    },
  created: function(){
    var self = this;
    EventBus.$on('section2-next', function(data){
      self.display = true;
    });
  },
})
