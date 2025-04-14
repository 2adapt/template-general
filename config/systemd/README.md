Reference: ...

### Configuration for the `projectname-webapp` service

Create the configuration file:

```bash
mkdir -p ./config/systemd
emacs ./config/systemd/projectname-webapp.service
```

Copy-paste:

```bash
# (check the contents of the existing file in this template)
```

Reload and activate the `projectname-webapp` service. These must be done by a usersuper

```bash

# make sure this path doesn't have a slash at the end
export PROJECT_ROOT_DIR="/path/to/project-root-dir"


# verify that the service files exist and that the contents are correct
sudo ls -l "${PROJECT_ROOT_DIR}/config/systemd/projectname-webapp.service"
sudo cat "${PROJECT_ROOT_DIR}/config/systemd/projectname-webapp.service"

# verify that there is no file/symlink already in /etc/systemd/system;
ls -l "/etc/systemd/system/projectname-webapp.service"

# create the symlink in /etc/systemd/system;
sudo ln --symbolic \
"${PROJECT_ROOT_DIR}/config/systemd/projectname-webapp.service" \
"/etc/systemd/system/projectname-webapp.service"

# the most recent file should be our symlink
ls -ltra /etc/systemd/system
cat "/etc/systemd/system/projectname-webapp.service"

# reload the systemd manager configuration; this automatically create symlinks 
# in /etc/systemd/system/multi-user.target.wants (because we have
# "WantedBy=multi-user.target" in the "[Install]" section)

sudo systemctl daemon-reload
sudo systemctl enable "projectname-webapp.service"
sudo systemctl start "projectname-webapp.service"
```

Other commands to interact with the `projectname-webapp` service:

```bash
sudo systemctl status "projectname-webapp.service"
sudo systemctl restart "projectname-webapp.service"
sudo systemctl start "projectname-webapp.service"
sudo systemctl stop "projectname-webapp.service"
sudo systemctl disable "projectname-webapp.service"
```

Active process monitoring (live)

```shell
journalctl --unit "projectname-webapp.service" --follow
```

Check logs

```shell
journalctl --unit "projectname-webapp.service" --lines 500
```


### Updates to the service file (same file.service)

```shell
# edit the file
emacs "${PROJECT_ROOT_DIR}/config/systemd/projectname-webapp.service"

# Validate
sudo systemd-analyze verify /etc/systemd/system/projectname-webapp.service

# reload the systemd manager configuration and restart the service
sudo systemctl daemon-reload
sudo systemctl restart "projectname-webapp.service"
sudo systemctl status "projectname-webapp.service"
```

### Remove the service

```shell
# this might be necessary if we rename the .service files
sudo systemctl stop "projectname-webapp.service"
sudo systemctl disable "projectname-webapp.service"
sudo systemctl daemon-reload
```


### Wrapper scripts for the `projectname-webapp` service

Create a wrapper shell script for the `systemctl status` subcommand:

```bash
touch ./config/systemd/projectname-webapp-status.sh
#chmod 750 ./config/systemd/projectname-webapp-status.sh
emacs ./config/systemd/projectname-webapp-status.sh
```

Copy-paste:

```shell
#!/bin/sh

systemctl status "projectname-webapp"
```

We can now see easily the status of the `projectname-webapp` service using the shell script in the project. It might be a convenient wrapper if the 
name of the service changes;

```bash
# this command must be added to the sudoers file; see below;
sudo ./config/systemd/projectname-webapp-status.sh
```

Repeat "projectname-webapp-*" for other systemd subcommands: `restart`, `stop`, etc.


### Wrapper scripts for all services

Same as the above, but for all services related to this project:

```bash
touch ./config/systemd/projectname-allunits-status.sh
#chmod 750 ./config/systemd/projectname-allunits-status.sh
emacs ./config/systemd/projectname-allunits-status.sh
```

Copy-paste:

```shell
#!/bin/sh

systemctl status "projectname-webapp"
systemctl status "projectname-api"
systemctl status "projectname-other"
```

We can now easily see the status of all services:

```bash
# this command must be added to the sudoers file; see below;
sudo ./config/systemd/projectname-allunits-status.sh
```

Repeat "projectname-allunits-*" for other systemd subcommands: `restart`, `stop`, etc.

### Repeat the service configuration for `projectname-api` (and other existing apps/services)

...

### Update the sudoers file with the necessary commands:

```shell
sudo visudo
```

```
# the full path must be given; but we can execute the shell wrapper script with a relative paths

the_non_admin_app_user ALL=(root) NOPASSWD: /path/to/project-root-dir/config/systemd/projectname-webapp-restart.sh
the_non_admin_app_user ALL=(root) NOPASSWD: /path/to/project-root-dir/config/systemd/projectname-webapp-status.sh
the_non_admin_app_user ALL=(root) NOPASSWD: /path/to/project-root-dir/config/systemd/projectname-webapp-stop.sh
the_non_admin_app_user ALL=(root) NOPASSWD: /path/to/project-root-dir/config/systemd/projectname-allunits-restart.sh
the_non_admin_app_user ALL=(root) NOPASSWD: /path/to/project-root-dir/config/systemd/projectname-allunits-status.sh
the_non_admin_app_user ALL=(root) NOPASSWD: /path/to/project-root-dir/config/systemd/projectname-allunits-stop.sh
```