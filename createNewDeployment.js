// createNewDeployments.js

var Ansible = require('node-ansible');

module.exports = function createNewDeployment (cluster, school, project){
    var config = {
        project: process.env.PROJECT_ID || project.project_Id,
        zone: process.env.PROJECT_ZONE || project.zone,
        cluster_name: cluster.name,
        schoolId: school.Id
    }
    var command = new Ansible.Playbook().playbook('./ansible/new-school-deployment').variables(config);
    var promise = command.exec();
    promise.then(function(result){
        // playbook sucessfully finished execution
        var getJson = new Ansible.Playbook().playbook('./ansible/get-external-ip').variables(config);
        getJson.exec().then(function(jsonRes){
            // external IP is allocated after a few minutes of successful installation
            // so few minutes pause added to external ip playbook
            var getJson = new Ansible.Playbook().playbook('./ansible/get-external-ip').variables(config);
            getJson.exec().then(function(jsonRes){
                var res = jsonRes.output.slice(jsonRes.output.indexOf('{'), jsonRes.output.lastIndexOf('}')+1);
                res = JSON.parse(JSON.parse(res).json.stdout_lines.reduce((acc, curr) => acc+curr, ""));
                console.log(`External Ip = ${res.status.loadBalancer.ingress[0].ip}`);
            }).catch(function(err){
                console.log(err);
            })
        }).catch(function(err){
            console.log(err);
        })
    }).catch(err => {
        console.log(err);
    })
}