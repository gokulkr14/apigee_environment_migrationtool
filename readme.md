# Apigee Environment Configuration Migration Tool
This a commandline tool built on NodeJs to migrate Apigee environment configurations (KeyValueMaps, Target Servers) across different environments. It leverages the JSON request structure used by Apigee Management APIs. 

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

1. Clone the project to local file system or use npm install -g apigee_environment_migrationtool skip bleow steps
2. Open the command prompt
3. Navigate to the project directory
4. npm install -g
5. Run "apigee_environment_migrationtool"

##Usage

- To create/update KVM entries
	apigee_environment_migrationtool -u <username> -f <filePath> -o <org> -e <env> -t kvm

Sample KVM json file - 

[<br />
	{  <br /> 
	 "name" : "KVM_1",<br />
	 "entry" : [ <br />
	  {<br />
	   "name" : "Key1",<br />
	   "value" : "value_1"<br />
	  },<br />
	  {<br />
	   "name" : "Key2",<br />
	   "value" : "value_2"<br />
	  },<br />
	  {<br />
	   "name" : "Key3",<br />
	   "value" : "value_3"<br />
	  }  <br />
	 ]<br />
	},<br />
	{   <br />
	 "name" : "KVM_2",<br />
	 "entry" : [ <br />
	  {<br />
	   "name" : "Key4",<br />
	   "value" : "value_4"<br />
	  },<br />
	  {<br />
	   "name" : "Key5",<br />
	   "value" : "value_5"<br />
	  } <br />
	 ]<br />
	}<br />
]<br />

- To create/update TargetServer 
	apigee_environment_migrationtool -u <username> -f <filePath> -o <org> -e <env> -t targetserver

Sample TargetServer json file -

[<br />
	{<br />
  		"host": "https://www.server1.com",<br />
  		"isEnabled": true,<br />
  		"name": "Server_1",<br />
  		"port": 443<br />
	},<br />
	{<br />
  		"host": "https://www.server2.com",<br />
  		"isEnabled": true,<br />
  		"name": "Server_2",<br />
  		"port": 443<br />
	}<br />
]<br />

##Help
-u ----> Apigee Administrator Username<br />
-f ----> Path to the KVM / TargetServer JSON file<br />
-o ----> Apigee Organization Name<br />
-e ----> Apigee Environment (e.g. dev/test)<br />
-t ----> Type (kvm or targetserver)<br />