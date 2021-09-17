import * as R from 'remeda';
import { WorkspaceIdentity } from 'shared';

export const identityColors = ['red', 'green', 'blue', 'pink', 'purple'];
export const identityIcons = ['cat', 'crow', 'dog', 'dragon', 'spider', 'dove'];

export function getIdentity(workspaceId: string): WorkspaceIdentity {
  const key = 'identity-' + workspaceId;
  if (sessionStorage[key]) {
    try {
      return JSON.parse(sessionStorage[key]);
    } catch (ignore) {
      //
    }
  }
  const identity: WorkspaceIdentity = {
    color:
      identityColors[Math.floor(Math.random() * 1000) % identityColors.length],
    icon: identityIcons[
      Math.floor(Math.random() * 1000) % identityIcons.length
    ],
    id: R.randomString(30),
    workspaceId: workspaceId,
  };
  sessionStorage[key] = JSON.stringify(identity);
  return identity;
}
