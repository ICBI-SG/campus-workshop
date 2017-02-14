# Campus hyperledger/fabric workshop

This is repository for the workshop materials for Campus hyperledger fabric workshop

## Pre-requisites

Download `Virtualbox` from [here](https://www.virtualbox.org/wiki/Downloads) for the
specific operating system you are using.

Download `Vagrant` from [here](https://www.vagrantup.com/downloads.html) for the
specific operating system you are using.

Download `Git` from [here](https://git-scm.com/downloads) for the
specific operating system you are using. This also installs "Git Bash"

The first step is to pull this code to your local machine. Clone this `git` repository by opening "Git Bash" (or going to your favourite shell) and typing the following:
```
$ git clone https://github.com/ICBI-SG/campus-workshop.git
```

Then move into the cloned directory and bring up the `Vagrant` machine.
```
$ cd campus-workshop
$ vagrant up
```
This takes around 10~15 minutes (speed depends on your internet connection) to download an `Ubuntu` image and
`hyperledger/fabric` software for the workshop.

Then login into the machine
```
$ vagrant ssh
```

This is your virtual machine setup with the necessary code to participate in the
workshop.

The `hyperledger/fabric` code is can be found in the following path
```
vagrant$ ls /go/src/github.com/hyperledger/fabric

# prints out
#  bddtests   devenv  examples  images    membersrvc  peer       pub        sdk   TravisCI_Readme.md
#  consensus  docs    flogging  LICENSE   metadata    proposals  README.md   settings.gradle  vendor
#  core       events  gotools   Makefile  mkdocs.yml  protos     scripts    tools
```

## node 

The example code is installed in the following path of `vagrant`

```
vagrant$ ls /vagrant
# prints
#   docker-compose.yml  failure-motd.in  README.md  script.sh  Vagrantfile asset_management_02
```
We first move the code to a local folder `/home/vagrant`
```
vagrant$ mv /vagrant/asset_management_02 /home/vagrant
```

Then we go in and build the `nodejs` code
```
vagrant$ cd /home/vagrant/asset_management_02
vagrant$ npm install
```
This will take about a minute or so. Next we deploy the blockchain. For purposes
of this tutorial, we will just deploy a *single blockchain node along with a
membersrvc node* to make it easier to debug. A deployment of a full network can
be attempted later. To deploy do:
```
vagrant$ cd /vagrant
vagrant$ docker-compose up
```

Now we are ready to deploy the chaincode. First we have to move the chaincode to
the appropriate place (with the `$GOPATH`=`/go`)
```
vagrant$ cp -r /home/vagrant/asset_management_02/chaincode /go/src/github.com/asset_management_with_roles
```

Next we run deploy in the application folder
```
vagrant$ cd /vagrant
vagrant$ node example.js deploy

## prints out

# deployMode      :net
# keyStore        :/tmp/keyValStore
# caCert          :tlsca.cert
# caAddr          :localhost:7054
# peerAddr0       :localhost:7051
# tlsOn           :false
# deployWait      :20
# invokeWait      :5
# ciphers
# :ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-SHA256:ECDHE-ECDSA-AES256-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384
# hostOverride    :
# initializing ...
# Setting membersrvc address to grpc://localhost:7054
# Setting peer address to grpc://localhost:7051
# $SDK_DEPLOY_MODE: net
# enrolling WebAppAdmin...
# enrolling assigner...
# enrolling alice...
# enrolling bob...
# deploying with the role name 'assigner' in metadata ...
# deploy submitted:
# {"uuid":"7a3f0f826fa4f73b2ffc7defd02795824b466ad63990790d935f89104bf22ff8","chaincodeID":"7a3f0f826fa4f73b2ffc7defd02795824b466ad63990790d935f89104bf22ff8"}
# deploy complete:
# {"uuid":"7a3f0f826fa4f73b2ffc7defd02795824b466ad63990790d935f89104bf22ff8","chaincodeID":"7a3f0f826fa4f73b2ffc7defd02795824b466ad63990790d935f89104bf22ff8"}
# chaincodeID:7a3f0f826fa4f73b2ffc7defd02795824b466ad63990790d935f89104bf22ff8
# setup successful
```

You can see the chaincode running as a seperate docker container. Take note of the chaincode ID (in the above example, the chaincodeID = 7a3f0f826fa4f73b2ffc7defd02795824b466ad63990790d935f89104bf22ff8.
``` 
vagrant$ docker ps 

## prints out
# dev-vp0-7a3f0f826fa4f73b2ffc7defd02795824b466ad63990790d935f89104bf22ff8
# this is the name of the chaincode docker container  note the chaincode id is found here "dev-vp0-<chaincodeid>"
```

Next we assign an asset to alice using the chaincode id. 

```
vagrant$ CHAINCODE_CODE=<chaincodeid> node example.js assign

## prints out 

# some similar stuff as before ... with now 
#  CN:  Transaction Certificate
#  extensions:
#     ---> keyUsage : Digital Signature
#     ---> basicConstraints : CA:FALSE
#     ---> subjectKeyIdentifier : 01:02:03:04
#     ---> authorityKeyIdentifier : keyid:01:02:03:04
#     ---> 1.2.3.4.5.6.10 : client
#     ---> 1.2.3.4.5.6.11 : 12345-56789
#     ---> 1.2.3.4.5.6.7 : .,)M...5.M.q..J..V.p.M.P..#.b./.n..........hKk.D.#.2.{._l.......
#     ---> 1.2.3.4.5.6.8 : .....U...j...<....S..;.I.m......w....1...*U..k..
#     ---> 1.2.3.4.5.6.9 : 00HEADrole->1#account->2#
#  assign: invoking {"fcn":"assign","args":["MyAsset","MIICeDCCAh2gAwIBAgIQHD4J7Lg2SuuB0TE8wzc3gDAKBggqhkjOPQQDAzAkMQkwBwYDVQQGEwAxCTAHBgNVBAoTADEMMAoGA1UEAxMDdGNhMB4XDTE3MDIwOTE2MjAwMFoXDTE3MDUxMDE2MjAwMFowODEJMAcGA1UEBhMAMQkwBwYDVQQKEwAxIDAeBgNVBAMTF1RyYW5zYWN0aW9uIENlcnRpZmljYXRlMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEGNiloaqsqfCWU867SWb25WKIgYivpYi7o1J60wblH+SVBzky4mepI3p6LLNv3bJAdtcqwZ+M2olqV50521nzmqOCARswggEXMA4GA1UdDwEB/wQEAwIHgDAMBgNVHRMBAf8EAjAAMA0GA1UdDgQGBAQBAgMEMA8GA1UdIwQIMAaABAECAwQwEAYGKgMEBQYKBAZjbGllbnQwFQYGKgMEBQYLBAsxMjM0NS01Njc4OTBNBgYqAwQFBgcBAf8EQLwsKU0UEZU1z02ycRiYSqoeVoRwkU0fUIj+I/Ziii+pbgHvw/HvwIsGFcJoS2sARPsj1DIDexpfbLkYD+QOn74wOgYGKgMEBQYIBDC5Aq6GulWO17hqkKcFPNSK3/hT4vI7/UkIbZPuGIrj5XfGji4cMcykfypV0PtrkxswIwYGKgMEBQYJBBkwMEhFQURyb2xlLT4xI2FjY291bnQtPjIjMAoGCCqGSM49BAMDA0kAMEYCIQCNH80r1kKg3RJi4SJXt0wiKHsRL4V1JkZT8iDL7x815AIhAOaBDktGRI89zHpQsR6xzZFQN7txWEMKKmUmeDY1j4wy"],"attrs":["role","account"]}
assign transaction ID: {"uuid":"65033782-02f0-4f40-9d48-e8ab456e5ecd"}
assign invoke complete: {"result":"Tx 65033782-02f0-4f40-9d48-e8ab456e5ecd
complete"}
query: querying
{"chaincodeID":"71b792867982c304f85fb3d11165e8a4059e35e8c6eb2168b2de310bb520a7f9","fcn":"query","args":["MyAsset"]}
correct owner: 12345-56789
assign successful
assign successful
```

here alice (whose account is 12345-56789) has been assigned the asset.
You can inspect the chaincode logs also by typing 

```
vagrant$ docker logs -f dev-vp0-<chaincodeID>
```

## Blockchain explorer

## Troubleshooing

-   "no rows in sql"

try to delete the contents of the folder `/tmp/keyValStore`
```
rm -f /tmp/keyValStore
```

TODO

