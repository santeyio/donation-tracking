var EventBus = new Vue();

var main = new Vue({
  el: '#main',
  data: {
    stage: 1,
  },
  methods: {
    change_stage: function(change){
      self = this;
      axios.post('/flowstatus', {status: self.$data.stage + change})
        .then(function(res){
          self.$data.stage += change;
        });
    },
  },
  beforeCreate: function(){
    var self = this;
    axios.get('/flowstatus')
      .then(function(res){
        self.$data.stage = res.data.status
      })
  },
});
