Reference: ...

### Configuration for the `projectname-webapp` service

Create the configuration file:

```bash
mkdir -p config/systemd
emacs config/systemd/projectname-webapp.service
```

Copy-paste:

```bash
# (check the contents of the existing file in this template)
```

Reload and activate the `projectname-webapp` service:

```bash

# make sure that $PWD is $PROJECT_HOME_DIR
if [ $PWD = $PROJECT_HOME_DIR ]; then echo "ok!"; fi


# verify that the service files exist and that the contents are correct
ls -l "${PWD}/config/systemd/projectname-webapp.service"
cat "${PWD}/config/systemd/projectname-webapp.service"

# verify that there is no file/symlink already in /etc/systemd/system;
ls -l "/etc/systemd/system/projectname-webapp.service"

# create the symlink in /etc/systemd/system;
sudo ln -s \
"${PWD}/config/systemd/projectname-webapp.service" \
"/etc/systemd/system/projectname-webapp.service"

ls -l "/etc/systemd/system/projectname-webapp.service"
cat "/etc/systemd/system/projectname-webapp.service"

# reload the systemd manager configuration; this automatically create symlinks 
# in /etc/systemd/system/multi-user.target.wants (because we have
"WantedBy=multi-user.target" in the "[Install]" section)

sudo systemctl daemon-reload
sudo systemctl enable "projectname-webapp.service"
sudo systemctl start "projectname-webapp.service"
```

Other commands to interact with the `projectname-webapp` service:

```bash
sudo systemctl status "projectname-webapp.service"
journalctl --unit "projectname-webapp.service" --lines 500
sudo systemctl restart "projectname-webapp.service"
sudo systemctl start "projectname-webapp.service"
sudo systemctl stop "projectname-webapp.service"
sudo systemctl disable "projectname-webapp.service"
```

### Updates to the service file

```
# edit the file
emacs "${PWD}/config/systemd/projectname-webapp.service"

# Validate
sudo systemd-analyze verify /etc/systemd/system/app.service

# reload the systemd manager configuration and restart the service
sudo systemctl daemon-reload
sudo systemctl restart "projectname-webapp.service"
sudo systemctl status "projectname-webapp.service"
```

### Remove the service

```
# this might be necessary if we rename the .service files
sudo systemctl stop "projectname-webapp.service"
sudo systemctl disable "projectname-webapp.service"
sudo systemctl daemon-reload
```


### Wrapper scripts for the `projectname-webapp` service

Create a wrapper shell script for the `systemctl status` subcommand:

```bash
touch config/systemd/projectname-webapp-status.sh
chmod 755 config/systemd/projectname-webapp-status.sh
emacs config/systemd/projectname-webapp-status.sh
```

Copy-paste:

```
#!/bin/sh

sudo systemctl status "projectname-webapp"
```

We can now see easily the status of the `projectname-webapp` service using the shell script in the project. It might be a convenient wrapper if the 
name of the service changes;

```bash
sudo config/systemd/projectname-webapp-status.sh
```

If this wrapper script makes sense we can repeat for other systemd subcommands: `systemctl restart`, `systemctl stop`, etc.


### Wrapper scripts for all services

Similar to the above, but considering all services related to this project:

```bash
touch config/systemd/projectname-all-status.sh
chmod 755 config/systemd/projectname-all-status.sh
emacs config/systemd/projectname-all-status.sh
```

Copy-paste:

```
#!/bin/sh

sudo systemctl status "projectname-webapp"
sudo systemctl status "projectname-api"
sudo systemctl status "projectname-other"
```

We can now easily see the status of all services:

```bash
sudo config/systemd/projectname-all-status.sh
```

### Repeat the service configuration for `projectname-api` (and other existing apps/services)

...
