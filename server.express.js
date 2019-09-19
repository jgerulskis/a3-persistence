const low      = require('lowdb'),
      FileSync = require('lowdb/adapters/FileSync'),
      express  = require('express'),
      fs       = require('fs'),
      moment   = require('moment'),
      favicon  = require('serve-favicon'),
      timeout  = require('connect-timeout'),
      schedule = require('node-schedule'),
      dir      = '/public',
      port     = 3000,
      app      = express()
      adapter  = new FileSync('private/events/eventExpirationData.json'),
      database = low(adapter)

// Set up middleware
app.use(timeout('5s'));
app.use(express.static(__dirname + dir));
app.use(favicon(__dirname + '/public/assets/favicon.ico'));
app.use(haltOnTimeout)

// Set up database
database.defaults({events: [], count: 0}).write();

// timeout handling
function haltOnTimeout(req, res ,next) {
    if (!req.timedout) {
        next();
    } else {
        console.log("Request timeout!");
    }
}

// Manage posts / get requests
app.all("*", function(req, res) {
    if (req.method === "GET") {
        handleGet(req, res);
    }
    else if (req.method === "POST") {
        handlePost(req, res);
    } else {
        console.log("indeterminate request method!")
    }
});

const handleGet = function(req, res) {
    const filename = req.url;
    if (filename === '/') {
        sendFile(response, '/index.html')
    } else if (filename.indexOf("?") > -1) { // Handle GET params, two get request made on front end
        const parsedRequest = filename.split("?");
        sendFile(response, parsedRequest[0]);
    } else {
        sendFile(response, filename)
    }
}

const handlePost = function(request, response) {
    let dataString = ''

    request.on( 'data', function( data ) {
        dataString += data 
    })
    request.on( 'end', function() {
      console.log("Server received\n" + dataString);
      const obj = JSON.parse(dataString);
  
      if (obj.type != null && obj.type === "update") {
        FileManager.updateEventAvailibilty(obj.eventID, obj.availability, obj.name);
      }
      else if (PostValidation.validate(obj)) {
        FileManager.saveJSON(obj);
        GarbageCollector.addEvent(obj);
      }
      response.writeHead( 200, "OK", {'Content-Type': 'text/plain'})
  
      response.end()
    })
}

const sendFile = function(req, res) {
    res.sendFile(req.url);
}


/*
Need to assert a few things before saving the event JSON
1a.) Dates formatted as yyyy-mm-dd to yyyy-mm-dd
1b.) First date occurs before second date
2.) Start time is a valid military time
3.) End time is a valid military time
*/
const PostValidation = {
    validate: function (event) {
        return this.validateDates(event.potentialDates) && this.validateTime(event.startTime) && this.validateTime(event.endTime);
    },
    validateDates: function (dates) {
        const parsedDates = dates.split(" to ");
        if (parsedDates.length === 2) { // got 2 dates
            const startDate = moment(parsedDates[0], 'YYYY-MM-DD');
            const endDate = moment(parsedDates[1], "YYYY-MM-DD");
            if (startDate.isValid() && endDate.isValid()) { // valid format
                if (startDate.isBefore(endDate)) { // start before end
                    return true;
                }
                else {
                    console.log("Start date after end date");
                }
            } else {
                console.log("Dates aren't valid format");
            }
        } else {
            console.log("Didn't receive 2 dates");
        }
        return false;
    },
    validateTime: function (time) {
        return time[0] <= 24 && time[0] >= 0;
    }
}

const FileManager = {
    saveJSON: function (jsonFile) {
        const eventHash = jsonFile.eventID;
        jsonFile.potentialDates = this.converDayRangeToArray(jsonFile.potentialDates);
        fs.writeFile('./public/events/' + eventHash + '.json', JSON.stringify(jsonFile), function (err) {
            if (err) throw err;
        });
        console.log('Event saved to ' + './public/events/' + eventHash);
        return eventHash;
    },
    converDayRangeToArray: function (dayRange) {
        var dates = [];
        const parsedDates = dayRange.split(" to ");
        var currDate = moment(parsedDates[0]).startOf('day');
        var lastDate = moment(parsedDates[1]).startOf('day');

        dates.push(currDate.clone().toDate());
        while (currDate.add(1, 'days').diff(lastDate) <= 0) {
            dates.push(currDate.clone().toDate());
        }

        return dates;
    },
    updateEventAvailibilty: function (eventID, availability, name) {
        console.log("Updating  " + "./public/events/" + eventID + ".json" + " participants availabilty");
        let jsonFile = fs.readFileSync("./public/events/" + eventID + ".json", { encoding: "utf-8" }, function (err) {
            if (err) throw err;
        });
        const event = JSON.parse(jsonFile);

        event.participants.push({
            "name": name,
            "availability": availability
        });

        console.log(event.participants);
        const newJsonFile = JSON.stringify(event)
        fs.writeFile('./public/events/' + eventID + '.json', newJsonFile, function (err) {
            if (err) throw err;
        });
    }
}

const GarbageCollector = {
    setup: function() {
 
        var rule = new schedule.RecurrenceRule();
        rule.dayOfWeek = 0; // Every sunday
        // Needs to be running to exec rule
 
        return schedule.scheduleJob(rule, function() {
            this.purge();
            
            console.log("Purge complete!");
        }.bind(this));
    },
    addEvent: function(event) {
        lastPotentialDate = event.potentialDates[event.potentialDates.length - 1];
        const expiration = moment(lastPotentialDate, "").startOf('day');
        expiration.add(2, 'days').calendar();
        database.get('events').push({
            eventID: event.eventID,
            expirationDate: expiration.toDate()
        }).write();
    },
    purge: function() {
        const currentDate = moment(new Date());
        database.get('events')
            .remove(event => {
                if (currentDate.diff(moment(event.expirationDate)) >= 0) {
                    this.delete(event.eventID);
                    return true;
                }
                return false;
            }).write();
    },
    delete: function(eventID) {
        const url = "./public/events/" + eventID + ".json";
        fs.unlink(url, (err) => { // unlink == delete
            if (err) throw err;
            else {
                console.log("expired event " + url + " was deleted");
            }
        })
    }
}

const garbageCollectorScheduler = GarbageCollector.setup(); 
app.listen(port);