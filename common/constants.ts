export const BACKEND_CHANNEL_TYPE = Object.freeze({
  SLACK: 'slack',
  EMAIL: 'email',
  CHIME: 'chime',
  MICROSOFT_TEAMS: 'microsoft_teams',
  CUSTOM_WEBHOOK: 'webhook',
  SNS: 'sns',
  MATTERMOST: 'mattermost',
});
export const CHANNEL_TYPE = Object.freeze({
  [BACKEND_CHANNEL_TYPE.SLACK]: 'Slack',
  [BACKEND_CHANNEL_TYPE.EMAIL]: 'Email',
  [BACKEND_CHANNEL_TYPE.CHIME]: 'Chime',
  [BACKEND_CHANNEL_TYPE.MICROSOFT_TEAMS]: 'Microsoft Teams',
  [BACKEND_CHANNEL_TYPE.CUSTOM_WEBHOOK]: 'Custom webhook',
  [BACKEND_CHANNEL_TYPE.SNS]: 'Amazon SNS',
  [BACKEND_CHANNEL_TYPE.MATTERMOST]: 'Mattermost',
}) as {
  slack: string;
  email: string;
  chime: string;
  microsoft_teams: string;
  webhook: string;
  sns: string;
  mattermost: string;
};
