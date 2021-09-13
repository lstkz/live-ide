import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';
import { config } from 'config';

function createBucketCDN() {
  const cfIdentity = new aws.cloudfront.OriginAccessIdentity(
    'CloudFrontOriginAccessIdentity'
  );
  const mainBucket = new aws.s3.Bucket('pd-main-bucket', {
    corsRules: [
      {
        allowedOrigins: ['*'],
        allowedMethods: ['POST', 'GET', 'PUT', 'DELETE', 'HEAD'],
        allowedHeaders: ['*'],
      },
    ],
  });
  const s3Policy = pulumi
    .all([cfIdentity.iamArn, mainBucket.arn])
    .apply(([iamArn, bucketArn]) =>
      aws.iam
        .getPolicyDocument({
          statements: [
            {
              effect: 'Allow',
              actions: ['s3:GetObject*', 's3:GetBucket*', 's3:List*'],
              resources: [bucketArn, bucketArn + '/*'],
              principals: [
                {
                  type: 'AWS',
                  identifiers: [iamArn],
                },
              ],
            },
          ],
        })
        .then(x => x.json)
    );
  new aws.s3.BucketPolicy('bucketPolicy', {
    bucket: mainBucket.id,
    policy: s3Policy,
  });

  const distribution = new aws.cloudfront.Distribution('pd-cdn', {
    enabled: true,
    origins: [
      {
        originPath: '/cdn',
        domainName: mainBucket.bucketRegionalDomainName,
        originId: mainBucket.arn,
        s3OriginConfig: {
          originAccessIdentity: cfIdentity.cloudfrontAccessIdentityPath,
        },
      },
    ],
    restrictions: {
      geoRestriction: {
        restrictionType: 'none',
      },
    },
    priceClass: 'PriceClass_100',
    httpVersion: 'http2',
    isIpv6Enabled: true,
    defaultCacheBehavior: {
      allowedMethods: ['GET', 'HEAD', 'OPTIONS'],
      cachedMethods: ['GET', 'HEAD', 'OPTIONS'],
      viewerProtocolPolicy: 'redirect-to-https',
      targetOriginId: mainBucket.arn,
      forwardedValues: {
        queryString: false,
        headers: [
          'Origin',
          'Access-Control-Request-Headers',
          'Access-Control-Request-Method',
        ],
        cookies: {
          forward: 'none',
        },
      },
      compress: true,
    },
    orderedCacheBehaviors: [],
    viewerCertificate: {
      acmCertificateArn: config.deploy.cdn.certArn,
      minimumProtocolVersion: 'TLSv1.2_2019',
      sslSupportMethod: 'sni-only',
    },
    aliases: [config.deploy.cdn.domainName],
  });
  new aws.route53.Record('cdn-record', {
    zoneId: config.deploy.zone.hostedZoneId,
    name: config.deploy.cdn.domainName,
    type: 'A',
    aliases: [
      {
        name: distribution.domainName,
        zoneId: distribution.hostedZoneId,
        evaluateTargetHealth: true,
      },
    ],
  });

  const iframeDistribution = new aws.cloudfront.Distribution('pd-iframe', {
    enabled: true,
    defaultRootObject: 'index.html',
    origins: [
      {
        originPath: '/iframe',
        domainName: mainBucket.bucketRegionalDomainName,
        originId: mainBucket.arn,
        s3OriginConfig: {
          originAccessIdentity: cfIdentity.cloudfrontAccessIdentityPath,
        },
      },
    ],
    customErrorResponses: [
      {
        errorCode: 404,
        errorCachingMinTtl: 1,
        responsePagePath: '/index.html',
        responseCode: 200,
      },
    ],
    restrictions: {
      geoRestriction: {
        restrictionType: 'none',
      },
    },
    priceClass: 'PriceClass_100',
    httpVersion: 'http2',
    isIpv6Enabled: true,
    defaultCacheBehavior: {
      allowedMethods: ['GET', 'HEAD', 'OPTIONS'],
      cachedMethods: ['GET', 'HEAD', 'OPTIONS'],
      viewerProtocolPolicy: 'redirect-to-https',
      targetOriginId: mainBucket.arn,
      forwardedValues: {
        queryString: false,
        headers: [
          'Origin',
          'Access-Control-Request-Headers',
          'Access-Control-Request-Method',
        ],
        cookies: {
          forward: 'none',
        },
      },
      compress: true,
    },
    orderedCacheBehaviors: [],
    viewerCertificate: {
      acmCertificateArn: config.deploy.iframe.certArn,
      minimumProtocolVersion: 'TLSv1.2_2019',
      sslSupportMethod: 'sni-only',
    },
    aliases: [config.deploy.iframe.domainName],
  });
  new aws.route53.Record('iframe-record', {
    zoneId: config.deploy.zone.hostedZoneId,
    name: config.deploy.iframe.domainName,
    type: 'A',
    aliases: [
      {
        name: iframeDistribution.domainName,
        zoneId: iframeDistribution.hostedZoneId,
        evaluateTargetHealth: true,
      },
    ],
  });

  return { mainBucket, distribution };
}

function createBucketRole(mainBucket: aws.s3.Bucket) {
  const role = new aws.iam.Role('bucket-role', {
    assumeRolePolicy: {
      Version: '2012-10-17',
      Statement: aws.getCallerIdentity({}).then(x => [
        {
          Principal: {
            AWS: `arn:aws:iam::${x.accountId}:root`,
          },
          Action: 'sts:AssumeRole',
          Effect: 'Allow',
        },
      ]),
    },
    inlinePolicies: [
      {
        name: 'p1',
        policy: mainBucket.arn.apply(arn =>
          JSON.stringify({
            Version: '2012-10-17',
            Statement: [
              {
                Resource: [arn, arn + '/*'],
                Action: ['s3:*'],
                Effect: 'Allow',
              },
            ],
          })
        ),
      },
    ],
  });
  return role.arn;
}

const { distribution, mainBucket } = createBucketCDN();
export const bucketRoleArn = createBucketRole(mainBucket);

export const bucketName = mainBucket.bucket;
export const cdnDomain = distribution.domainName;
