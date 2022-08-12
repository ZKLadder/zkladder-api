const secp256k1N = '0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141';

const keyPolicy = JSON.stringify({
  Id: 'key-consolepolicy-3',
  Version: '2012-10-17',
  Statement: [
    {
      Sid: 'Enable IAM User Permissions',
      Effect: 'Allow',
      Principal: {
        AWS: 'arn:aws:iam::861051536435:root',
      },
      Action: 'kms:*',
      Resource: '*',
    },
    {
      Sid: 'Allow access for Key Administrators',
      Effect: 'Allow',
      Principal: {
        AWS: 'arn:aws:iam::861051536435:user/KMS_Manager',
      },
      Action: [
        'kms:Create*',
        'kms:Describe*',
        'kms:Enable*',
        'kms:List*',
        'kms:Put*',
        'kms:Update*',
        'kms:Revoke*',
        'kms:Disable*',
        'kms:Get*',
        'kms:Delete*',
        'kms:TagResource',
        'kms:UntagResource',
        'kms:ScheduleKeyDeletion',
        'kms:CancelKeyDeletion',
      ],
      Resource: '*',
    },
    {
      Sid: 'Allow use of the key',
      Effect: 'Allow',
      Principal: {
        AWS: 'arn:aws:iam::861051536435:user/KMS_Manager',
      },
      Action: [
        'kms:DescribeKey',
        'kms:GetPublicKey',
        'kms:Sign',
        'kms:Verify',
      ],
      Resource: '*',
    },
    {
      Sid: 'Allow attachment of persistent resources',
      Effect: 'Allow',
      Principal: {
        AWS: 'arn:aws:iam::861051536435:user/KMS_Manager',
      },
      Action: [
        'kms:CreateGrant',
        'kms:ListGrants',
        'kms:RevokeGrant',
      ],
      Resource: '*',
      Condition: {
        Bool: {
          'kms:GrantIsForAWSResource': 'true',
        },
      },
    },
  ],
});

module.exports = {
  keyPolicy, secp256k1N,
};
