## Overview

Going to show a classical asset management example. 

### Personnas

- `deployer`: 
	a privileged user that has rights to deploy a chaincode and assign an asset to a user.
- `assigner`: 
	a privileged user that has rights to assign an asset to a user.
- `alice`:
  	a client user that only can assign asset if she owns it
- `bob`:
  	a client user that only can assign asset if he owns it

### Flows

1. `deployer` provides the asset to `assigner` 
  	- during chaincode initialization
2. `assigner` gives the asset to `alice`
  	- blockchain invocation call to give asset
  	- blockchain query call to verify asset has been transferred
3.  `assigner` tries to give same asset to `bob`
   	- fails because `assigner` no longer has the asset
4. `alice` gives the asset to `bob`
    - blockchain invocation call to give asset
  	- blockchain query call to verify asset has been transferred

## Step-by-Step Walkthrough

### Step 1

First deploy the chaincode. First, open a new shell (Git Bash or other). Next, we have to move the chaincode to
the appropriate place (with the `$GOPATH`=`/go`)
```
vagrant$ cp -r /home/vagrant/asset_management_02/chaincode /go/src/github.com/asset_management_with_roles
```

Next we run `deploy` in the application folder. What this does is the privileged user `deployer` issues the **deploy command** to the blockchain. And the `deployer` will give the rights of assigning the asset to the privileged user `assigner`.
```
vagrant$ cd /home/vagrant/asset_management_02
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

### Step 2
Next we call `assign` to assign the asset to client `alice`. We have to tell the blockchain the chaincode id. 

```
vagrant$ CHAINCODE_ID=<chaincodeid> node example.js assign alice

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
```

here alice (whose account is 12345-56789) has been assigned the asset.
You can inspect the chaincode logs also by typing 

```
vagrant$ docker logs -f dev-vp0-<chaincodeID>
```

### Step 3

Now `alice` owns the document. The `assigner` does not have the asset anymore. Lets see what happens if we try to have the `assigner` assign the asset to a different client user `bob`.


```
vagrant$ CHAINCODE_ID=<chaincodeid> node example.js assign bob

## this will show in the blockchain logs
...
vp0_1         | 12:38:37.422 [chaincode] processStream -> ERRO 8da Got error: Asset was already assigned.
...
```

In the command line logs you should also see that the asset never left `alice`'s account (her account number is `12345-56789`.

```
...
assign transaction ID: {"uuid":"1a6d5d46-6c80-4b5d-8774-8231581c7652"}
assign invoke complete: {"result":"Tx 1a6d5d46-6c80-4b5d-8774-8231581c7652 complete"}
query: querying {"chaincodeID":"71b792867982c304f85fb3d11165e8a4059e35e8c6eb2168b2de310bb520a7f9","fcn":"query","args":["MyAsset"]}
correct owner: 12345-56789
```

### Step 4

Now `alice` owns the asset. She can transfer it to whoever she wants. Lets have her transfer to `bob`.
```
## this means 'transfer to bob from alice;
vagrant$ CHAINCODE_ID=<chaincodeid> node example.js transfer bob alice
```

This will show in the logs, verifying that now `bob` has the asset (his account is `23456-67890`)
```
...
assign transaction ID: {"uuid":"1a6d5d46-6c80-4b5d-8774-8231581c7652"}
assign invoke complete: {"result":"Tx 1a6d5d46-6c80-4b5d-8774-8231581c7652 complete"}
query: querying {"chaincodeID":"71b792867982c304f85fb3d11165e8a4059e35e8c6eb2168b2de310bb520a7f9","fcn":"query","args":["MyAsset"]}
correct owner: 23456-67890
```

## Troubleshooting

-   "no rows in sql"

try to delete the contents of the folder `/tmp/keyValStore`
```
rm -f /tmp/keyValStore
```

