#!/usr/bin/env bash

set -euo pipefail

src_repo=https://github.com/ttab/elephant-api.git
checkout=$(mktemp -d -t ele-api-XXX)
node_modules=$(mktemp -d -t ele-npm-XXX)
tag=${1:-}

function cleanup {
  rm -rf $checkout
  rm -rf $node_modules
}

trap cleanup EXIT

cd "$(dirname "$0")/.."

if [ -z "$tag" ]; then
    git clone $src_repo $checkout

    # Get the latest tag
    tag=$(git -C $checkout describe --tags --abbrev=0)

    git -C $checkout checkout $tag >/dev/null 2>&1
else
    git clone --depth 1 --branch $tag $src_repo $checkout
fi

# The package version tracks the proto repo tag it was generated from.
if [ "$(node -p "require('./package.json').version")" = "${tag#v}" ]; then
    echo "Already generated from $tag, no code generation is necessary"
    exit 0
fi

services=()

# Discover services and copy protobuf sources.
for proto in $(ls $checkout/*/*.proto); do
    dir=$(dirname $proto)
    dirname=$(basename $dir)
    name=$(basename $proto)

    if [ "$name" = "service.proto" ]; then
        services+=($dirname)
    fi

    dst=proto/$dirname

    mkdir -p $dst
    cp $proto $dst
done

# Build the docker image, just temporary, should live in a separate repo.
docker buildx build \
       -t node-protobuf --load \
       --build-arg="protoc_version=31.1-r1" ./src

docker run --rm \
       -v "$(pwd):/usr/src" \
       -v "${node_modules}:/usr/src/node_modules" \
       -u "$(id -u):$(id -u)" \
       -w "/usr/src" \
       node-protobuf sh -c "npx --yes pnpm@11 install --ignore-scripts --ignore-workspace --no-lockfile --store-dir /tmp/pnpm-store"

# Generate clients
for service in ${services[@]}; do
    docker run --rm \
           -v "$(pwd):/usr/src" \
           -v "${node_modules}:/usr/src/node_modules" \
           -u "$(id -u):$(id -u)" \
           -w "/usr/src" \
           node-protobuf protoc \
           --ts_out src/ \
           --ts_opt generate_dependencies \
           --ts_opt ts_nocheck \
           --ts_opt eslint_disable \
           --proto_path /usr/src/proto \
           $service/service.proto

    if [ ! -f src/$service/index.ts ]; then
        tee src/$service/index.ts <<'EOF' >/dev/null
export * from './service.client.ts'
export * from './service.ts'
EOF
    fi
done

pnpm run build

echo Updated to $tag
echo "Finish up and record the release with: pnpm change"
