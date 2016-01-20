# aws-route53
**Scripts to interact with Route53 using NodeJS**

The purpose of this script is to be able to create/delete records in Route53 by using a simple command. The syntax is:

> ./app.js verb ip

Keep in mind that the purpose of this script is very specific so it will create by default A records with a weighted strategy for name resolution (this was a requirement of the project I was working on).
You can define your own settings in route53.config.json. An example of the structure can be found in route53.config.json.example so you just have to rename the file.

If you haven't set up your machine with the AWS-SDK you can either enter your credentials in the aws.credentials.json file (remember to comment out lines 39 and 40 in app.js) or you can run 

> aws configure 

from the command line.


