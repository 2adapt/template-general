For these big static assets we pre-compute the respective "precompressed sidecar" assets. 

In caddy this is enabled with the "precompressed" directive in the file_server directive: https://caddyserver.com/docs/caddyfile/directives/file_server.

Verify:

https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Encoding

"The Accept-Encoding request HTTP header indicates the content encoding (usually a compression algorithm) that the client can understand. 
The server uses content negotiation to select one of the proposals and informs the client of that choice with the Content-Encoding response header."


Steps to create new sidecar files:

```shell
# download a big javascript file

curl --remote-name https://cdn.plot.ly/plotly-2.31.1.js
ORIGINAL_ASSET="plotly-2.31.1.js"

# sidebar with brotli

cp ${ORIGINAL_ASSET} ${ORIGINAL_ASSET}.br.temp
printf "\n\nconsole.log('compressed with: BROTLI');" >> ${ORIGINAL_ASSET}.br.temp
tail --lines=5 ${ORIGINAL_ASSET}.br.temp
time brotli ${ORIGINAL_ASSET}.br.temp --output=${ORIGINAL_ASSET}.br --force --quality=6 --verbose

# sidebar with gzip

cp ${ORIGINAL_ASSET} ${ORIGINAL_ASSET}.gz.temp
printf "\n\nconsole.log('compressed with: GZIP');" >> ${ORIGINAL_ASSET}.gz.temp
tail --lines=5 ${ORIGINAL_ASSET}.gz.temp
time gzip ${ORIGINAL_ASSET}.gz.temp --verbose --keep --stdout > ${ORIGINAL_ASSET}.gz

# sidebar with zstd

cp ${ORIGINAL_ASSET} ${ORIGINAL_ASSET}.zst.temp
printf "\n\nconsole.log('compressed with: ZSTD');" >> ${ORIGINAL_ASSET}.zst.temp
tail --lines=5 ${ORIGINAL_ASSET}.zst.temp
time zstd ${ORIGINAL_ASSET}.zst.temp -10 --verbose --force -o ${ORIGINAL_ASSET}.zst

# no compression

printf "\n\nconsole.log('compressed with: NONE');" >> ${ORIGINAL_ASSET}
tail --lines=5 ${ORIGINAL_ASSET}

# remove temp files

rm *.temp

# verify; the 

mkdir temp_dir
cd temp_dir

# the sizes of the file downloaded with curl should match with the ones created above

ls -l ../${ORIGINAL_ASSET}*

curl --insecure --remote-name --header "accept-encoding:identity" https://the-domain.local/static-webapp/${ORIGINAL_ASSET}
ls -l ${ORIGINAL_ASSET}

curl --insecure --remote-name --header "accept-encoding:br" https://the-domain.local/static-webapp/${ORIGINAL_ASSET}
ls -l ${ORIGINAL_ASSET}

curl --insecure --remote-name --header "accept-encoding:zstd" https://the-domain.local/static-webapp/${ORIGINAL_ASSET}
ls -l ${ORIGINAL_ASSET}

curl --insecure --remote-name --header "accept-encoding:gzip" https://the-domain.local/static-webapp/${ORIGINAL_ASSET}
ls -l ${ORIGINAL_ASSET}

curl --insecure --remote-name --header "accept-encoding:br,zstd,gzip" https://the-domain.local/static-webapp/${ORIGINAL_ASSET}
ls -l ${ORIGINAL_ASSET}

```
