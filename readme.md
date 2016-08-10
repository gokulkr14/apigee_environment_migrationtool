# Apigee Environment Configuration Migration Tool
Is a commandline tool built on NodeJs used to migrate Apigee environment configurations (KeyValueMaps, Target Servers) across different environments. It leverages the JSON request structure used by Apigee Management APIs. 

##Features
1. KeyValueMap (KVM)
	- Create a new KVM
	- Update an existing KVM
	- Create a new entry in KVM
	- Update an existing entry in KVM

2. TargetServer
	- Create a new TargetServer
	- Update an existing TargetServer

##Installation

1. Clone the project to local file system
2. Open the command prompt
3. Navigate to the project directory
4. npm install -g
5. Run "apigee_environment_migrationtool"

##Usage

- To create/update KVM entries
	apigee_environment_migrationtool -u <username> -f <filePath> -o <org> -e <env> -t kvm

Sample KVM json file - 

[
	{   
	 "name" : "KVM_1",
	 "entry" : [ 
	  {
	   "name" : "Key1",
	   "value" : "value_1"
	  },
	  {
	   "name" : "Key2",
	   "value" : "value_2"
	  },
	  {
	   "name" : "Key3",
	   "value" : "value_3"
	  }  
	 ]
	},
	{   
	 "name" : "KVM_2",
	 "entry" : [ 
	  {
	   "name" : "Key4",
	   "value" : "value_4"
	  },
	  {
	   "name" : "Key5",
	   "value" : "value_5"
	  } 
	 ]
	}
]

- To create/update TargetServer 
	apigee_environment_migrationtool -u <username> -f <filePath> -o <org> -e <env> -t targetserver

Sample TargetServer json file -

[
	{
  		"host": "https://www.server1.com",
  		"isEnabled": true,
  		"name": "Server_1",
  		"port": 443
	},
	{
  		"host": "https://www.server2.com",
  		"isEnabled": true,
  		"name": "Server_2",
  		"port": 443
	}
]

##Help
-u ----> Apigee Administrator Username
-f ----> Path to the KVM / TargetServer JSON file
-o ----> Apigee Organization Name
-e ----> Apigee Environment (e.g. dev/test)
-t ----> Type (kvm or targetserver)