# File Upload

A simple example of file upload

## Execution

```sh
% yarn start
# in another terminal
% curl http://localhost:3000/file -F 'file=@./package.json' -F 'name=test'
% curl http://localhost:3000/file -F 'file=@./sample.png' -F 'name=test' --output test.png
```