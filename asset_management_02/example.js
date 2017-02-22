/**
 * Copyright 2016 IBM
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
/**
 * Licensed Materials - Property of IBM
 * © Copyright IBM Corp. 2016
 */

/**
 * Simple asset management use case where authentication is performed
 * with the help of TCerts only (use-case 1) or attributes only (use-case 2).*/

/* jshint node: true */
/* jshint esversion: 6*/

"use strict";

var hfc = require('hfc');
var crypto = require('crypto');
var fs  = require('fs');
var util = require('util');
var tutil = require('./test-util');
var x509 = require('x509');

var chain, chaincodeID;
var chaincodeName = "mycc3";
chaincodeID = process.env.CHAINCODE_ID || null;

var accountInformation = {
    alice: {
        account: "12345-56789",
        attributeList: ["role", "account" ],
        attributeValueList: ["client", "12345-56789"],
    }, 
    bob: {
        account:  "23456-67890",
        attributeList: ["role", "account" ],
        attributeValueList: ["client", "23456-67890"],
    }
};


var username = process.env.SDK_DEFAULT_USER;
var usersecret = process.env.SDK_DEFAULT_SECRET;
var goPath = process.env.GOPATH;
var testChaincodePath = process.env.SDK_CHAINCODE_PATH
 ? process.env.SDK_CHAINCODE_PATH
 : "github.com/asset_management_with_roles/" ;
var absoluteTestChaincodePath = goPath + "/src/" + testChaincodePath;

var devMode = ( process.env.SDK_DEPLOY_MODE == 'dev')
 ? true
 : false;
var peerAddr0 = process.env.SDK_PEER_ADDRESS
 ? process.env.SDK_PEER_ADDRESS
 : "localhost:7054" ;
var caCert   = process.env.SDK_CA_CERT_FILE
 ? process.env.SDK_CA_CERT_FILE
 : "tlsca.cert" ;

var chainDeployer = {
    name: username ? username : 'WebAppAdmin',
    secret: usersecret ? usersecret : 'DJY27pEnl16d'
};

var chainAssigner = {
    name: 'assigner',
    secret: 'Tc43PeqBl11'
};

var chainUser1 = {
    name: 'alice',
    secret: 'CMS10pEQlB16'
};

var chainUser2 = {
    name: 'bob',
    secret: 'NOE63pEQbL25'
};

// Given a certificate byte buffer of the DER-encoded certificate, return
// a PEM-encoded (64 chars/line) string with the appropriate header/footer
function certToPEM(cert, cb) {
    var pem = cert.encode().toString('base64');
    var certStr = "-----BEGIN CERTIFICATE-----\n"
    for (var i = 0; i < pem.length; i++) {
       if ((i>0) && i%64 == 0) certStr += "\n";
       certStr += pem[i]
    }
    certStr += "\n-----END CERTIFICATE-----\n"
    cb(certStr)
}

// Validate that the correct x509 v3 extensions containing
// attribute-entries were added to the certificate
function checkCertExtensions(certbuf, attV, cb) {
    var pem = certbuf.encode().toString('base64');
    certToPEM(certbuf, function(certPem) {
       var c = x509.parseCert(certPem)
       console.log("CN: ", c.subject.commonName);
       console.log("extensions: ");
       var extArrVal  = [];
       Object.keys(c.extensions).forEach(function(key) {
           var attrOid = key;
           var attrVal = c.extensions[key];
           extArrVal.push(attrVal);
           console.log("   --->", attrOid, ":", attrVal);
       });
       for (var a in attV) {
          if ( extArrVal.indexOf(attV[a]) == -1) {
             console.log( attV[a], "not in extentions");
             return cb(new Error(util.format("Failed to find %s in certificate extentions", attV[a])));
          }
       }
    });
    return cb();
}

// Create the chain and enroll users as deployer, assigner, and nonAssigner (who doesn't have privilege to assign.
function setup(target, cb) {
   var users = {};
   console.log("initializing ...");
   var chain = tutil.getTestChain();
   if (devMode) chain.setDevMode(true);
   console.log("enrolling " + chainDeployer.name + "...");
   chain.enroll(chainDeployer.name, chainDeployer.secret, function (err, user) {
      if (err) return cb(err);
      users.deployer = user;
      console.log("enrolling " + chainAssigner.name + "...");
      chain.enroll(chainAssigner.name, chainAssigner.secret, function (err, user) {
         if (err) return cb(err);
         users.assigner = user;
         console.log("enrolling " + chainUser1.name + "...");
         chain.enroll(chainUser1.name, chainUser1.secret, function (err, user) {
            if (err) return cb(err);
            users.alice = user;
            console.log("enrolling " + chainUser2.name + "...");
            chain.enroll(chainUser2.name, chainUser2.secret, function (err, user) {
               if (err) return cb(err);
               users.bob = user;
               return target(users,cb);
            });
         });
      });
   });
}

