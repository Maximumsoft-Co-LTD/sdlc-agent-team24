/** FR-14 — coin packages for topup tests */
export const coinPackages = [
  {
    id: 'pkg-starter',
    name: 'Starter',
    coins: 100,
    bonus: 10,
    price_thb: 100,
    active: true,
  },
  {
    id: 'pkg-value',
    name: 'Value',
    coins: 500,
    bonus: 75,
    price_thb: 500,
    active: true,
  },
] as const;

export const defaultPackage = coinPackages[0];
