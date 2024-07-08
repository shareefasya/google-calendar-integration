class GoogleCalendar {

    // 1. CONSTRUCTOR

	constructor(properties) {
	
		// constructor parameter defined:
		// proeprties -> settings for the date-picker
		 
		// properties defined:
			// appendTo        -> html element
			// disabled 	   -> boolean
			// darkMode		   -> boolean
			// calendar        -> object
				// id              -> google calendar id
				// webAppURL       -> google apps script url
				// duration        -> integer
				// from            -> integer
				// to              -> integer
				// delay 		   -> integer
				// disableWeekends -> boolean (true or false)

		// set the calendar object
		this.calendar = {};

		// get the properties that were included during initialization
		if ( properties ) {
		    
		    for ( let property in properties ) {
		        
		        this[property] = properties[property];
		        
		    }
		    
		}
		
		// calendar's defaults
		this.calendarDefaults = {
			from: 9,
			to: 17,
			duration: 10,
			delay: 5
		};

			for ( let property in this.calendarDefaults ) {

				if ( this.calendar[property] ) {

					continue;

				}

				this.calendar[property] = this.calendarDefaults[property];

			}

		// class's alert box
		this.alert = {
			container: this.appendElement("div", {className: "gc-alert-wrapper gc-hide"}),
			text: this.appendElement("p", {className: "gc-alert-text"})
		};
		
		// calendar's time slots
		this.slots = {
		    wrapper: this.appendElement("div", {className: "gc-time-slots"}),
		    container: this.appendElement("div", {className: "gc-time-slots-inner"}),
		    load: this.appendElement("button", {className: "gc-time-slots-load-more", textContent: "Load More"}),
			limit: 3
		};

		// preset the date-picker's days container
		this.days = this.appendElement("div", {className: "gc-date-picker-days"});
		
		// preset the date-picker's month controls container
		this.monthControls = this.appendElement("div", {className: "gc-date-picker-month-controls"});
		
		// preset the date-picker's year controls container
		this.yearControls = this.appendElement("div", {className: "gc-date-picker-year-controls"});		

		// calendar's defaults

			// today's date
			this.today = new Date();

			// default year
			this.defaultYear = this.today.getFullYear();
		
			// default month
			this.defaultMonth = this.today.getMonth();
		
			// default day
			this.defaultDay = this.today.getDate();

				// weekends are disabled...
				if ( this?.calendar?.disableWeekends ) {

					// update the default day as the next business day

					// if it's sunday...
					if ( this.today.getDay() == 0 ) {

						// add one day
						this.defaultDay = this.today.getDate() + 1;

					}

					// if it's saturday...
					if ( this.today.getDay() == 6 ) {

						// add two days
						this.defaultDay = this.today.getDate() + 2;

					}

				}			
		
		// calendar's selected date
		
			// selected year
			this.selectedYear = this.defaultYear;
			
			// selected month
			this.selectedMonth = this.defaultMonth;
		
			// selected day
			this.selectedDay = this.defaultDay;
		
		// months array
		this.months = [
			{long: 'January',   short: 'Jan', letter: 'J', days: 31}, 
			{long: 'February',  short: 'Feb', letter: 'F', days: this.isLeapYear(this.defaultYear) ? 29 : 28}, 
			{long: 'March',     short: 'Mar', letter: 'M', days: 31}, 
			{long: 'April',     short: 'Apr', letter: 'A', days: 30}, 
			{long: 'May',       short: 'May', letter: 'M', days: 31}, 
			{long: 'June',      short: 'Jun', letter: 'J', days: 30}, 
			{long: 'July',      short: 'Jul', letter: 'J', days: 31}, 
			{long: 'August',    short: 'Aug', letter: 'A', days: 31}, 
			{long: 'September', short: 'Sep', letter: 'S', days: 30}, 
			{long: 'October',   short: 'Oct', letter: 'O', days: 31}, 
			{long: 'November',  short: 'Nov', letter: 'N', days: 30}, 
			{long: 'December',  short: 'Dec', letter: 'D', days: 31},
		];
		
		// weekdays array
		this.weekdays = [
			{long: 'Sunday',    short: 'Sun',  letter: 'S'},
			{long: 'Monday',    short: 'Mon',  letter: 'M'},
			{long: 'Tuesday',   short: 'Tue',  letter: 'T'},
			{long: 'Wednesday', short: 'Wed',  letter: 'W'},
			{long: 'Thursday',  short: 'Thu',  letter: 'T'},
			{long: 'Friday',    short: 'Fri',  letter: 'F'},
			{long: 'Saturday',  short: 'Sat',  letter: 'S'},
		];
		
		// times array
		this.times = [
            {standard: '12:00 am', military: 0},
            {standard: '1:00 am',  military: 1},
            {standard: '2:00 am',  military: 2},
            {standard: '3:00 am',  military: 3},
            {standard: '4:00 am',  military: 4},
            {standard: '5:00 am',  military: 5},
            {standard: '6:00 am',  military: 6},
            {standard: '7:00 am',  military: 7},
            {standard: '8:00 am',  military: 8},
            {standard: '9:00 am',  military: 9},
            {standard: '10:00 am', military: 10},
            {standard: '11:00 am', military: 11},
            {standard: '12:00 pm', military: 12},
            {standard: '1:00 pm',  military: 13},
            {standard: '2:00 pm',  military: 14},
            {standard: '3:00 pm',  military: 15},
            {standard: '4:00 pm',  military: 16},
            {standard: '5:00 pm',  military: 17},
            {standard: '6:00 pm',  military: 18},
            {standard: '7:00 pm',  military: 19},
            {standard: '8:00 pm',  military: 20},
            {standard: '9:00 pm',  military: 21},
            {standard: '10:00 pm', military: 22},
            {standard: '11:00 pm', military: 23}
        ];
        
        // initialize the date picker
        this.init();
		 				
	}





    // 2. INITIALIZERS
	
	// 2.1 initializes the date-picker
	init() {
	
		// initialize the wrapper
		this.initWrapper();
		
		// add the days to the calendar and the time slots to the picker
		this.populateDates();
		
	    // if the date picker has been disabled...
	    if ( this.disabled ) {
	        
	        // add a special css class to date-picker's container
	        this.wrapper.classList.add("gc-disabled");
	        
	        // add an overlay to the date-picker
	        this.wrapper.appendChild(this.appendElement("div", {className: "gc-readonly-overlay"}));
	        
	    }
		
		window.addEventListener( "click", (event) => {

			if ( !event.target.matches(".gc-date-picker-month-controls-text") ) {

				this.monthControls.getElementsByClassName("gc-date-picker-month-options")[0].classList.add("gc-hide");

			}

			if ( !event.target.matches(".gc-date-picker-year-controls-text") ) {

				this.yearControls.getElementsByClassName("gc-date-picker-year-options")[0].classList.add("gc-hide");

			}			

		} );
	
	}

	// 2.2 initializes the wrapper
	initWrapper() {

		this.wrapper = this.appendElement("div", {className: "gc-wrapper"});

			if ( this.darkMode ) {

				this.wrapper.classList.add("gc-dark");

			}

			// intialize the loader
			this.wrapper.appendChild(this.initLoader());

			// initialize the alert box
			this.wrapper.appendChild(this.initAlert());

			// initialize the date picker
			this.wrapper.appendChild(this.initDatePicker());

			// append wrapper

			if ( this.appendTo ) { // if the appendTo attribute is set...

				// append the wrapper to the html element
				this.appendTo.appendChild(this.wrapper);

			} else {

				document.body.appendChild(this.wrapper);

			}

	}

	// 2.3 initalizes the loader
	initLoader() {

		// wrapper
		this.loader = this.appendElement("div", {className: "gc-loader-wrapper gc-hide"});

			// loader
			this.loader.appendChild(this.appendElement("div", {className: "gc-loader"}));

		return this.loader;

	}

	// 2.4 initializes the alert box
	initAlert() {

		// alert
		const alert = this.appendElement("div", {className: "gc-alert"});

			// title

			const title_container = this.appendElement("div", {className: "gc-alert-title-container"});

				title_container.appendChild(this.appendElement("h3", {className: "gc-alert-title", textContent: "User Message"}));

				alert.appendChild(title_container);

			// message

			const message_container = this.appendElement("div", {className: "gc-alert-message-container"});

				message_container.appendChild(this.alert.text);

				alert.appendChild(message_container);

			// button

			const button_container = this.appendElement("div", {className: "gc-alert-button-container"});

				const button = this.appendElement("button", {className: "gc-alert-button", textContent: "Okay, thanks"});

					button.addEventListener( "click", () => {

						this.alert.container.classList.add("gc-hide");

					} );

				alert.appendChild(button_container);

			this.alert.container.appendChild(alert);

		return this.alert.container;


	}

	// 2.5 initializes the calendar's date picker
	initDatePicker() {

		// create the date-picker
		
		// the container
		const date_picker = this.appendElement("div", {className: "gc-date-picker"});
			    
			// calendar
			const date_picker_calendar = this.appendElement("div", {className: "gc-date-picker-calendar"});
					
				// controls
					
				// container
				const date_picker_controls = this.appendElement("div", {className: "gc-date-picker-controls"});
													
					// month and year controls
					const month_and_year_controls = this.appendElement("div", {className: "gc-date-picker-month-and-year-controls"});
							
						// month controls
								
							// month text
							const month_controls_text = this.appendElement("button", {className: "gc-date-picker-month-controls-text", textContent: this.months[this.defaultMonth].long, title: "Adjust Month"});
								
								month_controls_text.addEventListener( "click", function() {
								
									this.nextElementSibling.classList.remove('gc-hide');
								
								} );

								this.monthControls.appendChild(month_controls_text);						
								
							// month options
							
							// container 
							const month_options = this.appendElement("div", {className: "gc-date-picker-month-options gc-hide"});
								
								// add the options
								this.months.forEach( (month, m) => { 
								
									const month_option = this.appendElement("button", {className: "gc-date-picker-month-option", textContent: month.long});
										
										month_option.addEventListener( "click", () => {
											
											// update the picker's default month
											this.changeMonth(m);								
										
										} );
										
										// if m is equal to the default month
										if ( m == this.defaultMonth ) {
										
											month_option.classList.add('gc-selected');
										
										}								
										
										month_options.appendChild(month_option);
								
								} );
								
								this.monthControls.appendChild(month_options);
								
							month_and_year_controls.appendChild(this.monthControls);
								
						// year controls
								
							// year text
							const year_controls_text = this.appendElement("button", {className: "gc-date-picker-year-controls-text", textContent: this.defaultYear, title: "Adjust Year"});
								
								year_controls_text.addEventListener( "click", function() {
								
									this.nextElementSibling.classList.remove('gc-hide');
								
								} );						
								
								this.yearControls.appendChild(year_controls_text);
								
							// year options
							
							// container
							const year_options = this.appendElement("div", {className: "gc-date-picker-year-options gc-hide"});
								
								// get the year options
								
								let presentYear = this.defaultYear;
								
								const tenYearsFuture = this.defaultYear + 10;
								
								for ( presentYear; presentYear < (tenYearsFuture + 1); presentYear++ ) {
																		
									year_options.appendChild(this.buildYearOption(presentYear));
								
								}
								
								this.yearControls.appendChild(year_options);
								
							month_and_year_controls.appendChild(this.yearControls);
							
						date_picker_controls.appendChild(month_and_year_controls);
						
						// previous and next month controls
						
						// container
						const previous_and_next_month_controls = this.appendElement("div", {className: "gc-date-picker-previous-and-next-arrow-controls"});
							
							// previous month button
							const previous_month_button = this.appendElement("button", {className: "gc-date-picker-arrow", title: "Previous Month"});
								
								previous_month_button.addEventListener( "click", () => {
								
									this.goToPrevMonth();
								
								} );						
								
								// left arrow icon
								previous_month_button.appendChild(this.appendSVG({viewBox: '0 0 24 24'}, [{d: 'M15.41 16.09l-4.58-4.59 4.58-4.59L14 5.5l-6 6 6 6z'}, {d: 'M0-.5h24v24H0z', fill: 'none'}]));
									
								previous_and_next_month_controls.appendChild(previous_month_button);
	
							// next month button
							const next_month_button = this.appendElement("button", {className: "gc-date-picker-arrow", title: "Next Month"});
								
								next_month_button.addEventListener( "click", (event) => {
								
									this.goToNextMonth();
								
								} );						
								
                                next_month_button.appendChild(this.appendSVG({viewBox: '0 0 24 24'}, [{d: 'M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z'}, {d: 'M0-.25h24v24H0z', fill: 'none'}]));							    
							
							previous_and_next_month_controls.appendChild(next_month_button);
							
							date_picker_controls.appendChild(previous_and_next_month_controls);
						
						date_picker_calendar.appendChild(date_picker_controls);
						
					// weekdays
					
					// container
					const weekdays_container = this.appendElement("div", {className: "gc-date-picker-weekdays"});
						
						// add each weekday
						this.weekdays.forEach( weekday => {
						
						    weekdays_container.appendChild(this.appendElement("div", {className: "gc-date-picker-weekday", textContent: weekday.letter}));
						
						} );
						
						date_picker_calendar.appendChild(weekdays_container);
						
					// days
					
					// container
					
					date_picker_calendar.appendChild(this.days);
				
				// time slots

					// label
					this.slots.wrapper.appendChild(this.appendElement("label", {className: "gc-time-slots-label", textContent: "Open Slots"}));
						
					// inner container

					this.slots.wrapper.appendChild(this.slots.container);
						
					// load more button
					
						this.slots.load.addEventListener( "click", () => {
								
							const hidden_time_slots = this.slots.container.getElementsByClassName("gc-hide");
								
							Array.from( hidden_time_slots ).forEach( (hidden_time_slot, i) => {
										
								if ( i < this.slots.limit ) {
											
									hidden_time_slot.classList.remove("gc-hide");
											
								}
										
							} );
									
							if ( hidden_time_slots.length === 0 )  {
										
								this.slots.load.classList.add("gc-disabled");
										
								this.slots.load.disabled = true;
										
							}
								
						} );  
						
						this.slots.wrapper.appendChild(this.slots.load);				
				
				 date_picker_calendar.appendChild(this.slots.wrapper);
					
				date_picker.appendChild(date_picker_calendar);

		return date_picker;

	}






    // 3. ACTIONS
	
	// 3.1 updates the calendar's month and year display
	updateMonthDisplay() {
		
		// update the month's text with the default month
		this.monthControls.firstElementChild.textContent = this.months[this.defaultMonth].long;
				
		// highlight the default month in the picker's dropdown
							
		Array.from( this.monthControls.lastElementChild.children ).forEach( month => {
				
			// deselect the month
			month.classList.remove('gc-selected');
				
			// if the month is equal to the default month...		
			if ( month.textContent == this.months[this.defaultMonth].long ) {
					
				// select the month	
				month.classList.add('gc-selected');
											
			}
					
		} );
	
	}
	
	// 3.2 updates the calendar's year display
	updateYearDisplay() {
		
		// update the year's text with the default year 
		this.yearControls.firstElementChild.textContent = this.defaultYear;
		
		// highlight the default year in the picker's dropdown
		
		// create a boolean to determine if the default year is in the dropdown
		let found_selected_year = false;
		
		// get the years from the dropdown
		const years = this.yearControls.lastElementChild.children;
		
		    // loop through the years
			Array.from( years ).forEach( year => {
			
				// deselect the year
				year.classList.remove("gc-selected");
				
				// if the year matches the default year...
				if ( year.textContent == this.defaultYear ) {
				
					// highlight the year
					year.classList.add("gc-selected");
					
					// update the boolean
					found_selected_year = true;
				
				}
			
			} );
		
		// if the default year was not found in the dropdown...
		if ( !found_selected_year ) {
		
			// add the default year to the dropdown
			if ( this.defaultYear < Number(years[(years.length - 1)].textContent) ) { // -- if the default year is less than the last year in the dropdown...
			
				// add it to the top of the dropdown
				this.yearControls.lastElementChild.insertBefore(this.buildYearOption(this.defaultYear), years[0]);
			
			} else { // -- if not add to it to the bottom of the dropdown
			
				this.yearControls.lastElementChild.appendChild(this.buildYearOption(this.defaultYear));
			
			}
		
		}
	
	}
		
	// 3.3 advances to the next month
	goToNextMonth(e) {
	
		// increase the default month
		this.defaultMonth++;
		
		if (this.defaultMonth > 11) { // -- if the default month is greater than 11 (december) ...
		
			// set the deafault month to 0 (january)
			this.defaultMonth = 0;
			
			// increase the default year
			this.defaultYear++;
			
		}
		
		// update the picker's month and year display
		
			// month
			this.updateMonthDisplay();
		
			// year
			this.updateYearDisplay();
		
		// re-populate the calendar		
		this.populateDates();
		
	}

	// 3.4 goes back the previous month
	goToPrevMonth(e) {
	
		// decrease the default month
		this.defaultMonth--;
		
		if (this.defaultMonth < 0) { // -- if the month is less than 0 (january)...
		
			// set the default equal to 11 (december)
			this.defaultMonth = 11;
			
			// decrease the default year
			this.defaultYear--;
			
		}
		
		// update the picker's month and year display
		
			// month
			this.updateMonthDisplay();
		
			// year
			this.updateYearDisplay();

		// re-populate the calendar		
		this.populateDates();
		
	}
	
	// 3.5 updates the calendar's default month
	changeMonth(month) {
	
		// method parameter defined:
		// month -> the month (integer -> 0 - 11) that the picker's default month will be set to
		
		// update the month
		this.defaultMonth = month;
		
		// update the calendar's month display
		this.updateMonthDisplay();
					
		// repopulate the calendar
		this.populateDates();
	
	}
	
	// 3.6 updates the calendar's default year
	changeYear(year) {
	
		// method parameter defined:
		// year -> the year (yyyy) that the picker default year will be set to
		
		// update the default year
		this.defaultYear = year;
		
		// update the calendar's year display
		this.updateYearDisplay();
		
		// repopulate the calendar
		this.populateDates();		
	
	}
	
	// 3.7 builds a year option for the calendar's dropdown
	buildYearOption(year) {
	
		// method parameter defined:
		// year -> the year (yyyy) for the option
	
		const year_option = this.appendElement("button", {className: "gc-date-picker-year-option", textContent: year});

			year_option.addEventListener( "click", () => {
										
				year_option.parentElement.classList.add('gc-hide');
											
				this.changeYear(year);
										
			} );
										
			if ( year == this.defaultYear ) {
										
				year_option.classList.add('gc-selected');
										
			}
			
			return year_option;
	
	}
	
	// 3.8 adds dates to the date picker
	populateDates() {
		
		// clear the days container
		this.days.innerHTML = "";
		
		// hide the time slots
		this.slots.wrapper.classList.add("gc-hide");
		
		// set the default amount of days
		let amount_of_days = this.months[this.defaultMonth].days;
		
		// get the day of the first of the month
		const first_day_of_the_month = ( new Date(this.defaultYear, this.defaultMonth, 1) ).getDay();
		
		// add extra padding to the amount of days for the first of the month
		amount_of_days += first_day_of_the_month;
		
		// create a counter for the days
		let day_counter = 1;
		
		// add the days to the days container
		for ( let i = 0; i < amount_of_days; i++ ) {
		
			// create the day element
			const day_element = this.appendElement("button", {className: "gc-date-picker-day"});
				
				if ( i >= first_day_of_the_month ) { // when the loop starts at the first day of the month...
					
					// create a date object for this day
					const thisDay = this.createDate(this.defaultMonth, day_counter, this.defaultYear);

					// add a special class to the element
					day_element.classList.add("gc-hasDay");
					
					// add the day to the element
					
    					// text
    					day_element.textContent = day_counter;

					// if it's the selected day...
					if (this.selectedDay == day_counter && this.selectedYear == this.defaultYear && this.selectedMonth == this.defaultMonth) {
					
						// highlight the day
						day_element.classList.add('gc-selected');
						
                		// get the time slots for the selected day
                		if ( this?.calendar?.id && this?.calendar?.webAppURL ) { // -- if the calendar property is set...
                		    
                		    // retrieve the open slots
                			this.updateTimeSlots( this.createDate(this.selectedMonth, this.selectedDay, this.selectedYear) );
                		}
						
					}
					
					// if this date is today's date...
					if ( this.isToday( this.createDate(this.defaultMonth, day_counter, this.defaultYear ) ) ) {

						// highlight the day
						day_element.classList.add("gc-today");
					
					}
					
					// if weekends are disabled...
					if ( (this?.calendar?.disableWeekends) && (thisDay.getDay() == 0 || thisDay.getDay() == 6) ) {
						
						// deselect and disable the day element

						this.disableDay(day_element);								
											
					}

					// if the day has passed...
					if ( thisDay.getTime() < ( new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate()) ).getTime() ) {

						// deselect and disable the day element
						this.disableDay(day_element);

					}
					
					// add an onclick event to select the day
					day_element.addEventListener('click', () => {
							
						// update the selected day
						this.selectedDay = day_element.textContent;
							
						// update the selected month
						this.selectedMonth = this.defaultMonth;
							
						// update the selected year
						this.selectedYear = this.defaultYear;
							
						// re-populate the calendar
						this.populateDates();
							
					});

                    // increment the day counter
					day_counter++;
					
				} else {
				    
				    day_element.disabled = true;
				    
				}
				
				this.days.appendChild(day_element);
		
		}
	
	}
	
	// 3.9 create a method that will retrieve google calendar events
	getCalendarEvents(date, callback) {
	    
	    // method parameters defined:
	    // date -> a date object
	    // callback -> returns the response from the ajax request
		
		// make an ajax request to get the calendar events

		this.requestDataViaAjax( {
			data: JSON.stringify({
		    	eventDate: date,
				calendarId: this.calendar.id,
				request: 'get-events',
			}),
			url: this.calendar.webAppURL
		}, callback);
	    
	}
	
	// 3.10 create a method that will update the time slots
	updateTimeSlots(selected) {
	    
	    // method parameter defined:
	    // selected -> the selected date from the picker

	    // clear the container that holds the time slots
	    this.slots.container.innerHTML = "";

		// determine if the selected date is today
		let isToday = this.isToday(selected);

		// set the first available slot
		let first_available_slot = this.createDate(selected.getMonth(), selected.getDate(), selected.getFullYear(), this.calendar.from);
		
		// set the last available slot
		let last_available_slot = this.createDate(selected.getMonth(), selected.getDate(), selected.getFullYear(), this.calendar.to);

		// create a callback that will retrieve the google calendar events	        
		const callback = (e) => {
		
			// parse the results
			const results = JSON.parse(e);
			
			if ( results.result == "success" ) { // if the request was a success...
				
				// begin the building the time slots

				// get the events
				const events = results.response;

				// start building the time slots
				for ( let hour = this.calendar.from; hour < this.calendar.to; hour++ ) {

					for ( let minutes = 0; minutes < 60; minutes++ ) {
				
						// set the time slot's start datetime  
						let start_datetime = this.createDate(selected.getMonth(), selected.getDate(), selected.getFullYear(), hour, minutes)
				
							// if the starting time has already passed...
							if ( start_datetime.getTime() < first_available_slot.getTime() ) {
								
								// set the start to the first available slot
								start_datetime = new Date(first_available_slot);
								
							}
							
						// set the time slot's end datetime       
						let end_datetime = new Date(start_datetime);
							end_datetime.setMinutes(start_datetime.getMinutes() + this.calendar.duration);
				
						// if it's today and the starting time has passed...
						if ( isToday && start_datetime.getTime() < this.today.getTime() ) {
				
							// skip the time slot
							continue;
				
						}
				
						// if the ending time passes the last avaiable slot
						if ( end_datetime.getTime() > last_available_slot.getTime() ) {
				
							// skip the time slot
							continue;
				
						}
				
						// update the first available slot
						first_available_slot = new Date(end_datetime);
						first_available_slot.setMinutes(first_available_slot.getMinutes() + this.calendar.delay);

							// if the time slot creates a scheduling conflict...
							if ( !this.isTimeSlotOpen(events, start_datetime) ) {
					
								// add an extra delay
								first_available_slot.setMinutes(first_available_slot.getMinutes() + this.calendar.delay)

								// skip the time slot
								continue;
					
							}
				
						this.slots.container.appendChild(this.buildTimeSlot(start_datetime, end_datetime));				
				
					}
				
				}

				this.loadTimeSlots();
    			
			} else {
			    
			    // log the error
			    console.error(results);
			    
			    // inform the user
			    this.displayAlert("An error occurred while loading the calendar.");
			    
			}

			// hide the loading circle
			this.loader.classList.add("gc-hide");

		};
			
		// make a request to the retrieve the events on the selected day	        
		this.getCalendarEvents(selected, callback);
			
		// display the picker's loading circle
		this.loader.classList.remove("gc-hide");	    
	    
	}

	// 3.11 shoes/hides time slots
	loadTimeSlots() {

		// limit the time slots to only show so many at a time
		
		// get all the time slots
		const time_slots = this.slots.container.getElementsByClassName("gc-time-slot");
		
			if ( time_slots.length <= this.slots.limit ) { // if the amount of time slots is less than or equal to the limit...
				
				// disable the "load more" button
				this.slots.load.classList.add("gc-disabled");
				this.slots.load.disabled = true;
				
			} else { // if the amount of time slots is greater than the limit...
				
				// loop through the time slots
				Array.from( time_slots ).forEach( (time_slot, i) => {
				
					// skip if the time slot has been selected
					if ( time_slot.classList.contains("gc-selected") ) {
						
						return;
						
					}
				
					if ( i > (this.slots.limit - 1) ) {
						
						time_slot.classList.add("gc-hide");
						
					}
					
				} );
				
				// enable the load more button
				this.slots.load.classList.remove("gc-disabled");
				this.slots.load.disabled = false;
				
			}
		
		// if there are no time slots...
		if ( this.slots.container.innerHTML.length == 0 ) {
			
			// inform the user
   			this.slots.container.appendChild(this.appendElement("p", {className: "gc-no-slots", textContent: "No slots available"}));
			
		}

		// display the time slots
		this.slots.wrapper.classList.remove('gc-hide'); 		

	}

	// 3.12 creates a calendar event
	createCalendarEvent(start, end) {

		// method parameters defined:
		// start -> date object
		// end -. date object

		// display the loader
		this.loader.classList.remove("gc-hide");

		// callback that will be executed after the ajax request
		const callback = (e) => {

			// parse the result
			const results = JSON.parse(e);

			if ( results.result == "success" ) {

				this.displayAlert("Your event was created successfully.");

			} else {

				// log the error
				console.error(results);

				// inform the user
				this.displayAlert("Your event could not be created. Please try again later.");

			}

			// hide the loader
			this.loader.classList.add("gc-hide");

		};

		this.requestDataViaAjax( {
			data: JSON.stringify({
		    	start: start,
				end: end,
				calendarId: this.calendar.id,
				request: 'create-event',
			}),
			url: this.calendar.webAppURL
		}, callback);

	}

	// 3.13 checks if a time slot is available
	isTimeSlotOpen(slots, slot) {

		// method parameter defined:
		// slots -> an array of date objects
			// example
			// [0] => {start: '', end: ''}
			// [1] => {start: '', end: ''}
		// slot -> a date object

		let isOpen = true;

		for ( let i = 0; i < slots.length; i++ ) {
                                 
			// the event's start time
			let start = new Date(slots[i].start);
				
			// the event's end time
			let end = new Date(slots[i].end);
				
			// if the time slot falls between a previously created event
			if ( slot.getTime() >= start.getTime() && slot.getTime() <= end.getTime() ) {
				
				// set the time slot as unavailable
				isOpen = false;
					
			}
				
		}   

		return isOpen;

	}





	// 4. BUILDERS

	// 4.1 builds a time slot
	buildTimeSlot(start, end) {

		// method parameters defined:
		// start -> date object
		// end -> date object

		// set the slot's start time      
		let start_time = this.formatTime(start);
		
		// set the slot's end time
		let end_time = this.formatTime(end);                          
			
		// append the time slot  
		const time_slot = this.appendElement("button", {className: "gc-time-slot"});

			time_slot.addEventListener( "click", () => {
					
				// deselect all the time slots
				const time_slots = this.slots.container.getElementsByClassName('gc-time-slot');
					
					Array.from(time_slots).forEach( time_slot => {
							
						time_slot.classList.remove("gc-selected");
							
					} );
						
				// select this time slot
				time_slot.classList.add("gc-selected");

				this.createCalendarEvent(start, end);
				
			} ); 				        
				
			// icon
			time_slot.appendChild(this.appendElement("span", {className: "gc-time-slot-icon"}));
					
			// text
			time_slot.appendChild(this.appendElement("span", {className: "gc-time-slot-text", textContent: `${start_time} - ${end_time}`}));
		
		return time_slot;  
		
	}





	// 5. HELPERS

    // 5.1 builds an html element
    appendElement(element, attributes) {
	
        // function parameters defined:
        // element -> the html element that will be created
        // attributes -> an object of the element's attributes
            
        // build the html element
        let html_element = document.createElement(element);
                
            if ( attributes ) { // if the attributes parameter is set...
                
                // set the elements attributes

                for ( let attribute in attributes ) {
                            
                    html_element[attribute] = attributes[attribute];
                        
                }                
                    
            }
                
        return html_element;		
        
    }	
	
	// 5.2 checks if it's a leap year
	isLeapYear(year) {
	
		// method parameter defined:
		// year -> the year that will be evaluated
	
	  	return year % 100 === 0 ? year % 400 === 0 : year % 4 === 0;
	  
	}
    
    // 5.3 create a method that will display the calendar's alert box
    displayAlert(message) {
    
        // method parameter defined:
        // alert -> the text that will be displayed in the alert box
    
       // add the text to the alert box
       this.alert.text.textContent = message;
       
       // display the alert box
       this.alert.container.classList.remove("gc-hide");
        
    }
	
	// 5.4 creates an svg
	appendSVG(attributes, paths) {
	    
	    // method parameters defined:
	    // attributes -> the svg's properties
	    // paths -> the svg's paths
	    
	    let svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
	    
	        // build the svg's properties
	        if ( attributes ) {
	            
	            for ( let attribute in attributes ) {
	                
	                svg.setAttributeNS(null, attribute, attributes[attribute]);
	                
	            }
	            
	        }
	        
	        // build the svg's paths
	        if ( paths ) {
	            
	           paths.forEach( path => {
	               
	               let svg_path = document.createElementNS('http://www.w3.org/2000/svg','path');
	               
	                   for ( let property in path ) {
	                       
	                       svg_path.setAttributeNS(null, property, path[property]);
	                       
	                   }
	                   
	                   svg.appendChild(svg_path);
	               
	           } ); 
	            
	        }
	    
	    return svg;
	    
	}

    // 5.5 requests data via ajax request
    requestDataViaAjax(data, callback) {
            
        // method parameters defined:
        // data -> the data that will be sent via ajax
        // callback -> the function that will handle the response from the ajax request
           
        // send the data via ajax
        let xhr = new XMLHttpRequest();
            xhr.open( 'POST', "./php/apps-script-connection.php", true );
            xhr.setRequestHeader( 'X-Requested-With', 'XMLHttpRequest' );
            xhr.addEventListener( 'readystatechange', function(e) {
                    
                if ( this.readyState == 4 && this.status == 200 ) { // -- if the request was a success...
                        
                    // send back the response
                    if ( callback ) {
                            
                        callback(xhr.responseText);
                            
                    }
                        
                }
                    
            } );
                
            // send the data as form data
            let request = new FormData();
                
                for ( let item in data ) {
                        
                    request.append(item, data[item]);
                        
                }
                    
            xhr.send(request);          
            
    }

    // 5.6 checks if a string is empty
    isBlank(str) {
            
        // method parameter defined: 
        // str -> string/text
                
        return (!str || /^\s*$/.test(str));
                    
    }

	// 5.7 disables a day in the calendar
	disableDay(element) {

		// method parameter defined:
		// element -> an html element

		element.classList.remove('gc-selected');
						
		element.classList.add('gc-disable');
		
		element.disabled = true;		

	}

	// 5.8 converts a time to the am/pm format
	formatTime(t) {
		
		// function parameter defined:
		// t -> the date object
			
		const d = new Date(t);
					
		let minutes = d.getMinutes();
			minutes = minutes < 10 ? `0${minutes}` : minutes;

		let hours = d.getHours();
			hours = hours % 12;
			hours = hours ? hours : 12;

		let meridiem = d.getHours() >= 12 ? 'pm' : 'am';
					
		return `${hours}:${minutes} ${meridiem}`;
					
	}

	// 5.9 returns a date object
	createDate(month, day, year, hour, minutes) {

		// method parameters defined:
		// month -> an integer (0 - 11)
		// day -> an integer (1 - 31)
		// year -> a four digit integer
		// hour -> an integer (0 - 60)
		// minutes -> an integer (0 - 60)

		let date = new Date(year, month, day);

			if ( hour ) {

				date.setHours(hour);

			}

			if ( minutes ) {

				date.setMinutes(minutes);

			}

		return date;

	}

	// 5.10 determines if a date is today's date
	isToday(date) {

		// method parameter defined:
		// date -> a date object

		let isToday = false;

			if ( date.getDate() == this.today.getDate() && date.getFullYear() == this.today.getFullYear() && date.getMonth() == this.today.getMonth() ) {

				isToday = true;

			}
		
		return isToday;

	}

}