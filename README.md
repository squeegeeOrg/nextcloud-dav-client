# Nextcloud WebDAV client

## Debugging

For debugging start the `debug with nodemon` launch config in VSCode It will
automatically start a nodemon watcher that watches the ts files and runs a node
server. But the node server will not be automatically destroyed, when the
debugging session is closed!

so you still have to run the command: Ctrl-Shift-P -> `Tasks: Terminate Task`

## Testing

For testing in VSCode start the `run all tests` or `Test current file` launch
config.

## Examples

Add `foreign id`  
`npm run build && node build/examples/custom-prop.js`

Add/remove tag `npm run build && node build/examples/tags.js`
