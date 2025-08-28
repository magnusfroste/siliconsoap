# Workflow Builder Plan - Inspirerad av n8n

## Övergripande Vision
Skapa en workflow automation tool inspirerad av n8n som låter användare bygga visuella workflows med drag-and-drop noder, kopplingar och dataflöde.

## Fas 1: Grundläggande Struktur (Steg 1-5)

### Steg 1: Radera befintlig kod och sätt upp projektstruktur
- Radera alla workflow-builder komponenter
- Skapa ny mappstruktur:
  ```
  src/pages/labs/projects/workflow-builder/
  ├── components/
  │   ├── canvas/
  │   ├── nodes/
  │   ├── panels/
  │   └── ui/
  ├── hooks/
  ├── types/
  ├── utils/
  └── constants/
  ```

### Steg 2: Skapa grundläggande typer och konstanter
- Definiera NodeType enum (Trigger, Action, Logic, etc.)
- Skapa WorkflowNode interface
- Definiera ConnectionType
- Färgschema inspirerat av n8n

### Steg 3: Minimal ReactFlow setup
- Skapa WorkflowCanvas med korrekt container sizing
- Implementera grundläggande ReactFlow konfiguration
- Säkerställa att canvas renderas korrekt

### Steg 4: Grundläggande node system
- Skapa BaseNode komponent med n8n-inspirerad design
- Implementera node handles (connection points)
- Grundläggande node styling med ikoner och färger

### Steg 5: Node palette/selector
- Skapa NodePalette komponent för att lista tillgängliga noder
- Implementera drag-and-drop från palette till canvas
- Kategorisering av noder (Triggers, Actions, Logic, etc.)

## Fas 2: Node Typer (Steg 6-10)

### Steg 6: Trigger Nodes
- **Manual Trigger**: Starta workflow manuellt
- **Webhook**: HTTP endpoints för att ta emot data
- **Schedule**: Tidbaserade triggers (cron-liknande)
- **File Watcher**: Övervaka filsystem (simulerad)

### Steg 7: Action Nodes  
- **HTTP Request**: Anropa externa APIs
- **Email**: Skicka email (simulerad)
- **Database**: CRUD operationer (simulerad)
- **AI Chat**: Anropa LLM modeller

### Steg 8: Logic Nodes
- **IF/Switch**: Villkorsstyrd routing
- **Filter**: Filtrera data baserat på kriterier  
- **Set**: Sätta variabler och data transformation
- **Merge**: Sammanslagning av multiple inputs

### Steg 9: Utility Nodes
- **Code**: Custom JavaScript/Python kod execution
- **Delay**: Pausa workflow i specificerad tid
- **Function**: Enkel data transformation
- **Debug**: Logga och debugga data

### Steg 10: Data Nodes
- **JSON**: Arbeta med JSON data
- **CSV**: Hantera CSV filer
- **XML**: XML parsing och transformation
- **DateTime**: Datum/tid operationer

## Fas 3: UI/UX Features (Steg 11-15)

### Steg 11: Node Configuration Panel
- Sidopanel för att konfigurera vald node
- Dynamiska formulär baserat på node typ
- Parameter validation och preview

### Steg 12: Connection System
- Visuella kopplingar mellan noder
- Data type validation vid connections
- Multiple input/output support

### Steg 13: Canvas Controls
- Zoom in/out funktionalitet
- Pan och navigate i stort workflow
- Minimap för översikt
- Fit-to-screen och reset view

### Steg 14: Workflow Management
- Save/Load workflows
- Export/Import funktionalitet
- Workflow templates
- Version hantering (basic)

### Steg 15: Execution Visualization
- Visual feedback under workflow execution
- Progress indicators på noder
- Error states och debugging
- Real-time status updates

## Fas 4: Advanced Features (Steg 16-20)

### Steg 16: Data Flow Visualization
- Visa data som flödar mellan noder
- Data inspector för att se innehåll
- Schema validation och type checking

### Steg 17: Error Handling
- Try/catch mechanismer
- Error routing och fallback paths
- Retry logic och exponential backoff

### Steg 18: Credentials Management
- Säker förvaring av API keys
- OAuth flows (simulerad)
- Environment variables

### Steg 19: Sub-workflows
- Möjlighet att skapa reusable sub-workflows
- Nested workflows
- Workflow som noder

### Steg 20: Performance & Analytics
- Execution metrics och timing
- Performance monitoring
- Usage analytics
- Cost tracking (simulerad)

## Design Principer (Inspirerat av n8n)

### Visual Design
- **Färgschema**: Mörk tema med accent färger för olika node typer
- **Ikoner**: Lucide icons för consistency
- **Typography**: Tydlig hierarki med olika fontstorlekar
- **Spacing**: Generöst whitespace för ren look

### Node Design
- **Form**: Rundade hörn, mjuka skuggor
- **Färger**: 
  - Triggers: Orange/röd
  - Actions: Blå
  - Logic: Grön  
  - Utilities: Grå/lila
- **Status**: Visual feedback för olika states (idle, running, success, error)
- **Ikoner**: Representativa ikoner för varje node typ

### UX Patterns
- **Drag & Drop**: Intuitive node placement
- **Context Menus**: Högerklick för snabba actions
- **Keyboard Shortcuts**: Power user features
- **Progressive Disclosure**: Visa komplexitet endast när behövd

## Teknisk Arkitektur

### State Management
- React Context för global workflow state
- Local state för UI interactions
- Debounced updates för performance

### Data Structures
```typescript
interface WorkflowNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: Record<string, any>;
  inputs: ConnectionPoint[];
  outputs: ConnectionPoint[];
}

interface Workflow {
  id: string;
  name: string;
  nodes: WorkflowNode[];
  connections: Connection[];
  settings: WorkflowSettings;
}
```

### Performance
- Virtualization för stora workflows
- Lazy loading av node components
- Optimized re-renders med React.memo

## Success Metrics
- [ ] Kan skapa en enkel workflow med 3+ noder
- [ ] Noder kan konfigureras och köras
- [ ] Visual feedback fungerar korrekt
- [ ] Workflows kan sparas och laddas
- [ ] Responsive design fungerar på olika skärmstorlekar
- [ ] Error handling fungerar robust
- [ ] Performance är acceptabel med 50+ noder

## Nästa Steg
1. Implementera Fas 1 (Steg 1-5) först
2. Testa och validera varje steg innan fortsättning
3. Iterera baserat på feedback och användbarhet
4. Bygga ut med Fas 2-4 successivt