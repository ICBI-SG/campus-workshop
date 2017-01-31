# -*- mode: ruby -*-
# vi: set ft=ruby :

# This vagrantfile creates a VM with the development environment
# configured and ready to go.
#
# The setup script (env var $script) in this file installs docker.
# This is not in the setup.sh file because the docker install needs
# to be secure when running on a real linux machine.
# The docker environment that is installed by this script is not secure,
# it depends on the host being secure.
#
# At the end of the setup script in this file, a call is made
# to run setup.sh to create the developer environment.

# This is the mount point for the sync_folders of the source
# SRCMOUNT = "/hyperledger"
# LOCALDEV = "/local-dev"
# 
$script = <<SCRIPT
set -x
bash /vagrant/script.sh
SCRIPT

Vagrant.configure('2') do |config|
  config.vm.box = "ubuntu/trusty64"
  config.vm.provision "shell", inline: $script
  #config.vm.box_version = "1.1.0"
end
