$(function(){
	App = Ember.Application.create({
		LOG_TRANSITIONS: true
	});

	App.Router.reopen({
		rootURL: '/calendar/'
	});

	App.Router.map(function(){
		this.route('year');
		this.route('month');
		this.route('day');
	});

	var ActivityAdapter = DS.RESTAdapter.extend({
		host: 'http://127.0.0.1:1337',
		namespace: 'api'
	});

	DS.ArrayTransform = DS.Transform.extend({
		deserialize: function(serialized) {
    		return (Ember.typeOf(serialized) == "array") ? serialized : [];
  		},

		serialize: function(deserialized) {
    		var type = Ember.typeOf(deserialized);
    		if (type == 'array') {
        		return deserialized
    		} 
    		else if (type == 'string') {
        		return deserialized.split(',').map(function(item) {
            		return jQuery.trim(item);
        		});
    		} 
    		else {
        		return [];
    		}
  		}
	});

	App.Activity = DS.Model.extend({
		lat: DS.attr('number'),
		lng: DS.attr('number'),
		name: DS.attr('string'),
		creator: DS.attr('number'),
		startDate: DS.attr('date'),
		endDate: DS.attr('date'),
		startTime: DS.attr('string'),
		endTime: DS.attr('string'),
		invited: DS.attr('array')
	});

	App.Day = Ember.Object.extend({
		init: function(){
		
		}
	});

	App.Month = Ember.Object.extend({
		init: function(){
			var days = [];
			switch(this.get('number')){
				case 1:
					this.set('name','January');
					for(var i = 0; i<31; i++){
						days.push(App.Day.create({
							number: i,
							date: new Date(this.get('year'), this.get('number'), i+1)
						}));
					}
					break;
				case 2:
					this.set('name','Febuary');
					for(var i = 0; i<28; i++){
						days.push(App.Day.create({
							number: i,
							date: new Date(this.get('year'), this.get('number'), i+1)
						}));	
					}
					break;
				case 3:
					this.set('name', 'March');
					for(var i = 0; i<31; i++){
						days.push(App.Day.create({
							number: i,
							date: new Date(this.get('year'), this.get('number'), i+1)
						}));
					}
					break;
				case 4:
					this.set('name', 'April');
					for(var i = 0; i<30; i++){
						days.push(App.Day.create({
							number: i,
							date: new Date(this.get('year'), this.get('number'), i+1)
						}));
					}
					break;
				case 5:
					this.set('name', 'May');
					for(var i = 0; i<31; i++){
						days.push(App.Day.create({
							number: i,
							date: new Date(this.get('year'), this.get('number'), i+1)
						}));
					}
					break;
				case 6:
					this.set('name', 'June');
					for(var i = 0; i<30; i++){
						days.push(App.Day.create({
							number: i,
							date: new Date(this.get('year'), this.get('number'), i+1)
						}));
					}
					break;
				case 7:
					this.set('name', 'July');
					for(var i = 0; i<31; i++){
						days.push(App.Day.create({
							number: i,
							date: new Date(this.get('year'), this.get('number'), i+1)
						}));
					}
					break;
				case 8:
					this.set('name', 'August');
					for(var i = 0; i<31; i++){
						days.push(App.Day.create({
							number: i,
							date: new Date(this.get('year'), this.get('number'), i+1)
						}));
					}	
					break;
				case 9:
					this.set('name', 'September');
					for(var i = 0; i<30; i++){
						days.push(App.Day.create({
							number: i,
							date: new Date(this.get('year'), this.get('number'), i+1)
						}));
					}
					break;
				case 10:
					this.set('name', 'October');
					for(var i = 0; i<31; i++){
						days.push(App.Day.create({
							number: i,
							date: new Date(this.get('year'), this.get('number'), i+1)
						}));
					}
					break;
				case 11:
					this.set('name', 'November');
					for(var i = 0; i<30; i++){
						days.push(App.Day.create({
							number: i,
							date: new Date(this.get('year'), this.get('number'), i+1)
						}));	
					}
					break;
				case 12:
					this.set('name', 'December');
					for(var i = 0; i<31; i++){
						days.push(App.Day.create({
							number: i,
							date: new Date(this.get('year'), this.get('number'), i+1)
						}));
					}
					break;
				case 13:
					this.set('name', 'Febuary');
					for(var i = 0; i<29; i++){
						days.push(App.Day.create({
							number: i,
							date: new Date(this.get('year'), this.get('number'), i+1)
						}));
					}
					break;
			}	
		}	
	});

	App.Year = Ember.Object.extend({
		init: function(){
			var months = [];
			var isLeap = false;
			for(var i = 0; i<12; i++){
				months.push(App.Month.create({
					number: i+1,
					year: this.get('yearNow')
				}));
			}
			if(this.get('yearNow')%4 === 0){
				isLeap = true;
				if(this.get('yearNow')%100 === 0){
					isLeap = !isLeap;
					if(this.get('yearNow')%400 === 0){
						isLeap = !isLeap
					}
				}
			}
			if(isLeap){
				months.splice(1);
				months.push(App.Month.create({
					number: 13,
					year: this.get('yearNow')
				}));
			}
		}
	});

	App.calendar = Ember.Object.extend({
		init: function(){
			var years = [];
			for(var i =0; i<5; i++){
				years.push(App.Year.create({
					yearNow: new Date().getFullYear()+i
				}));
			}
			this.set('years', years);
		}	
	});

	App.indexRoute = Ember.Route.extend({
		setupController: function(controller){
			controller.set('title', 'calendar');
		},
		model: App.calendar.create(),
		renderTemplate: function(){
			this.render('index');
		}
	});
});
