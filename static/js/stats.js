function firework_show(){
	for (var i=0;i<9000;i+100){
		i += (Math.floor(Math.random()*6)+1)*100;
		setTimeout(function(){
			createFirework(17,184,5,2,null,null,null,null,true,true)
		}, i);
	}
}

//window.onload = firework_show();

var socket = io.connect('/')
var stack_bottomleft = {"dir1": "right", "dir2": "up", "push": "top"};

socket.on('donation_update', function(data){
  stream.$data.monthly_donations[data.user_id] = {
    amount: data.monthly_donation,
    renewal: data.renewal,
    renewal_increase: data.renewal_increase,
  };
  stream.$data.one_time_donations[data.user_id] = {
    amount: data.one_time_donation,
  };
  console.log(data);
  if (Number(data.monthly_donation) > 0){
    new PNotify({
      title: 'New Monthly!',
      text: `<h1>\$${Number(data.monthly_donation)+Number(data.renewal_increase)}</h1>`,
      type: 'success',
      addclass: 'stack-bottomleft',
      stack: stack_bottomleft,
    });
  };
  if (Number(data.one_time_donation) > 0){
    setTimeout(function(){
      new PNotify({
        title: 'New One Time!',
        text: `<h1>\$${data.one_time_donation}</h1>`,
        type: 'success',
        addclass: 'stack-bottomleft',
        stack: stack_bottomleft,
      });
    }, 500);
  };
});

var stream = new Vue({
  el: '#stream',
  data: {
    monthly_donations: {
    },
    one_time_donations: {
    },
    percent: 0,
  },
  computed: {
    total: function(){
      var total = 0;
      
      var otd = this.$data.one_time_donations;
      for (var key in otd){
        if (!otd.hasOwnProperty(key)) continue;
        total += Math.round((Number(otd[key].amount)*100) / 1200);
      }

      var md = this.$data.monthly_donations;
      for (var key in md){
        if (!md.hasOwnProperty(key)) continue;
        total += Number(md[key].amount);
        total += Number(md[key].renewal_increase);
      }
      
      var percent = ((total/7000)*100);
      this.$data.percent = percent;
      if (percent>100){
        firework_show();
      };
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
