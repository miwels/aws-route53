#!/usr/bin/env node

// This script allows to push or delete records to Route53 by just specifying the
// verb (or method: CREATE/DELETE) and the IP address.
// Keep in mind that the script doesn't care about DNS Types (A, NS, etc.), names
// or weights. All this information goes in a config file that we can edit. This file
// is used in jsondata.js to pull specific information
//
// This script is very specific so we are going to use always the same parameters read
// from the file route53.config.json (rename the example file so that it meets your needs)
//
// Feel free to change any of these parameters. In order to do so you just have
// to update the jsondata.js file that can be found in this same folder. It contains
// the JSON that the AWS-SDK uses to push data to Route53
// The full Route53 API documentation can be found here:
//
// http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Route53.html

var actionArg = process.argv[2];
var ipArg = process.argv[3];

if(!ipArg || !actionArg) {
    console.log("Usage: ./app.js delete 1.2.3.4");
    process.exit(1); // exit with error
}

var AWS = require('aws-sdk');
var jsondata = require('./jsondata'); // edit your own settings in this file

// Load credentials from a JSON file
// This bit is only needed when we are working in the development (local) machine
// and only if we haven't run 'aws config' to manually enter our credentials
//
// On the EC2 instance the permissions are read from the policies that we set up when we
// create the instance
//
// We should never put credentials in the live system but we do need the region
//
// var awsCredentialsPath = './aws.credentials.json';
// AWS.config.loadFromPath(awsCredentialsPath);

// for some reason route53 only can be constructed with the new operator
var route53 = new AWS.Route53();

// this global object contains all the data that AWS API methods expect
var params = {};

// Before making any changes we have to retrieve the Hosted Zone ID.
// We are assuming that there is only 1 HostedZoneId so we just have
// to pull the record [0] from the Hosted Zones Array
var hostedZoneId = "";
route53.listHostedZones(params, function (err, data) {
    if (err) console.log(err, err.stack);

    hostedZoneId = data.HostedZones[0].Id.split("/")[2];

    params = {
        HostedZoneId : hostedZoneId
    };

    switch(actionArg)
    {
        case "delete":

            // if we find the IP attempt to delete/upsert the record
            findByIp(params, ipArg, function (data) {
                route53.changeResourceRecordSets({
                    HostedZoneId : hostedZoneId,
                    ChangeBatch  : jsondata.delete(ipArg)
                }, function (err, data) {
                    if (err) console.log(err.stack);

                    if(data.ChangeInfo.Status == 'PENDING') {
                        console.log('Request submitted successfully.');
                    }
                });
            });
            break;

        case "create":

            route53.changeResourceRecordSets({
                HostedZoneId : hostedZoneId,
                ChangeBatch  : jsondata.create(ipArg)
            }, function (err, data) {
                if (err) console.log(err.stack);

                if (data.ChangeInfo.Status == 'PENDING') {
                    console.log('Request submitted successfully');
                }
            });
            break;

        default:
            throw Error("Invalid argument option");
    }

});

// Find a Hosted Zone Record based on an IP and call callback() if the record is found
// We have to do this due to the Asynchronous nature of NodeJS
var findByIp = function (params, ip, callback)
{
    route53.listResourceRecordSets(params, function (err, data){

        if (err) console.log(err, err.stack);

        var listOfHostedZones = data.ResourceRecordSets;

        var found = false; // we only use this varibale to trigger an error if the IP is not found

        for (var i = 0; i < listOfHostedZones.length; i++)
        {
            // we only care about individual A records so we have to check only the first value of the array of values
            if (listOfHostedZones[i].ResourceRecords[0].Value == ip) {
                found = true; // ip address found, call callback() and return the hosted zone where the IP has been found
                if (typeof callback == "function") callback( listOfHostedZones[i] );
            }
        }

        // if we don't find the IP throw an error
        if(!found) throw Error("IP address not found.");
    });
};