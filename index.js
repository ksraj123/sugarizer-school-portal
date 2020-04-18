const express = require('express');
const bodyParser = require('body-parser');
var Ansible = require('node-ansible');
var createNewDeployment = require('./createNewDeployment');
var destroyDeployment = require('./destroyDeployment');
var getExternalIp = require('./getExternalIp');
const app = express();
const path = require('path');
var getDb = require('./db');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 
app.set('view engine', 'ejs');

var database = null;

getDb.waitConnection(function(db){
    database = db;
})

const testUser = {
    username: 'superAdmin',
    password: 'sugarizer'
}

app.use(express.static('public'));

app.get('/', (req, res)=>{
    res.redirect('/schoolconsole');
})

// =================
// School console routes

app.get('/schoolconsole', (req, res)=>{
    res.redirect('/schoolconsole/request');
});

app.get('/schoolconsole/request', (req, res)=>{
    res.render('request-new-deployment');
});

app.post('/schoolconsole/request', (req, res)=>{
    database.collection('requests').find({schoolId: req.body.schoolId}).toArray(function(err, result){
        if (err){
            console.log(err);
        } else if (result.length !== 0){
            res.send('<h1>Every school most have a unique school id</h1>'); // replace this by error flashing
        }

        database.collection('requests').insertOne({
            schoolName: req.body.schoolName,
            schoolId: req.body.schoolId.toLowerCase(),
            other: req.body.other,
            status: -1
        }, function(err, r){
            if (err){
                res.send('<h1>Error while requesting deployment!, Please try again</h1>'); // replace this with flash
            } else {
                res.send('<h1>Deployment successfully requested!</h1>'); // replace this with an templated and pass r.ops to it
            }
        });
    })
});

// End of School Console routes
// =================


// =================
// Super Admin Console routes

app.get('/superadminconsole', (req, res)=>{
    res.redirect('/superadminconsole/requests');
});

app.get('/superadminconsole/login', (req, res)=>{
    res.render('login', {});
});

app.get('/superadminconsole/deployments', (req, res)=>{
    database.collection('requests').find().toArray(function(err, result){
        if (err){
            console.log(err);
        }
        console.log(result);
        res.render('deployments', {
            module: 'Deployments',
            results: result,
        })
    })
})

app.get('/superadminconsole/requests', (req, res)=>{
    database.collection('requests').find().toArray(function(err, result){
        if (err){
            console.log(err);
        }
        console.log(result);
        res.render('requests', {
            results: result,
            module: 'Requests'
        });
    })
})

app.post('/superadminconsole/requests', (req, res)=>{
    if (req.body.approve){
        var school_Id = req.body.approve;
        database.collection('requests').updateOne({schoolId: req.body.approve}, {$set: {status: 0}}, function(err, result){
            if (err){
                console.log(err);
            }
            createNewDeployment(
                {name: 'test-auth-cluster'},
                {Id: school_Id},
                {
                    project_Id: 'auth-testing-272315',
                    zone: 'asia-northeast1-a'
                },
                database,
                school_Id
            );
        });
    }
    
    if (req.body.decline){
        database.collection('requests').findOneAndDelete({schoolId: req.body.decline}, function(err, r){
            if (err){
                console.log(err);
            }
        })
    }
    res.redirect('/superadminconsole/requests');
});

app.post('/superadminconsole/destroyDeployment', function(req, res){
    var school_Id = req.body.destroy;
    destroyDeployment(
        {name: 'test-auth-cluster'},
        {Id: school_Id},
        {
            project_Id: 'auth-testing-272315',
            zone: 'asia-northeast1-a'
        },
        database,
        school_Id
    );
    res.redirect('/superadminconsole/deployments');
})

// End of Super Admin Console routes
// ================

// app.get('/domything', function(req, res){
//     database.collection('requests').deleteOne({schoolName: 'tes'}, 
//         function(err, result){
//             if (err){
//                 console.log(err);
//             }});
//     res.send('done!');
// })

app.listen(8080, ()=>{
    console.log("connected to db, app listening on port 3000");
})