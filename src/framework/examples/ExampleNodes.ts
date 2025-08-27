import { NodeBuilder, PortHelpers, PropertyHelpers } from '../sdk/NodeBuilder';
import { nodeRegistry } from '../core/NodeRegistry';

// Example: HTTP Request Node
const httpRequestNode = NodeBuilder
  .create('http-request')
  .withName('HTTP Request')
  .withVersion('1.0.0')
  .withDescription('Make HTTP requests to external APIs')
  .withCategory('http')
  .withAuthor('OpenFlow Team', 'team@openflow.dev')
  .withIcon('🌐')
  .withColor('#10b981')
  .addInput(PortHelpers.input.string('url', 'URL'))
  .addInput(PortHelpers.input.string('method', 'Method', false))
  .addInput(PortHelpers.input.object('headers', 'Headers', false))
  .addInput(PortHelpers.input.any('body', 'Body', false))
  .addOutput(PortHelpers.output.object('response', 'Response'))
  .addOutput(PortHelpers.output.number('status', 'Status Code'))
  .addProperty(PropertyHelpers.select('method', 'HTTP Method', [
    { label: 'GET', value: 'GET' },
    { label: 'POST', value: 'POST' },
    { label: 'PUT', value: 'PUT' },
    { label: 'DELETE', value: 'DELETE' }
  ], 'GET'))
  .addProperty(PropertyHelpers.string('timeout', 'Timeout (ms)', '5000'))
  .addProperty(PropertyHelpers.boolean('followRedirects', 'Follow Redirects', true))
  .withExecutor(async (context) => {
    const { inputs, properties, http } = context;
    
    const url = inputs.url || properties.url;
    const method = inputs.method || properties.method || 'GET';
    const headers = inputs.headers || {};
    const body = inputs.body;
    
    try {
      const response = await http[method.toLowerCase()](url, body, {
        headers,
        timeout: parseInt(properties.timeout || '5000')
      });
      
      return {
        outputs: {
          response: response.data,
          status: response.status
        }
      };
    } catch (error) {
      return {
        outputs: {},
        error: error instanceof Error ? error : new Error(String(error))
      };
    }
  })
  .build();

// Example: Data Transformer Node
const dataTransformerNode = NodeBuilder
  .create('data-transformer')
  .withName('Data Transformer')
  .withVersion('1.0.0')
  .withDescription('Transform data using JavaScript expressions')
  .withCategory('transform')
  .withAuthor('OpenFlow Team')
  .withIcon('🔄')
  .withColor('#8b5cf6')
  .addInput(PortHelpers.input.any('data', 'Input Data'))
  .addOutput(PortHelpers.output.any('result', 'Transformed Data'))
  .addProperty(PropertyHelpers.code('expression', 'Transform Expression', 'return data;'))
  .withExecutor(async (context) => {
    const { inputs, properties, logger } = context;
    
    try {
      // Create a safe execution context
      const transformFunction = new Function('data', 'context', properties.expression);
      const result = transformFunction(inputs.data, context);
      
      logger.info('Data transformed successfully');
      
      return {
        outputs: { result }
      };
    } catch (error) {
      logger.error('Transform error', error);
      return {
        outputs: {},
        error: error instanceof Error ? error : new Error(String(error))
      };
    }
  })
  .build();

// Example: Email Notification Node
const emailNode = NodeBuilder
  .create('email-notification')
  .withName('Email Notification')
  .withVersion('1.0.0')
  .withDescription('Send email notifications')
  .withCategory('notification')
  .withAuthor('OpenFlow Team')
  .withIcon('📧')
  .withColor('#ef4444')
  .addInput(PortHelpers.input.string('to', 'To Address'))
  .addInput(PortHelpers.input.string('subject', 'Subject'))
  .addInput(PortHelpers.input.string('body', 'Body'))
  .addOutput(PortHelpers.output.object('sent', 'Email Sent'))
  .addProperty(PropertyHelpers.string('from', 'From Address'))
  .addProperty(PropertyHelpers.select('priority', 'Priority', [
    { label: 'Low', value: 'low' },
    { label: 'Normal', value: 'normal' },
    { label: 'High', value: 'high' }
  ], 'normal'))
  .requiresCredentials(['smtp'])
  .withExecutor(async (context) => {
    const { inputs, properties, credentials, logger } = context;
    
    // Simulate email sending
    logger.info(`Sending email to ${inputs.to}`);
    
    // In real implementation, use credentials.smtp to send email
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      outputs: { sent: true }
    };
  })
  .build();

// Register example nodes
export function registerExampleNodes() {
  nodeRegistry.register(httpRequestNode);
  nodeRegistry.register(dataTransformerNode);
  nodeRegistry.register(emailNode);
  
  console.log('Example nodes registered');
}