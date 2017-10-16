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
  stream.queue_push(data);
});

var stream = new Vue({
  el: '#stream',
  data: {
    latest_stream: [
      {title: '', amount: 0},
      {title: '', amount: 0},
      {title: '', amount: 0},
      {title: '', amount: 0},
      {title: '', amount: 0},
      {title: '', amount: 0},
      {title: '', amount: 0},
      {title: '', amount: 0},
      {title: '', amount: 0},
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
        total += Number(otd[key].amount);
      }
      return total;
    },
    total_new_monthly: function(){
      var total = 0;
      var md = this.$data.monthly_donations;
      for (var key in md){
        if (!md.hasOwnProperty(key)) continue;
        if (md[key].renewal) continue;
        total += Number(md[key].amount);
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
    year_new: function(){
      var total = 0;
      var md = this.$data.monthly_donations;
      for (var key in md){
        if (!md.hasOwnProperty(key)) continue;
        if (!md[key].renewal){
          total += md[key].amount * 11;
        } else {
          total += md[key].renewal_increase * 11;
        }
      }
      return total;
    },
    year_old: function(){
      var total = 0;
      var md = this.$data.monthly_donations;
      for (var key in md){
        if (!md.hasOwnProperty(key)) continue;
        if (md[key].renewal){
          total += md[key].amount * 11;
        } else {
          total += md[key].renewal_increase * 11;
        }
      }
      return total;
    },
  },
  methods: {
    queue_push: function(data){

      console.log(data);

      if (data.one_time_donation){
        this.$data.latest_stream.pop();
        this.latest_stream.unshift({
          title: 'One Time Donation: ',
          amount: Number(data.one_time_donation),
        });
      }
      
      if (data.renewal) {
        this.$data.latest_stream.pop();
        this.$data.latest_stream.unshift({
          title: 'Monthly Renewal: ',
          amount: Number(data.monthly_donation) + Number(data.renewal_increase),
        });
      } else {
        this.$data.latest_stream.pop();
        this.$data.latest_stream.unshift({
          title: 'New Monthly: ',
          amount: Number(data.monthly_donation),
        });
      }
    },
  },
  beforeCreate: function(){
    var self = this;
    axios.get('/api/v1/donations')
      .then(function(resp){
        self.$data.monthly_donations = resp.data.monthly;
        self.$data.one_time_donations = resp.data.one_time;
      });
  },
})
