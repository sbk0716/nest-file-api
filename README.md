# File Upload

A simple example of file upload

## Execution

```sh
% yarn start
# in another terminal
% curl http://localhost:3000/api/s3/upload-file -F 'uploadfile=@./sample.png'
```