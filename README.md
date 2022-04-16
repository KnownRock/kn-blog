# Kn blog
> A personal blog framework based on s3 backend.

## Features
- built-in file manager
- wysiwyg article editor
- generate markdown file (working on)
- apps managment (working on)
- i18n support (en & cn)

## Start
```shell
npm install
```
Edit .env file to your own s3 service (minio) for public user.
```
VITE_APP_TITLE=MY_SPACE

VITE_APP_S3_ENDPOINT=127.0.0.1
VITE_APP_S3_PORT=9000
VITE_APP_S3_BUCKET=public
VITE_APP_S3_ACCESS_KEY=aaaaaaaa
VITE_APP_S3_SECRET_KEY=aaaaaaaa
VITE_APP_S3_USE_SSL=false
```

## Screenshots

### Blog home
![image](https://user-images.githubusercontent.com/58989910/163675138-df6161db-4536-4598-8713-c9e5710fdc81.png)

### Blog page
![image](https://user-images.githubusercontent.com/58989910/163675143-d0a4179f-323e-42c4-a532-05f1d88be9db.png)

### Editor interface
![image](https://user-images.githubusercontent.com/58989910/163675172-8ec157cf-ecfe-4efb-b402-4151d3b75630.png)

### File system
![image](https://user-images.githubusercontent.com/58989910/163674765-dd3dcbef-dfd1-4d05-9fae-5cbf2ce70c5a.png)
