#!/bin/zsh
cd -- "${0:A:h}"
if ! command -v node >/dev/null 2>&1; then
  if [[ -x "$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node" ]]; then
    export PATH="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH"
  else
    print 'Install Node.js LTS from https://nodejs.org and open this file again.'
    read 'reply?Press Return to close.'
    exit 1
  fi
fi
if [[ ! -d node_modules ]]; then
  print 'Dependencies are missing. Open this folder in Terminal and run npm ci first.'
  read 'reply?Press Return to close.'
  exit 1
fi
print 'Campus Survival — keep this window open while recording.'
print 'Open the Local address shown below in your browser.'
node scripts/run-framework.mjs dev --hostname 127.0.0.1 --port 5173
read 'reply?Press Return to close.'
