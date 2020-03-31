var Ansible = require('node-ansible');

module.exports = function getExternalIp(cluster, school, project){
    var config = {
        project: process.env.PROJECT_ID || project.project_Id,
        zone: process.env.PROJECT_ZONE || project.zone,
        cluster_name: cluster.name,
        schoolId: school.Id
    }
    var getJson = new Ansible.Playbook().playbook('./ansible/get-external-ip').variables(config);
    getJson.exec().then(function(jsonRes){
        var res = jsonRes.output.slice(jsonRes.output.indexOf('{'), jsonRes.output.lastIndexOf('}')+1);
        res = JSON.parse(JSON.parse(res).json.stdout_lines.reduce((acc, curr) => acc+curr, ""));
        console.log(`External Ip = ${res.status.loadBalancer.ingress[0].ip}`);
    }).catch(function(err){
        console.log(err);
    })
}