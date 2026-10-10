export const buildCampaignPlan = ({ niches, tone, format }) => {
  return {
    niches: niches || ['tech', 'lifestyle'],
    tone: tone || 'professional',
    format: format || 'vertical',
    steps: [
      'Generate hook scene',
      'Create title cards',
      'Render voice-over narration',
      'Publish to selected channel',
      'Track performance metrics'
    ]
  };
};
