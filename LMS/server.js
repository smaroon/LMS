/**
 * Created by sarah.maroon on 4/5/2016.
 */
// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express = require('express');        // call express
var app = express();                 // define our app using express
var bodyParser = require('body-parser');
var fs = require('fs');
var bookdatafile = 'public/server/data/books.json';
var persondatafile = 'public/server/data/persons.json';

// =============================================================================
// configure app to use bodyParser()
// this will let us get the data from a POST in JSON
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// ===================== needed to bypass cross origin domain issues with Chrome ===============
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

var port = process.env.PORT || 8089;        // set  port


// API ROUTES
// =============================================================================
var router = express.Router();              // create instance of the express Router

// middleware to use for all requests
router.use(function (req, res, next) {
    // do logging
    console.log('api connection request');
    next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:8089/api)
router.get('/', function (req, res) {
    res.json({message: 'Testing api message.'});
});

/* GET all media and POST new media */
router.route('/books')
    .get(function (req, res) { // returns all media
        var data = getBookData();
        res.send(data);
    })

    .post(function (req, res) { // posts new media item
        var data = getBookData();

        var newBook = {
            isbn: req.body.isbn,
            title: req.body.title,
            author: req.body.author,
            subject: req.body.subject,
            media_type: req.body.media_type,
            qty: req.body.qty
        };

        data.push(newBook); // push new media to media array

        saveBookData(data); // save book data
        res.status(201).send(newBook); // send back success status
    });

router.route('/search')
    .post(function (req, res) {  // search media item
        var data = getBookData();
        var result = [];
        var type = req.body.search_type;
        var search = req.body.search.toLowerCase();
        console.log('type: ' + type + ' ' + 'search: ' + search);
        for (var i = 0; i < data.length; i++) {

            switch (type) {
                case 'isbn':
                    if (data[i].isbn.toLowerCase() == search)
                        result.push(data[i]);
                    break;
                case 'title':
                    if (data[i].title.toLowerCase() == search)
                        result.push(data[i]);
                    break;
                case 'author':
                    if (data[i].author.toLowerCase() == search)
                        result.push(data[i]);
                    break;
                case 'subject':
                    if (data[i].subject.toLowerCase() == search)
                        result.push(data[i]);
                    break;
                case 'media_type':
                    if (data[i].media_type.toLowerCase() == search)
                        result.push(data[i]);
                    break;
                //case 'persons':                           // todo person search functionality
                //    var personData = getPersonData();
                //    if (personData[i].media_type.toLowerCase() == search)
                //        result.push(data[i]);
                //    break;
            }
        }
        res.send(result);
    });

/* GET, PUT and DELETE individual books */
router.route('/books/:id')
    .get(function (req, res) {
        var data = getBookData();

        var matchingBooks = data.filter(function (item) {   //loop the media data and find match
            return item.isbn == req.params.id;
        });

        if (matchingBooks.length === 0) {
            res.sendStatus(404);
        } else {
            res.send(matchingBooks[0]);
        }
    })

    .delete(function (req, res) {    // remove media item

        var data = getBookData();

        var pos = -1;
        for (var i = 0; i < data.length; i++) {     // loop media and find item
            if (data[i].isbn == req.params.id)
                pos = i;
        }

        if (pos > -1) {                     // if item found remove from array
            data.splice(pos, 1);
        } else {
            //res.sendStatus(404);
            console.log('error');           // log an error
        }

        saveBookData(data);
        res.sendStatus(204);

    })

    .put(function (req, res) { // edit media item

        var data = getBookData();

        var matchingBooks = data.filter(function (item) {    //loop media and find item
            return item.isbn == req.params.id;
        });

        if (matchingBooks.length === 0) {
            res.sendStatus(404);
        } else {

            var bookToUpdate = matchingBooks[0];        // save updated data to media
            bookToUpdate.title = req.body.title;
            bookToUpdate.author = req.body.author;
            bookToUpdate.subject = req.body.subject;
            bookToUpdate.media_type = req.body.media_type;
            bookToUpdate.qty = req.body.qty;

            saveBookData(data);
            res.sendStatus(204);

        }
    });

router.route('/login')   // login to app
    .post(function (req, res) {
        var data = getPersonData();
        var user = req.body.username;
        var pw = req.body.password;
        var send = [];
        data.forEach(function (element, index, array) {  // loop users and compare username & pw data

            if (element.username.toLowerCase() === user.toLowerCase()) {
                if (element.password == pw) {
                    send.push(element);
                }
            }
        });
        res.send(send);
    });

router.route('/register')  // register new person
    .post(function (req, res) {
        //console.log(req.body);
        var data = getPersonData();
        var nextID = getNextAvailableID(data);  // get next user id sequence

        var newPerson = {
            person_id: nextID,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            username: req.body.username,
            password: req.body.password,
            checked_out: []
        };

        data.push(newPerson);
        savePersonData(data);
        res.status(201).send(newPerson);
    });

router.route('/checkout/:id')    // check out media item
    .post(function (req, res) {
        var peopledata = getPersonData();
        var bookdata = getBookData();
        var due = new Date();
        due.setDate(due.getDate() + 30);    // due date is current day + 30
        //var personid = req.body.person_id;
        var newCheckOut = {
            isbn: req.body.isbn,
            title: req.body.title,
            author: req.body.author,
            subject: req.body.subject,
            media_type: req.body.media_type,
            datedue: due
        }
        console.log(req.params.id);
        bookdata.forEach(function(element,index,array){
           if (element.isbn === req.body.isbn){
               element.qty = element.qty - 1;    // decrement available qty
           }
            saveBookData(bookdata);
        });
        peopledata.forEach(function (element, index, array) {
            if (element.person_id == req.params.id){
                element.checked_out.push(newCheckOut);   // once user if found add media to users checked out list
            }
        });

        savePersonData(peopledata);
        res.send('Success');
    });

router.route('/checkin')
    .post(function (req,res) {
        var peopledata = getPersonData();
        var bookdata = getBookData();

        bookdata.forEach(function(element,index,array){
            if (element.isbn === req.body.isbn){
                element.qty = element.qty + 1;    // increment media qty
            }
            saveBookData(bookdata);
        });

        for (var i = 0; i < peopledata.length; i++) {                         // loop users
            if (peopledata[i].person_id == req.body.person_id) {              // find user
                for (var j = 0; j < peopledata[i].checked_out.length; j++) {  // loop user's checked out media
                    //console.log(peopledata[i].checked_out[j].isbn);
                    if (peopledata[i].checked_out[j].isbn === req.body.isbn){   // find media isbn
                        //console.log('found media');
                        peopledata[i].checked_out.splice(j,1)                   // remove media from user
                        savePersonData(peopledata);                             // save user data

                    }

                }
            }
        }
        savePersonData(peopledata);
        res.send('Success');

    });

function getBookData() {
    var data = fs.readFileSync(bookdatafile, 'utf8'); // read media data from JSON file
    return JSON.parse(data);
}

function saveBookData(data) {
    fs.writeFile(bookdatafile, JSON.stringify(data, null, 4), function (err) {  // save media from JSON file
        if (err) {
            console.log(err);
        }
    });
}

function getPersonData() {
    var data = fs.readFileSync(persondatafile, 'utf8');   // read person data from JSON file
    return JSON.parse(data);
}

function savePersonData(data) {
    fs.writeFile(persondatafile, JSON.stringify(data, null, 4), function (err) {   // save person data to JSON file
        if (err) {
            console.log(err);
        }
    });
}


function getNextAvailableID(allPeople) {
    var maxID = 0;
    allPeople.forEach(function (element, index, array) { // find the max person id and add 1

        if (element.person_id > maxID) {
            maxID = element.person_id;
        }
    });
    return ++maxID;
}

// REGISTER ROUTES -------------------------------
// all  routes will be prefixed with /api
app.use('/api', router);


// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Listening on ' + port);