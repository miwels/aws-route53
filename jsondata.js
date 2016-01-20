// This module returns the necessary JSON to delete or create an entry in Route53
// we just need the IP address for now, the Type of record, weight, identifier
// and TTL are going to be always the same for all
//
// The main parameters (name, weight, type and TTL) are defined in the following file:
//
var config = require('./route53.config.json');
//
// NOTE: Documentation and format can be found here:
// http://docs.aws.amazon.com/cli/latest/reference/route53/change-resource-record-sets.html
// https://willwarren.com/2014/07/03/roll-dynamic-dns-service-using-amazon-route53/
module.exports = {

    delete : function (ip) {
        return this.base('delete', ip, "Delete an IP address from Route53")
    },

    create : function (ip) {
        return this.base('create', ip, "Add an IP address to Route53");
    },

    // not implemented (for now!)
    upsert: function (ip) {
        return this.base('upsert', ip, "Update an IP address in Route53");
    },

    // pretty much every JSON has the same structure so we can group the basic
    // syntax in a function
    base : function (action, ip, comment) {

        var weight = ip.replace(/\./g, '');

        var output = {
            "Comment" : comment,
            "Changes":[
                {
                    "Action": action.toUpperCase(),
                    "ResourceRecordSet":
                    {
                        "Name" : config.name,
                        "Weight" : config.weight,
                        "Type" : config.type,
                        "ResourceRecords":[
                          {
                            "Value": ip
                          }
                        ],
                        "TTL" : config.ttl,
                        "SetIdentifier" : "weight" + weight
                    }
                }
            ]
        };

        return output;
    }
};