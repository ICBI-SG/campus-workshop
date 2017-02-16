Now we are ready to deploy the chaincode. First, open a new shell (Git Bash or other). Next, we have to move the chaincode to
the appropriate place (with the `$GOPATH`=`/go`)
```
vagrant$ cp -r /home/vagrant/asset_management_02/chaincode /go/src/github.com/asset_management_with_roles
```

Next we run deploy in the application folder
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
