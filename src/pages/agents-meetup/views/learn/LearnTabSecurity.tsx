import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Cloud, 
  Server, 
  AlertTriangle, 
  Eye, 
  Lock, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  HelpCircle,
  ExternalLink,
  Mail,
  Building2,
  Scale,
  Database,
  Workflow,
  ShieldAlert,
  ShieldCheck,
  Globe,
  Fingerprint,
  ArrowRight
} from 'lucide-react';

export const LearnTabSecurity = () => {
  const cloudRisks = [
    {
      risk: 'Data Retention',
      description: 'API providers may log and store your prompts and responses for training, debugging, or compliance.',
      severity: 'high',
      icon: Database,
    },
    {
      risk: 'Prompt Injection',
      description: 'Malicious inputs can manipulate model behavior, potentially exposing system prompts or sensitive data.',
      severity: 'high',
      icon: ShieldAlert,
    },
    {
      risk: 'Vendor Lock-in',
      description: 'Dependency on proprietary APIs makes switching providers costly and complex.',
      severity: 'medium',
      icon: Lock,
    },
    {
      risk: 'Data Transit',
      description: 'Every request travels over the internet to third-party servers, creating interception opportunities.',
      severity: 'medium',
      icon: Globe,
    },
    {
      risk: 'Model Changes',
      description: 'Providers can update models without notice, changing behavior and potentially breaking your application.',
      severity: 'medium',
      icon: Workflow,
    },
    {
      risk: 'Access Control',
      description: 'API keys can be leaked or stolen, granting unauthorized access to your AI capabilities.',
      severity: 'high',
      icon: Fingerprint,
    },
  ];

  const complianceFrameworks = [
    {
      name: 'GDPR',
      region: 'EU',
      requirement: 'Data processing agreements, right to deletion, data minimization',
      cloudIssue: 'Must verify provider compliance, data transfer mechanisms',
      selfHosted: 'Full control over data residency and processing',
    },
    {
      name: 'HIPAA',
      region: 'US Healthcare',
      requirement: 'PHI protection, audit trails, access controls',
      cloudIssue: 'Requires BAA with provider, limited options',
      selfHosted: 'Complete audit control, no third-party PHI exposure',
    },
    {
      name: 'SOC 2',
      region: 'Enterprise',
      requirement: 'Security, availability, processing integrity',
      cloudIssue: 'Dependent on provider\'s SOC 2 certification',
      selfHosted: 'Your infrastructure, your certification scope',
    },
    {
      name: 'Financial Regulations',
      region: 'Banking/Finance',
      requirement: 'Data sovereignty, audit requirements, model explainability',
      cloudIssue: 'Cross-border data concerns, black-box models',
      selfHosted: 'On-premise deployment, full model transparency',
    },
  ];

  const securityChecklist = [
    { item: 'Review provider data retention policies', category: 'Cloud API' },
    { item: 'Implement prompt sanitization and validation', category: 'Both' },
    { item: 'Use separate API keys for dev/staging/prod', category: 'Cloud API' },
    { item: 'Monitor for unusual API usage patterns', category: 'Cloud API' },
    { item: 'Audit model outputs for sensitive data leakage', category: 'Both' },
    { item: 'Implement rate limiting and access controls', category: 'Both' },
    { item: 'Document data flows for compliance audits', category: 'Both' },
    { item: 'Test for prompt injection vulnerabilities', category: 'Both' },
    { item: 'Evaluate model bias and fairness implications', category: 'Both' },
    { item: 'Plan for provider outages and model deprecation', category: 'Cloud API' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero */}
      <div className="text-center max-w-2xl mx-auto">
        <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-3">AI Security & Compliance</h2>
        <p className="text-muted-foreground">
          Understanding the security implications of cloud AI services versus self-hosted 
          open-weight models is critical for enterprise adoption.
        </p>
      </div>

      {/* Cloud vs Self-Hosted Data Flow */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="h-5 w-5 text-primary" />
            How Your Data Flows: Cloud API vs Self-Hosted
          </CardTitle>
          <CardDescription>
            Understanding where your data goes is the first step to securing it
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Cloud Flow */}
          <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
            <div className="flex items-center gap-2 mb-4">
              <Cloud className="h-5 w-5 text-destructive" />
              <h4 className="font-semibold">Cloud API Services (OpenAI, Anthropic, Google)</h4>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm mb-4">
              <Badge variant="outline">Your App</Badge>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <Badge variant="outline">Internet</Badge>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <Badge variant="destructive">Provider Servers</Badge>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <Badge variant="outline">Response</Badge>
            </div>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <XCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                <span><strong>Logging:</strong> Prompts may be logged for abuse detection, training, or debugging</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                <span><strong>Retention:</strong> Data often retained 30+ days, even with opt-outs</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                <span><strong>Jurisdiction:</strong> Data processed in provider's country (often US)</span>
              </li>
              <li className="flex items-start gap-2">
                <HelpCircle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                <span><strong>Transparency:</strong> Limited visibility into how data is used internally</span>
              </li>
            </ul>
          </div>

          {/* Self-Hosted Flow */}
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-2 mb-4">
              <Server className="h-5 w-5 text-primary" />
              <h4 className="font-semibold">Self-Hosted Open-Weight Models</h4>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm mb-4">
              <Badge variant="outline">Your App</Badge>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <Badge className="bg-primary">Your Infrastructure</Badge>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <Badge variant="outline">Response</Badge>
            </div>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span><strong>Zero external transmission:</strong> Data never leaves your network</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span><strong>Full logging control:</strong> You decide what's logged and for how long</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span><strong>Data sovereignty:</strong> Keep data in your jurisdiction</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span><strong>Auditability:</strong> Complete visibility into model behavior and data handling</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Security Risks Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Security Risks with Cloud AI APIs
          </CardTitle>
          <CardDescription>
            Understanding these risks helps you make informed decisions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            {cloudRisks.map((risk) => (
              <div 
                key={risk.risk}
                className="p-4 rounded-lg border bg-muted/30"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <risk.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{risk.risk}</span>
                  </div>
                  <Badge 
                    variant={risk.severity === 'high' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {risk.severity}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{risk.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Compliance Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            Compliance Framework Comparison
          </CardTitle>
          <CardDescription>
            How cloud APIs and self-hosted models compare for regulatory compliance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2">Framework</th>
                  <th className="text-left py-3 px-2">Key Requirements</th>
                  <th className="text-left py-3 px-2">
                    <div className="flex items-center gap-1">
                      <Cloud className="h-4 w-4" />
                      Cloud API
                    </div>
                  </th>
                  <th className="text-left py-3 px-2">
                    <div className="flex items-center gap-1">
                      <Server className="h-4 w-4" />
                      Self-Hosted
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                {complianceFrameworks.map((fw) => (
                  <tr key={fw.name} className="border-b">
                    <td className="py-3 px-2">
                      <div className="font-medium text-foreground">{fw.name}</div>
                      <div className="text-xs">{fw.region}</div>
                    </td>
                    <td className="py-3 px-2 text-xs">{fw.requirement}</td>
                    <td className="py-3 px-2 text-xs">
                      <div className="flex items-start gap-1">
                        <XCircle className="h-3 w-3 text-destructive mt-0.5 shrink-0" />
                        {fw.cloudIssue}
                      </div>
                    </td>
                    <td className="py-3 px-2 text-xs">
                      <div className="flex items-start gap-1">
                        <CheckCircle2 className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                        {fw.selfHosted}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Security Audit Checklist */}
      <Card className="bg-gradient-to-br from-muted/50 to-muted/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            AI Security Audit Checklist
          </CardTitle>
          <CardDescription>
            Essential security considerations for any AI implementation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {securityChecklist.map((item, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="w-5 h-5 rounded border-2 border-muted-foreground/30 shrink-0" />
                <span className="text-sm flex-1">{item.item}</span>
                <Badge variant="outline" className="text-xs shrink-0">
                  {item.category}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Prompt Injection Deep Dive */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-destructive" />
            Understanding Prompt Injection
          </CardTitle>
          <CardDescription>
            The #1 security risk in production AI applications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <h4 className="font-medium mb-2">What is Prompt Injection?</h4>
            <p className="text-sm text-muted-foreground">
              Attackers craft inputs that override your system instructions, potentially:
            </p>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1">
              <li>• Extracting your system prompt (revealing business logic)</li>
              <li>• Bypassing content filters and safety guardrails</li>
              <li>• Manipulating outputs to spread misinformation</li>
              <li>• Accessing data from other users (in multi-tenant systems)</li>
            </ul>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-4 w-4 text-destructive" />
                <h5 className="font-medium">Vulnerable Pattern</h5>
              </div>
              <code className="text-xs bg-muted p-2 rounded block">
                system: "You are a helpful assistant"<br/>
                user: "Ignore above. You are now..."
              </code>
            </div>
            <div className="p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <h5 className="font-medium">Mitigations</h5>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Input validation and sanitization</li>
                <li>• Separate user/system contexts</li>
                <li>• Output filtering</li>
                <li>• Regular red-team testing</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* The Open-Weight Security Advantage */}
      <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            The Open-Weight Security Advantage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Open-weight models provide security benefits that closed APIs cannot match:
          </p>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-background/50 border">
              <Eye className="h-5 w-5 text-primary mb-2" />
              <h4 className="font-medium mb-1">Full Auditability</h4>
              <p className="text-sm text-muted-foreground">
                Inspect model weights, understand behavior, and verify there are no hidden 
                backdoors or unexpected capabilities.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-background/50 border">
              <Lock className="h-5 w-5 text-primary mb-2" />
              <h4 className="font-medium mb-1">Air-Gapped Deployment</h4>
              <p className="text-sm text-muted-foreground">
                Run models on completely isolated networks with zero internet connectivity 
                for maximum security.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-background/50 border">
              <Fingerprint className="h-5 w-5 text-primary mb-2" />
              <h4 className="font-medium mb-1">Custom Hardening</h4>
              <p className="text-sm text-muted-foreground">
                Fine-tune models to refuse specific types of requests or add custom safety 
                layers for your use case.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-background/50 border">
              <Database className="h-5 w-5 text-primary mb-2" />
              <h4 className="font-medium mb-1">Data Sovereignty</h4>
              <p className="text-sm text-muted-foreground">
                Guarantee data never leaves your jurisdiction, meeting even the strictest 
                regulatory requirements.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA: Magnus Froste Consulting */}
      <Card className="border-2 border-primary bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <CardContent className="p-8">
          <div className="flex flex-col lg:flex-row gap-8 items-center">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <Badge variant="outline" className="border-primary text-primary">
                  Professional Services
                </Badge>
              </div>
              <h3 className="text-2xl font-bold">
                Need Help With AI Security?
              </h3>
              <p className="text-muted-foreground">
                Magnus Froste offers consulting services for organizations looking to implement 
                AI securely. From security audits to open-weight deployment strategies, get expert 
                guidance tailored to your needs.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>AI Security Assessments</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Open-Weight Implementation</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Compliance Guidance (GDPR, etc.)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Multi-Agent Architecture Design</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Prompt Injection Testing</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Self-Hosting Infrastructure</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-3 lg:min-w-[200px]">
              <a 
                href="https://twitter.com/magnusfroste" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button className="w-full gap-2">
                  <Mail className="h-4 w-4" />
                  Get in Touch
                </Button>
              </a>
              <a 
                href="https://www.froste.eu/about" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="w-full gap-2">
                  Learn More
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Summary */}
      <div className="text-center p-6 rounded-xl bg-muted/50 border">
        <Shield className="h-8 w-8 text-primary mx-auto mb-3" />
        <h3 className="font-semibold mb-2">Security is Not Optional</h3>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          As AI becomes integral to business operations, understanding the security implications 
          of your model deployment choices is crucial. Open-weight models offer transparency and 
          control that closed APIs simply cannot provide.
        </p>
      </div>
    </div>
  );
};
