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
    submitted: false,
  },
  methods: {
    next: function(){
      var self = this;
      axios.get('/flowstatus')
        .then(function(res){
          if (res.data.status > 1){
            self.display = false;
            console.log('event emitted');
            EventBus.$emit('section1-next', true);
          } else {
            overlay_on();
          }
        })
    },
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
      this.display = false;
      EventBus.$emit('section2-next', true);
    },
    back: function(){
      this.display = false;
      EventBus.$emit('section2-back', true);
    },
  },
  created: function(){
    var self = this;
    EventBus.$on('section1-next', function(data){
      self.display = true;
    });
  },
})

var section3 = new Vue({
  el: '#section3',
  data: {
    display: true,
  },
  methods: {
    //next: function(){
      //this.display = false;
      //EventBus.$emit('section3-next', true);
    //},
    back: function(){
      this.display = false;
      EventBus.$emit('section3-back', true);
    },
  },
})
