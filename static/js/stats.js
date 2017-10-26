function firework_show(){
	for (var i=0;i<9000;i+100){
		i += (Math.floor(Math.random()*6)+1)*100;
		setTimeout(function(){
			createFirework(17,184,5,2,null,null,null,null,true,true)
		}, i);
	}
}

//window.onload = firework_show();

var stream = new Vue({
  el: '#stream',
  data: {
    monthly_donations: {
    },
    one_time_donations: {
    },
    background_color: "#209618",
    firework_show: false,
  },
  computed: {
    total: function(){
      return this.total_one_time + this.total_monthly;
    },
    percent: function(){
      var percent = ((this.total/7000)*100);
      if (percent>=100){
        if (!this.firework_show){
          firework_show();
          this.firework_show = true;
        }
      };
      return percent;
    },
    total_one_time: function(){
      var total = 0;
      var donations = this.$data.one_time_donations;
      
      for (var key in donations){
        if (!donations.hasOwnProperty(key)) continue;
        total += Math.round((Number(donations[key].amount)*100) / 1200);
      }

      return total;
    },
    total_monthly: function(){
      var total = 0;
      var donations = this.$data.monthly_donations;

      for (var key in donations){
        if (!donations.hasOwnProperty(key)) continue;
        total += Number(donations[key].amount);
        total += Number(donations[key].renewal_increase);
      }
      
      return total;
    },
  },
  methods: {
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

var socket = io.connect('/')
var stack_bottomleft = {"dir1": "right", "dir2": "up", "push": "top"};

socket.on('donation_update', function(data){
  // push new donations into vue
  var t = Vue.set(
    stream.$data.monthly_donations, 
    data.user_id,
    {
      amount: data.monthly_donation,
      renewal: data.renewal,
      renewal_increase: data.renewal_increase,
    });
  var d = Vue.set(
    stream.$data.one_time_donations,
    data.user_id,
    {
      amount: data.one_time_donation,
    });

  // if a new monthly donation then pop a notification
  if (Number(data.monthly_donation) > 0){
    var type = 'success';
    var title = 'New Monthly!';
    if (Boolean(data.renewal) == true){
      type = 'notice';
      title = 'Monthly Renewal!';
    }
    new PNotify({
      title: title,
      text: `<h1>\$${Number(data.monthly_donation)}</h1>`,
      type: type,
      delay: 15000,
      addclass: 'stack-bottomleft',
      stack: stack_bottomleft,
    });
    if (Number(data.renewal_increase > 0)){
      setTimeout(function(){
        new PNotify({
          title: "Monthly Increase!",
          text: `<h1>\$${Number(data.renewal_increase)}</h1>`,
          type: 'success',
          delay: 15000,
          addclass: 'stack-bottomleft',
          stack: stack_bottomleft,
        });
      }, 4000);
    }
  };

  // if a new one time donation then pop a notification
  if (Number(data.one_time_donation) > 0){
    setTimeout(function(){
      new PNotify({
        title: 'New One Time!',
        text: `<h1>\$${data.one_time_donation}</h1>`,
        type: 'success',
        delay: 15000,
        addclass: 'stack-bottomleft',
        stack: stack_bottomleft,
      });
    }, 2000);
  };
});

