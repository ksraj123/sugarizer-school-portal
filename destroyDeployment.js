// createNewDeployments.js

var Ansible = require('node-ansible');

module.exports = function destroyDeployment (cluster, school, project, database, school_id){
    database.collection('requests').updateOne({schoolId: school_id}, {$set: {status: 0}})
    var config = {
        project: process.env.PROJECT_ID || project.project_Id,
        zone: process.env.PROJECT_ZONE || project.zone,
        cluster_name: cluster.name,
        schoolId: school.Id
    }
    var database = database;
    var school_id = school_id;
    var command = new Ansible.Playbook().playbook('./ansible/destroy-school-deployment').variables(config);
    var promise = command.exec();
    promise.then(function(result){
        // playbook sucessfully finished execution
        database.collection('requests').deleteOne({schoolId: school_id})
    }).catch(err => {
        console.log(err);
    })
}