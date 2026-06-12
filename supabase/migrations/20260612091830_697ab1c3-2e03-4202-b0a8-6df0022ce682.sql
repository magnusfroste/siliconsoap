INSERT INTO public.quick_prompts (topic, scenario_id, sort_order, is_enabled)
VALUES
  ('Should AI companies be liable when chatbots cause real-world harm?', 'general-problem', floor(random() * 1000), true),
  ('Should autonomous AI weapons ever be allowed on the battlefield?', 'ethical-dilemma', floor(random() * 1000), true),
  ('Will millions of interacting AI agents create chaos or harmony?', 'future-prediction', floor(random() * 1000), true),
  ('Is it ethical to let teens form emotional bonds with AI companions?', 'ethical-dilemma', floor(random() * 1000), true),
  ('Should deepfakes of politicians be criminalized worldwide?', 'ethical-dilemma', floor(random() * 1000), true),
  ('Will any country grant legal personhood to an AI before 2030?', 'future-prediction', floor(random() * 1000), true),
  ('Will the EU AI Act become the de facto global standard?', 'future-prediction', floor(random() * 1000), true),
  ('Are AI data centers worth their massive water and energy cost?', 'general-problem', floor(random() * 1000), true),
  ('Should AI-generated content be legally required to carry a watermark?', 'general-problem', floor(random() * 1000), true);

UPDATE public.quick_prompts
SET sort_order = floor(random() * 1000)
WHERE sort_order < 100;