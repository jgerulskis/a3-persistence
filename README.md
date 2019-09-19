### When To Meet (2.0) - http://a3-jgerulskis.glitch.me
This project is a continuation of A2, hence a lot of the technical and design acheivements remain the same. In the previous iteration of this application there were numerous issues that I needed to address. For starters, I had the ability to show my application's event generation, but users weren't able to take advantage of it. Every time a new event was made it overrided the previous one. Now every new event is given a unique ID. The application can store as many events as it has memory for.

Another issue was the page redirection. After post requests were made, the site navigated to a success page. Now when events are made users are redirected right to the planning page. When you make a post request with your availabilty, the event planning page is refreshed.

### Requirements
- **Server**: Created in express
- **Results**: ViewEvent shows entire dataset for a specific event
- **Add**: Create an event adds a JSON file
- **Modify**: The viewEvent.html page allows users to modify the event JSON
- **Delete**: GarbageCollector deletes expired events using node-schedule on every sunday. An event is expired if last planning date is more than 2 days before current date.
- **Middleware**: Serve-Favicon, Express.Static, Body-Parser, Timeout
- **Persistent Data Storage**: Lowdb to track event expiration and works closely with the GarbageCollector. Also use the file system to store event jsons.
- **CSS Framework**: Bootstrap, Flatpickr (for date/time selector)

### Technical Achievements
- **Tech Achievement 1**: 2 post request types (1 in eventCreationHandler.js, 1 in eventViewerHandler.js), one creates an event, another modifys the events availibilty (2 forms)
- **Tech Achievement 2**: Front end and back end post request validation to prevent malicous intent ('FormValidation'). It mainly checks the input to make sure it is properly formatted.
- **Tech Achievement 3**: Dynamically created table based on a event details JSON file (In eventViewerHandler.js)
- **Tech Achievement 4**: Dynamically created tabled cell 'click' event callbacks utilizing closure (In eventViewerHandler.js)
- **Tech Achievement 5**: The ability to create infinite events
- **Tech Acheivement 6**: JQuery to bind UI elements to HTML, and dynamically inject navbar
- **Tech Acheivement 7**: Used library MomentJS to do operation on DateTimes on the backend. Flatpicker gives the backend a range formatted like yyyy-mm-dd to yyyy-mm-dd. I convert that to an array of dates between the two. It is then given to the client when viewing the event like [yyyy-mm-dd, yyyy-mm-dd, yyyy-mm-dd, ....]
- **Tech Acheivement 8**: Used file system on backend to make events persist as JSONs
- **Tech Acheivement 9**: Garbage Collector removes old events using lowdb to track expiration.
- **Tech Acheivement 10**: Used node-schedule module to schedule GC purge.

### Design/Evaluation Achievements
- **Design Achievement 1**: Bootstrap CDN to quickly create layouts / navigation bar
- **Design Achievement 2**: Used library Flatpickr to create the DateTime UIs on the event creation page. Used native UI on mobile browsers. Key to a user friendly mobile experience.
- **Design Achievement 3**: Custom logo in top left of nav bar.
- **Desgin Achievement 4**: On the event viewer page, the cells with some available people has a custom calculated alpha value intended to create a quick way to determine availabilty. Ex: a cell with 4/5 available people will be much less transperant than a cell with 1/5 availabilty. This makes it easy to view.
- **Design Achievement 5**: Added a gradient background to the body of the html.
- **Design Achievement 7**: CSS to cause form input fields to be horizontally centered on the page
- **Design Achievement 8**: CSS to cause table cells of elements to appear side-by-side
- **Design Achievement 9**: CSS defined in a maintainable, readable form, in external stylesheets 

### Created with help from the following libraries

Flatpickr     > https://flatpickr.js.org/getting-started/
MomentJS      > https://momentjs.com/
LowDB         > https://github.com/typicode/lowdb
Node-scehdule > https://www.npmjs.com/package/node-schedule
