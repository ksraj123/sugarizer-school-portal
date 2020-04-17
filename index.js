const express = require('express');
const bodyParser = require('body-parser');
var Ansible = require('node-ansible');
var createNewDeployment = require('./createNewDeployment');
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
            schoolId: req.body.schoolId,
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
    res.redirect('/superadminconsole/login');
});

app.get('/superadminconsole/login', (req, res)=>{
    res.render('login', {});
});

app.get('/superadminconsole/deployments', (req, res)=>{
    res.render('deployments', {
        module: 'Deployments'
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
    // var command = new Ansible.Playbook().playbook('../sugarizer-school-portal-ansible/sugarizer-school-portal-ansible/create-new-cluster');
    // var promise = command.exec();
    // promise.then(function(result) {
    //     console.log(result.output);
    //     console.log(result.code);
    //     console.log(result);
    // }).catch(err => {
    //     console.log(err);
    // })

    // res.render('requests', {
    //     module: 'Requests'
    // })
})

app.post('/superadminconsole/requests', (req, res)=>{
    if (req.body.approve){
        res.send(`request approved!!! ${req.body.approve}`);
    }
    
    if (req.body.decline){
        database.collection('requests').findOneAndDelete({schoolId: req.body.decline}, function(err, r){
            if (err){
                console.log(err);
            }
            res.redirect('/superadminconsole/requests');
        })
    }

    console.log(req.body);
});

// End of Super Admin Console routes
// ================

app.get('/getTodos', (req, res)=>{
    db.getDB().collection(collection).find({}).toArray((err, documents)=>{
        if (err)
            console.log(err);
        else{
            console.log(documents);
            res.json(documents);
        }
    })
})

app.get('/addNewDep', (req, res)=>{
    createNewDeployment(
        {name: 'test-auth-cluster'},
        {Id: 'node-university'},
        {
            project_Id: 'auth-testing-272315',
            zone: 'asia-northeast1-a'
        });
    res.send('<h1>NEW will be added soon</h1>');
})

app.get('/getExternal', (req, res)=>{
    getExternalIp(
        {name: 'test-auth-cluster'},
        {Id: 'node-university'},
        {
            project_Id: 'auth-testing-272315',
            zone: 'asia-northeast1-a'
        }
    );
    res.send('<h1>will get external</h1>')
})

app.listen(8080, ()=>{
    console.log("connected to db, app listening on port 3000");
})