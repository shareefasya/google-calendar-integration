// 1. GLOBAL VARIABLES

  // 1.1  calendar variable
  let calendar;

// 2. DO POST

function doPost(e) {

  // pfunction parameter defined:
  // e -> properties during request
  
  try {

    // set the calendar variable
    calendar = CalendarApp.getCalendarById(e.parameter.calendarId);

    // complete the request
    if ( e.parameter.request == "get-events" ) {

      return getCalendarEvents(e);

    } else if ( e.parameter.request == "create-event" ) {

      return createCalendarEvent(e);

    } else {

      return ContentService
              .createTextOutput( JSON.stringify({result: "error", response: {message: "the request could not be completed"}}) )
              .setMimeType(ContentService.MimeType.JSON);
      
    }

  } catch(error) {

      return ContentService
              .createTextOutput( JSON.stringify({result: "error", response: error}) )
              .setMimeType(ContentService.MimeType.JSON);

  }

}




// 3. ACTIONS

// 3.1 retrieves calendar events
function getCalendarEvents(e) {

  // function parameter defined:
  // e -> properties sent during request

  try {

    // retrieve events
    const events = calendar.getEventsForDay(new Date(e.parameter.eventDate));

    // store the events
    let return_events = [];

      for ( i in events ) {

        const event = {
          start: events[i].getStartTime(),
          end: events[i].getEndTime()
        };

        return_events.push(event);

      }

    return ContentService
            .createTextOutput( JSON.stringify({result: "success", response: return_events}) )
            .setMimeType(ContentService.MimeType.JSON);    

  } catch(error) {

      return ContentService
              .createTextOutput( JSON.stringify({result: "error", response: error}) )
              .setMimeType(ContentService.MimeType.JSON);

  }

}

// 3.2 creates a calendar event
function createCalendarEvent(e) {

  // function parameter defined:
  // e -> properties submitted during the request

  try {

    // create the event
    let event = calendar.createEvent("Event created via Calendar", new Date(e.parameter.start), new Date(e.parameter.end));

    return ContentService
            .createTextOutput( JSON.stringify({result: "success", response: {start: event.getStartTime(), end: event.getEndTime()}}) )
            .setMimeType(ContentService.MimeType.JSON);        

  } catch(error) {

      return ContentService
              .createTextOutput( JSON.stringify({result: "error", response: error}) )
              .setMimeType(ContentService.MimeType.JSON);

  }
  
}
