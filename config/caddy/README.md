These project specific Caddyfiles should be imported in the global Caddyfile. See examples below.

`Caddyfile-main` is the only necessary configuration file. The others can be used to  enhance the website configuration.

```shell
sudo emacs /etc/caddy/Caddyfile
```

```shell

# we should explicitely give the values for the import directive in the global Caddyfile
# (/etc/caddy/Caddyfile), that is, they must be hardcoded in that file; 
# however those values should always be in sync with the respective env.sh file
# for the project (which is $PROJECT_ROOT_DIR/config/env.sh)  

# address of the site block: the-domain.local <-> $PROJECT_HOSTNAME 
the-domain.local {

    # args[0] <-> $PROJECT_ROOT_DIR ("/path/to/project-root-dir")
    # args[1] <-> $WEBAPP_PORT ("5000")
    # args[2] <-> $API_PORT ("5001")

    # v2.8 - import Caddyfile-main with arguments
    #import "/path/to/project-root-dir/config/caddy/Caddyfile-main" "/path/to/project-root-dir" "5000" "5001"
    
    # v2.9 - import Caddyfile-main with a block (https://github.com/caddyserver/caddy/pull/6130)
    import "/path/to/project-root-dir/config/caddy/Caddyfile-main" {
		PROJECT_ROOT_DIR "/path/to/project-root-dir"
		WEBAPP_PORT 5000
		API_PORT 5001
    }
    >
    # import the auxiliary Caddyfiles (using arguments)
    
    # args[0] <-> $PROJECT_HOSTNAME ("the-domain.local")
    # import "/path/to/project-root-dir/config/caddy/Caddyfile-log" "the-domain.local"
    
    # args[0] <-> $PROJECT_ROOT_DIR ("/path/to/project-root-dir")
    # import "/path/to/project-root-dir/config/caddy/Caddyfile-dev" "/path/to/project-root-dir"
    
    # args[0] <-> $WEBAPP_PORT ("5000")
    # import "/path/to/project-root-dir/config/caddy/Caddyfile-vite" "5000"
    
    # args[0] <-> $PROJECT_ROOT_DIR ("/path/to/project-root-dir")
    # import "/path/to/project-root-dir/config/caddy/Caddyfile-static-webapp" "/path/to/project-root-dir"
}
```

When any Caddyfile is modified, the caddy service must be reloaded:

```shell
sudo systemctl reload caddy
```

We can manually start caddy. It can be useful to find some problems using the console output:

```shell
# stop the service
sudo systemctl stop caddy

# immediatelly start caddy manually, to avoid having the other websites down
sudo /usr/bin/caddy run  \
--config /etc/caddy/Caddyfile \
--watch  \
--environ

# later restart the service
sudo systemctl restart caddy
```


For local development: add `the-domain.local` to `/etc/hosts`:

```shell
sudo emacs /etc/hosts
```

Append a line like this:
```
127.0.0.1 the-domain.local
```

At this point we should have the webapp working on https://${PROJECT_HOSTNAME}.

Check that the "caddy" user can read local Caddyfiles:

```shell
# check if the caddy user can read files from the application directories
sudo -u caddy cat /opt/2adapt/app1/config/caddy/Caddyfile-main

# append the given group to the given user
sudo usermod --append --groups 2adapt caddy
sudo usermod --append --groups app1 caddy
```

