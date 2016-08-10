#!/usr/bin/env node


//-------------Required Supporting node Modules--->
var jsonfile = require('jsonfile');
var syncRequest = require('sync-request');
var fs = require('fs');
var argv = require('minimist')(process.argv.slice(2));
var readlineSync = require('readline-sync');	

//---------------Console Readline Inputs--------->

var username = argv.u;
var jsonFilePath = argv.f;
var org = argv.o;
var env = argv.e;
var migrateFunction = argv.t;
if(process.env.APIGEE_PASSWORD == null || process.env.APIGEE_PASSWORD == ""){
	var password = readlineSync.question('PASSWORD: ', {hideEchoBack: true});
}else {
	var password = process.env.APIGEE_PASSWORD;
}
var fileObj = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
var kvmRequestData = '';
requestData = fileObj;

//--------------Apigee ManagementUrls for KVM------>
postNewKvmURL = "https://api.enterprise.apigee.com/v1/organizations/{org}/environments/{environment}/keyvaluemaps";
getKvmURL = "https://api.enterprise.apigee.com/v1/organizations/{org}/environments/{environment}/keyvaluemaps/{kvmMapeName}";
putKvmURL = "https://api.enterprise.apigee.com//v1/organizations/{org}/environments/{environment}/keyvaluemaps/{kvmMapeName}/entries/{entityName}";
postNewKvmEntityURL = "https://api.enterprise.apigee.com/v1/organizations/{org}/environments/{environment}/keyvaluemaps/{kvmMapeName}/entries"
postNewTargetServerURL = "https://api.enterprise.apigee.com/v1/organizations/{org}/environments/{environment}/targetservers"
getTargetServerURL = "https://api.enterprise.apigee.com/v1/organizations/{org}/environments/{environment}/targetservers/{targetserver_name}"
putTargetServerURL = "https://api.enterprise.apigee.com/v1/organizations/{org}/environments/{environment}/targetservers/{targetserver_name}"

var clientIdSecret = username+":"+password;

var base64Key = "Basic " + new Buffer(clientIdSecret).toString('base64');

//-----------Parse KVM Array from Json------------>
try{
	if(migrateFunction == "kvm"){
		console.log("KVM Migration has started");
		console.log("KVM Data Length: "+requestData.length);
		for (i=0; i<requestData.length; i++) {
			var kvmName = requestData[i].name;
			var responseObj = "";
			responseObj = getKvmByNameSync(env, kvmName);
			if (responseObj.statusCode === 404){
				var kvmPostReqBody = requestData[i];
				responseObj = postKVMDataSync(env,kvmPostReqBody);
				if (responseObj.statusCode === 201){
					console.log("New KVM Map Created: " + kvmName);
				}else {
					process.exit(3)
					throw new Error("KVM Migration Failed with  -----> ResponseCode : "+responseObj.statusCode)
					console.log("KVM Migration Failed with -----> ResponseCode : "+responseObj.statusCode);
				}
			}else if(responseObj.statusCode === 200){
				console.log("Updating KVM Map: " + kvmName);
				var kvmPutReqBody = requestData[i];
				var entityArray  = kvmPutReqBody.entry;
				var entityObjToUpdate = '';
				var entityName = '';
				for (j = 0; j<entityArray.length; j++){
					entityObjToUpdate = entityArray[j];
					entityName = entityObjToUpdate.name;
					responseObj = putKVMDataSync(env,kvmName,entityName,entityObjToUpdate);
					if (responseObj.statusCode === 404 ){
						console.log("Entity "+entityName+" Not Available in KVM Map")
						var entityObjToCreate = entityArray[j];
						responseObj = postNewKVMEntityDataSync(env,kvmName,entityObjToCreate);
						if(responseObj.statusCode === 201){
							console.log("New KVM Entity Created");
						}
					} else if(responseObj.statusCode === 200){
						console.log("KVM Entity Updated");
					} else {
						process.exit(2)
						throw new Error("KVM Migration Failed with  -----> ResponseCode : "+responseObj.statusCode)
						console.log("KVM Migration Failed with -----> ResponseCode : "+responseObj.statusCode);
					}
				}
			} else {
				process.exit(1)
				throw new Error("KVM Migration Failed with  -----> ResponseCode : "+responseObj.statusCode)
				console.log("KVM Migration Failed with  -----> ResponseCode : "+responseObj.statusCode);
			}   
		}
	}
	else if(migrateFunction == "targetserver"){
		console.log("TargetServer Migration has started");
		for(i=0;i<requestData.length;i++){
			var targetServerName = requestData.name;
			var responseObj = "";
			responseObj = getTargetServerDataSync(env, kvmName);
			if(responseObj.statusCode == 404){
				var targetServerPostReqBody = requestData[i];
				responseObj = postTargetServerDataSync(env, targetServerPostReqBody);
				if(responseObj.statusCode === 201){
					console.log("New TargetServer Entity Created");
				}
			} else if(responseObj.statusCode === 200){
				var targetServerName = requestData.name;
				var targetServerPutReqBody = requestData[i];
				responseObj = putTargetServerDataSync(env, targetServerName, targetServerPutReqBody);
				if(responseObj.statusCode == 200){
					console.log("TargetServer Entity Updated Successfully");

				}
			} else {
				process.exit(1)
				throw new Error("KVM Migration Failed with  -----> ResponseCode : "+ responseObj.statusCode)
				console.log("KVM Migration Failed with  -----> ResponseCode : "+ responseObj.statusCode);
			}   
		}
	}
} catch (err){
	console.log(err.stack)
}

