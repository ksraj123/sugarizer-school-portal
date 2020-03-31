const express = require('express');
const bodyParser = require('body-parser');
var Ansible = require('node-ansible');
var createNewDeployment = require('./createNewDeployment');
var getExternalIp = require('./getExternalIp');
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 
app.set('view engine', 'ejs');
const path = require('path');

const db = require('./db');
const collection = "todo";

const testUser = {
    username: 'superAdmin',
    password: 'sugarizer'
}

app.use(express.static('public'));

app.get('/login', (req, res)=>{
    res.render('login', {});
})

app.post('/login', (req, res)=>{
    if (req.body.username === testUser.username && req.body.password === testUser.password){
        res.send("<h1>Login Sucessful</h1>");
    } else {
        res.redirect("/deployments");
    }
});

app.get('/deployments', (req, res)=>{
    res.render('deployments', {
        module: 'Deployments'
    })
})

app.get('/requests', (req, res)=>{
    var command = new Ansible.Playbook().playbook('../sugarizer-school-portal-ansible/sugarizer-school-portal-ansible/create-new-cluster');
    var promise = command.exec();
    promise.then(function(result) {
        console.log(result.output);
        console.log(result.code);
        console.log(result);
    }).catch(err => {
        console.log(err);
    })

    res.render('requests', {
        module: 'Requests'
    })
})

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
        {Id: 'sugarizer-university'});
    res.send('<h1>NEW will be added soon</h1>');
})

app.get('/getExternal', (req, res)=>{
    getExternalIp(
        {name: 'test-auth-cluster'},
        {Id: 'sugarizer-university'}
    );
    res.send('<h1>will get external</h1>')
})


db.connect((err)=>{
    if(err){
        console.log("Unable to connect to database");
        process.exit(1); // if unable to connect then the application exits, this should not be the case in kubernetes
    }
    else{
        app.listen(3000, ()=>{
            console.log("connected to db, app listening on port 3000");
        })
    }
})