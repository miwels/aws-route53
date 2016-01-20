# aws-route53
**Scripts to interact with Route53 using NodeJS**

The purpose of this script is to be able to create/delete records in Route53 by using a simple command. The syntax is:

> ./app.js verb ip

Right now there are only 2 verbs configured:

> ./app.js create 1.2.3.4

Adds an record to Route53 for the IP 1.2.3.4 and the settings specified in the route53.config.json file

> ./app.js delete 1.2.3.4

Deletes an existing entry from Route53. If the IP is not found the program will throw an error.

Keep in mind that the purpose of this script is very specific so it will create by default A records with a weighted strategy for name resolution (this was a requirement of the project I was working on).
You can define your own settings in route53.config.json. An example of the structure can be found in route53.config.json.example so you just have to rename the file.

If you haven't set up your machine with the AWS-SDK you can either enter your credentials in the aws.credentials.json file (remember to comment out lines 39 and 40 in app.js) or you can run 

> aws configure 

from the command line.


