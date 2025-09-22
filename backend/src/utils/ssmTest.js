const {
  SSMClient,
  GetParameterCommand
} = require('@aws-sdk/client-ssm')
const client = new SSMClient({ region: 'ap-southeast-2' })

const run = async () => {
  const command = new GetParameterCommand({
    Name: '/n12119831/ssm_parameter',
  })
  const response = await client.send(command)
  console.log('Parameter value:', response.Parameter.Value)
}

run()
