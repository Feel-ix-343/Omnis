if [$1 == ""]
then
    echo "Please provide a version number"
    exit 1
fi
docker run -it --rm us-east1-docker.pkg.dev/oauth-test-376204/omnis-algo/omnis-algo:$1
