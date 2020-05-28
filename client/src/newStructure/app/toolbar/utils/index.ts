export const getRole = (roles: any) => {
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