// Deploy asset_management_with_roles with the name of the assigner role in the metadata
function deploy(users,cb) {
    var deployCert;
    if (tutil.tlsOn) {
       deployCert = tutil.caCert
       if (peerAddr0.match(tutil.hsbnDns)) deployCert = tutil.hsbnCertPath
       else if (peerAddr0.match(tutil.bluemixDns)) deployCert = tutil.bluemixCertPath
       // Path (under $GOPATH) required for deploy in network mode
       fs.createReadStream(caCert).pipe(fs.createWriteStream(absoluteTestChaincodePath + '/certificate.pem'));
    }

    console.log("deploying with the role name 'assigner' in metadata ...");
    var req = {
        fcn: "init",
        args: [],
        certificatePath: deployCert,
        metadata: new Buffer("assigner")
    };
    if (devMode) {
       req.chaincodeName = chaincodeName;
    } else {
       req.chaincodePath = testChaincodePath;
    }
    var tx = users.deployer.deploy(req);
    tx.on('submitted', function (results) {
        console.log("deploy submitted: %j", results);
    });
    tx.on('complete', function (results) {
        console.log("deploy complete: %j", results);
        chaincodeID = results.chaincodeID;
        console.log("chaincodeID:" + chaincodeID);
        return cb();
    });
    tx.on('error', function (err) {
        console.log(JSON.stringify(err));
        console.log("deploy error: %j", err.toString());
        return cb(err);
    });
}

function assignOwner(user,owner,cb) {
    var req = {
        chaincodeID: chaincodeID,
        fcn: "assign",
        args: ["MyAsset",owner],
        userCert: user.cert,
        attrs: ["role", "account"], 
    };
    console.log("assign: invoking %j",req);
    var tx = user.invoke(req);
    tx.on('submitted', function (results) {
        console.log("assign transaction ID: %j", results);
    });
    tx.on('complete', function (results) {
        console.log("assign invoke complete: %j", results);
        return cb();
    });
    tx.on('error', function (err) {
        console.log("assign invoke error: %j", err);
        return cb(err);
    });
}

function transferOwner(user,owner,cb) {
    var req = {
        chaincodeID: chaincodeID,
        fcn: "transfer",
        args: ["MyAsset",owner],
        userCert: user.cert,
        attrs: ["role", "account"], 
    };
    console.log("assign: invoking %j",req);
    var tx = user.invoke(req);
    tx.on('submitted', function (results) {
        console.log("assign transaction ID: %j", results);
    });
    tx.on('complete', function (results) {
        console.log("assign invoke complete: %j", results);
        return cb();
    });
    tx.on('error', function (err) {
        console.log("assign invoke error: %j", err);
        return cb(err);
    });
}

// Check to see if the owner of the asset is
function checkOwner(user,ownerAccount,cb) {
    var req = {
        chaincodeID: chaincodeID,
        fcn: "query",
        args: ["MyAsset"]
    };
    console.log("query: querying %j",req);
    var tx = user.query(req);
    tx.on('complete', function (results) {
       var realOwner = results.result;
       //console.log("realOwner: " + realOwner);

       if (ownerAccount == results.result) {
          console.log("correct owner: %s",ownerAccount);
          return cb();
       } else {
          return cb(new Error(util.format("incorrect owner: expected=%s, real=%s",ownerAccount,realOwner)));
       }
    });
    tx.on('error', function (err) {
        console.log("assign invoke error: %j", err);
        return cb(err);
    });
}

function build_assignment(f, to, from) {
    console.log("to", to);
    var assign = function (users, cb) {
        users[to.user].getUserCert(to.attributeList, function (err, cert) {
            if (err) console.log("Failed getting Application certificate.");
            checkCertExtensions(cert, to.attributeValues, function(err) {
                if(err){
                    cb(err);
                }
            });
            f(users[from.user], cert.encode().toString('base64'), function(err) {
                if (err) {
                    console.log("error: "+err.toString());
                    cb(err);
                } else {
                    checkOwner(users[from.user], to.account, function(err) {
                        if(err){
                            console.log("error: "+err.toString());
                            cb(err);
                        } else {
                            console.log("assign flow complete");
                            cb();
                        }
                    });
                }
            });
        })
    };
    return assign;
}

function pick(args) {

    var mode = args[2];
    switch (mode) {
        case "deploy": 
            return deploy;
        case "assign": 
            var username = args[3];
            var info = accountInformation[username];
            return build_assignment(
                assignOwner,
                {
                    user: username,
                    attributeList: info.attributeList,
                    attributeValues: info.attributeValueList,
                    account: info.account,
                }, 
                {
                    user: "assigner",
                });
        case "transfer": 
            var username = args[3];
            var info = accountInformation[username];
            return build_assignment(
                transferOwner,
                {
                    user: username,
                    attributeList: info.attributeList,
                    attributeValues: info.attributeValueList,
                    account: info.account,
                }, 
                {
                    user: args[4],
                });
    }
}

if (require.main === module) {


    // run
    setup(
        pick(process.argv),
        function(err) {
            if (err) {
                console.log("error: "+err.toString());
                // Exit the test script after a failure
                process.exit(1);
            } else {
                console.log(process.argv, "done");
            }
        }
    );


}

