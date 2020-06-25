export const getRole = (roles: Array<string>): string => {
  if (roles.includes(`ADMIN`)) {
    return `ADMIN`;
  } else if (roles.includes(`HCW`)) {
    return `Healthcare Worker`;
  } else if (roles.includes(`CHO`)) {
    return `CHO`;
  } else if (roles.includes(`VHT`)) {
    return `VHT`;
  }
  return ``;
};

type RoutesNames = { [key: string]: string };
export const routesNames: RoutesNames = {
  newreading: 'Reading',
  patients: 'Patients',
  admin: 'Admin',
  help: 'Help',
  signup: 'Signup',
  referrals: 'Referrals',
  resources: 'Resources',
  [`chat/landing`]: 'Chat',
};
