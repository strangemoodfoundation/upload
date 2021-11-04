// Load the SDK and UUID
import AWS from 'aws-sdk';

if (
  !process.env.b2_bucket_name ||
  !process.env.aws_access_key_id ||
  !process.env.aws_secret_access_key
)
  throw new Error('b2 config is invalid.');

const BACKBLAZE_ENDPOINT = 's3.us-west-002.backblazeb2.com';
const SIGNED_URL_EXPIRY_SECONDS = 60;

// Create an S3 client
AWS.config.update({
  accessKeyId: process.env.aws_access_key_id || '',
  secretAccessKey: process.env.aws_secret_access_key || '',
  region: 'us-west-002',
  signatureVersion: 'v4',
});
const ep = new AWS.Endpoint(BACKBLAZE_ENDPOINT);
const s3 = new AWS.S3({ endpoint: ep });

enum SignedUrl {
  putObject = 'putObject',
}

export const getPresignedPutUrl = async (fileName: string, bucket?: string) => {
  const url = await s3.getSignedUrl(SignedUrl.putObject, {
    Bucket: bucket ?? (process.env.b2_bucket_name || ''),
    Key: fileName,
    Expires: SIGNED_URL_EXPIRY_SECONDS,
  });
  return url;
};

// ########################################################################################
// Scripts that are nice to have for the future

// Create a bucket and upload something into it
const sampleBucketName = 'node-sdk-sample-helena'; // 'helena-test-cors'; //
const sampleKeyName = 'hello_world.txt';

const createBucket = async (bucketName = sampleBucketName) => {
  return await s3.createBucket({ Bucket: bucketName }, (err, data) => {
    if (err) throw err;
    else return data.Location;
  });
};

/**
 * Usage:
 *
 * uploadTest('hello_world.txt', 'Hello Universe!')
 */
export const uploadTest = async (keyName: string, body: string) => {
  const bucketName = process.env.b2_bucket_name || '';
  const params = { Bucket: bucketName, Key: keyName, Body: body };
  console.log(params);
  return await s3.putObject(params, (err, data) => {
    if (err) {
      console.log('--------');
      console.log(err);
      throw err;
    } else
      console.log(
        'Successfully uploaded data to ' + bucketName + '/' + keyName
      );
    return;
  });
};

export const getBucketCors = async () => {
  console.log('getting cors!!!!!');
  const bucketName = process.env.b2_bucket_name || '';

  s3.getBucketCors({ Bucket: bucketName }, (err, data) => {
    console.log(data.CORSRules);
  });
};
