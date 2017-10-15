var socket = io.connect(':5500/')

socket.on('donation_update', function(data){
  stream.$data.monthly_donations[data.user_id] = {
    amount: data.monthly_donation,
    renewal: data.renewal,
    renewal_increase: data.renewal_increase,
  };
  stream.$data.one_time_donations[data.user_id] = {
    amount: data.one_time_donation,
  };
});

var stream = new Vue({
  el: '#stream',
  data: {
    latest_stream: [
      {amount: 10},
      {amount: 43},
      {amount: 14},
    ],
    monthly_donations: {
    },
    one_time_donations: {
    },
  },
  computed: {
    total_one_time: function(){
      var total = 0;
      var otd = this.$data.one_time_donations;
      for (var key in otd){
        if (!otd.hasOwnProperty(key)) continue;
        total += otd[key].amount;
      }
      return total;
    },
    total_new_monthly: function(){
      var total = 0;
      var md = this.$data.monthly_donations;
      for (var key in md){
        if (!md.hasOwnProperty(key)) continue;
        if (md[key].renewal) continue;
        total += md[key].amount;
      }
      return total;
    },
    total_renewal_increase: function(){
      var total = 0;
      var md = this.$data.monthly_donations;
      for (var key in md){
        if (!md.hasOwnProperty(key)) continue;
        if (!md[key].renewal) continue;
        total += md[key].renewal_increase;
      }
      return total;
    },
  },
  beforeCreate: function(){
    var self = this;
    axios.get('/donations')
      .then(function(resp){
        self.$data.monthly_donations = resp.data.monthly;
        self.$data.one_time_donations = resp.data.one_time;
      });
  },
})