//------------------------------------------------------------------------------------

//----------Check KVM map Available in Apigee--------->
function getKvmByNameSync(environment,kvmMapeName){
	var getKVMDataURL = getKvmURL;
	getKVMDataURL = getKVMDataURL.replace("{org}",org);
	getKVMDataURL = getKVMDataURL.replace("{environment}",env);
	getKVMDataURL = getKVMDataURL.replace("{kvmMapeName}",kvmMapeName);
	var res = syncRequest('GET', getKVMDataURL, {
  	'headers': {
		'content-type': 'application/json',
	    'Authorization':base64Key,
  	}
	});
	return res;
}

//----------Create new KVM map in Apigee-------------->
function postKVMDataSync(environment, kvmPostReqBody){
	console.log("Creating new KVM Map in Apigee.....");
	var postKVMDataURL = postNewKvmURL;
	postKVMDataURL = postKVMDataURL.replace("{org}",org);
	postKVMDataURL = postKVMDataURL.replace("{environment}",env);
	var res = syncRequest('POST', postKVMDataURL,
	{
		json: kvmPostReqBody,
  		'headers': {
			'content-type': 'application/json',
		    'Authorization': base64Key,
  		}
	});
	return res;
}

//----------Update a entity in KVM in Apigee-------------->
function putKVMDataSync(environment, kvmName, entityName, entityObjToUpdate){
	console.log("Updating existing KVM Map entities in Apigee.....");
	var putKVMDataURL = putKvmURL;
	putKVMDataURL = putKVMDataURL.replace("{org}",org);
	putKVMDataURL = putKVMDataURL.replace("{environment}",env);
	putKVMDataURL = putKVMDataURL.replace("{kvmMapeName}",kvmName);
	putKVMDataURL = putKVMDataURL.replace("{entityName}",entityName);
	
	var res = syncRequest('PUT', putKVMDataURL,
	{
		json: entityObjToUpdate,
  		'headers': {
			'content-type': 'application/json',
		    'Authorization': base64Key,
  		}
	});
	return res;
}

//----------Create a entity in KVM Map in Apigee-------------->
function postNewKVMEntityDataSync(environment, kvmName, entityObjToCreate){
	console.log("Creating Entity to KVM Map in  Apigee.....");
	var postNewKVMEntityDataURL = postNewKvmEntityURL;
	postNewKVMEntityDataURL = postNewKVMEntityDataURL.replace("{org}",org);
	postNewKVMEntityDataURL = postNewKVMEntityDataURL.replace("{environment}",env);
	postNewKVMEntityDataURL = postNewKVMEntityDataURL.replace("{kvmMapeName}",kvmName);
	var res = syncRequest('POST', postNewKVMEntityDataURL,
	{
		json: entityObjToCreate,
  		'headers': {
			'content-type': 'application/json',
		    'Authorization': base64Key,
  		}
	});
	return res;
}

//----------get TargetServer in Apigee--------------------------->

function getTargetServerDataSync(environment, targetServerName){
	var getTargetServerDataURL = getTargetServerURL;
	getTargetServerDataURL = getTargetServerDataURL.replace("{org}",org);
	getTargetServerDataURL = getTargetServerDataURL.replace("{environment}",env);
	getTargetServerDataURL = getTargetServerDataURL.replace("{targetserver_name}",targetServerName);
	var res = syncRequest('GET', getTargetServerDataURL,
	{
  		'headers': {
			'content-type': 'application/json',
		    'Authorization': base64Key,
  		}
	});
	return res;
}

//-----------Create TargetServer in Apigee---------------------->

function postTargetServerDataSync(environment, targetServerPostReqBody){
	console.log("Creating new Target Server in Apigee.....");
	var postTargetServerDataURL = postNewTargetServerURL;
	postTargetServerDataURL = postTargetServerDataURL.replace("{org}",org);
	postTargetServerDataURL = postTargetServerDataURL.replace("{environment}",env);
	var res = syncRequest('POST', postTargetServerDataURL,
	{
		json: targetServerPostReqBody,
  		'headers': {
			'content-type': 'application/json',
		    'Authorization': base64Key,
  		}
	});
	return res;
}

//----------Update TargetServer in Apigee--------------------------->

function putTargetServerDataSync(environment, targetServerName, targetServerPutReqBody){
	console.log("updating Target Server in Apigee.....");
	var putTargetServerDataURL = putTargetServerURL;
	putTargetServerDataURL = putTargetServerDataURL.replace("{org}",org);
	putTargetServerDataURL = putTargetServerDataURL.replace("{environment}",env);
	putTargetServerDataURL = putTargetServerDataURL.replace("{targetserver_name}",targetServerName);
	var res = syncRequest('PUT', putTargetServerDataURL,
	{
		json: targetServerPutReqBody,
  		'headers': {
			'content-type': 'application/json',
		    'Authorization': base64Key,
  		}
	});
	return res;
}

//------------------------------------------------------------------------------------






