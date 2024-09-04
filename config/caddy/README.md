These project specific Caddyfiles should be imported in the global Caddyfile. See examples below.

`Caddyfile-main` is the only necessary configuration file. The others can be used to  enhance the website configuration.   

```shell
sudo emacs /etc/caddy/Caddyfile
```

```shell

the-domain.local {

    # args[0] = WEBAPP_PORT = "5000"
    # args[1] = API_PORT = "5001"
    # args[2] = PROJECT_BASE_DIR = "/path/to/project-base-dir"
    import /path/to/project-base-dir/config/caddy/Caddyfile-main "5000" "5001" "/path/to/project-base-dir"
    
    # args[0] = PROJECT_HOSTNAME = "the-domain.local"
    # import /path/to/project-base-dir/config/caddy/Caddyfile-log "the-domain.local"
    
    # args[0] = PROJECT_BASE_DIR = "/path/to/project-base-dir"
    # import /path/to/project-base-dir/config/caddy/Caddyfile-dev "/path/to/project-base-dir"
    
    # args[0] = WEBAPP_PORT = "5000"
    # import /path/to/project-base-dir/config/caddy/Caddyfile-vite "5000"
    
    # args[0] = PROJECT_BASE_DIR = "/path/to/project-base-dir"
    # import /path/to/project-base-dir/config/caddy/Caddyfile-static-webapp "/path/to/project-base-dir"
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
