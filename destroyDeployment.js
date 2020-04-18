// createNewDeployments.js

var Ansible = require('node-ansible');

module.exports = function destroyDeployment (cluster, school, project, database, school_id){
    var config = {
        project: process.env.PROJECT_ID || project.project_Id,
        zone: process.env.PROJECT_ZONE || project.zone,
        cluster_name: cluster.name,
        schoolId: school.Id
    }
    var database = database;
    var school_id = school_id;
    var command = new Ansible.Playbook().playbook('./ansible/destroy-school-deployment.yml').variables(config);
    var promise = command.exec();
    promise.then(function(result){
        // playbook sucessfully finished execution
        var getJson = new Ansible.Playbook().playbook('./ansible/get-external-ip').variables(config);
        getJson.exec().then(function(jsonRes){
            // external IP is allocated after a few minutes of successful installation
            // so few minutes pause added to external ip playbook
            var res = jsonRes.output.slice(jsonRes.output.indexOf('{'), jsonRes.output.lastIndexOf('}')+1);
            res = JSON.parse(JSON.parse(res).json.stdout_lines.reduce((acc, curr) => acc+curr, ""));
            var externalIp = res.status.loadBalancer.ingress[0].ip;
            console.log(`External Ip = ${externalIp}`);
            database.collection('requests').updateOne({schoolId: school_id}, {$set: {status: 1, externalIp: externalIp, replicas: 3}}, 
                function(err, result){
                    if (err){
                        console.log(err);
                    }});
        }).catch(function(err){
            console.log(err);
        })
    }).catch(err => {
        console.log(err);
    })
}