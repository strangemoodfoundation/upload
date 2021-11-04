## About

An extremely simple web app that handles uploading files of any type to an s3 compatible server. Currently implemented for Backblaze. It's the cheapest for large file storage.

## Running

This is a monorepo with backend in express and frontend in react typescript.

Frontend will run on port 3000.
`cd frontend && npm start`

Backend will run on port 8080.
`cd backend && npm start`

## First Time Setup

1. Create account on [Backblaze](https://www.backblaze.com/)
2. [Create an Application](https://secure.backblaze.com/app_keys.htm) and copy the keyID and secret (or copy from existing application). Add these in `backend/.env` as `aws_access_key_id` and `aws_secret_access_key`
3. Pick a name for your bucket, also add it to `backend/.env` and replace it in the code below.
4. Run the code below.

```
sudo pip3 install --upgrade b2
b2 create-bucket
b2 create-bucket --corsRules '[
{
       "corsRuleName": "downloadFromAnyOriginWithUpload",
        "allowedOrigins": [
            "*"
        ],
        "allowedHeaders": [
            "*"
        ],
        "allowedOperations": [
            "s3_delete",
            "s3_get",
            "s3_head",
            "s3_post",
            "s3_put",
            "b2_download_file_by_id",
            "b2_download_file_by_name",
            "b2_upload_file",
            "b2_upload_part"
        ],
        "maxAgeSeconds": 3600
    }
]' YOUR-BUCKET-NAME-HERE allPublic
```

## Debugging

If you run into CORS issues, you likely created the bucket without the proper cors rules. You can update these with the CLI easily:

```
b2 update-bucket --corsRules
// etc.
```

There is currently no way of configuring specific CORS rules in the console.
