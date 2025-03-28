These project specific Caddyfiles should be imported in the global Caddyfile. See examples below.

`Caddyfile-main` is the only necessary configuration file. The others can be used to  enhance the website configuration.

```shell
sudo emacs /etc/caddy/Caddyfile
```

```shell

# we should explicitely give the values for the import directive in the global Caddyfile
# (/etc/caddy/Caddyfile), that is, they must be hardcoded in that file; 
# however those values should always be in sync with the respective env.sh file
# for the project (which is $PROJECT_HOME_DIR/config/env.sh)  

# address of the site block: the-domain.local <-> $PROJECT_HOSTNAME 
the-domain.local {

    # args[0] <-> $PROJECT_HOME_DIR ("/path/to/project-home-dir")
    # args[1] <-> $WEBAPP_PORT ("5000")
    # args[2] <-> $API_PORT ("5001")

    # v2.8 - import with arguments
    #import "/path/to/project-home-dir/config/caddy/Caddyfile-main" "/path/to/project-home-dir" "5000" "5001"
    
    # v2.9 - import with a block (https://github.com/caddyserver/caddy/pull/6130)
    import "/path/to/project-home-dir/config/caddy/Caddyfile-main" {
		PROJECT_HOME_DIR "/path/to/project-home-dir"
		WEBAPP_PORT 5000
		API_PORT 5001
    }
    
    # the lines below are relative to 2.8
    
    # args[0] <-> $PROJECT_HOSTNAME ("the-domain.local")
    # import "/path/to/project-home-dir/config/caddy/Caddyfile-log" "the-domain.local"
    
    # args[0] <-> $PROJECT_HOME_DIR ("/path/to/project-home-dir")
    # import "/path/to/project-home-dir/config/caddy/Caddyfile-dev" "/path/to/project-home-dir"
    
    # args[0] <-> $WEBAPP_PORT ("5000")
    # import "/path/to/project-home-dir/config/caddy/Caddyfile-vite" "5000"
    
    # args[0] <-> $PROJECT_HOME_DIR ("/path/to/project-home-dir")
    # import "/path/to/project-home-dir/config/caddy/Caddyfile-static-webapp" "/path/to/project-home-dir"
}
```

When any Caddyfile is modified, the caddy service must be reloaded:

```shell
sudo systemctl reload caddy
```

We can manually start caddy. It can be useful to find some problems using the console output:

```shell
sudo systemctl stop caddy

# immediatelly start caddy manually, to avoid having the other websites down
sudo /usr/bin/caddy run  \
--watch  \
--environ  \
--config /etc/caddy/Caddyfile

sudo systemctl restart caddy
```


For local development: add `the-domain.local` to `/etc/hosts`:

```bash
sudo emacs /etc/hosts
```

Append a line like this:
```shell
127.0.0.1 the-domain.local
```

At this point we should have the webapp working on https://${PROJECT_HOSTNAME}.