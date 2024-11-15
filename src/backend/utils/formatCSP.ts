export const formatCSP = (csp) => {
  let policyStr = '';
  for (const key in csp) {
    policyStr += `${key} ${csp[key]}; `;
  }
  return policyStr;
};
