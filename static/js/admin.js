//var socket = io.connect(':5503/');
//socket.on('connect', function() {
		//socket.emit('testmessage', {data: 'I\'m connected!'});
    //socket.on('t2', function(data){console.log(data)});
//});

var EventBus = new Vue();

var main = new Vue({
  el: '#main',
  data: {
    stage: 1,
  },
  methods: {
    change_stage: function(change){
      self = this;
      axios.post('/api/v1/flowstatus', {status: self.$data.stage + change})
        .then(function(res){
          self.$data.stage += change;
        });
    },
  },
  beforeCreate: function(){
    var self = this;
    axios.get('/api/v1/flowstatus')
      .then(function(res){
        self.$data.stage = res.data.status
      })
  },
});
