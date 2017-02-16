# Campus hyperledger/fabric workshop

This is repository for the workshop materials for Campus hyperledger fabric workshop. Please follow the steps below to pre-install some files before the workshop. 

**Please do this before the workshop as it can take some time to install and requires a good internet connection

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
****You are now ready for the workshop!****
