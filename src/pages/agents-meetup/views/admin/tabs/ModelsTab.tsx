import { CuratedModelsManager } from '../../components/CuratedModelsManager';

export const ModelsTab = () => {
  return (
    <div className="space-y-4">
      <div className="pb-2">
        <h2 className="text-lg font-semibold">Curated Models</h2>
        <p className="text-sm text-muted-foreground">
          Manage which OpenRouter models are available to users
        </p>
      </div>
      <CuratedModelsManager />
    </div>
  );
};
