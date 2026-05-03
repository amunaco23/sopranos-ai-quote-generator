export const CHARACTER_IMAGES: Record<string, string> = {
  'Tony Soprano': '/Tony.png',
  'Christopher Moltisanti': '/Chrissy.png',
  'Uncle Junior': '/Uncle Junior.png',
  'Ralph Cifaretto': '/Ralphie.png',
  'Dr. Jennifer Melfi': '/Dr. Melfi.png',
  'Paulie Gualtieri': '/Paulie.png',
  'Carmine Lupertazzi': '/Carmine.png',
  'Silvio Dante': '/Silvio.png',
  'Phil Leotardo': '/Phil.png',
  'Johnny Sack': '/Johnny Sack.png',
  'Vito Spatafore': '/Vito.png',
  'Livia Soprano': '/Livia Soprano.png',
  'Furio Giunta': '/Furio.png',
  'Artie Bucco': '/Artie.png',
  'AJ Soprano': '/AJ.png',
  'Tony Blundetto': '/Tony B.png',
  'Patsy Parisi': '/Patsy.png',
  'Hesh Rabkin': '/Hesh.png',
  'Big Pussy Bonpensiero': '/Big Pussy.png',
  'Adriana La Cerva': '/Aidriana.png',
  'Richie Aprile': '/Richie.png',
  'Bobby Bacala': '/Bobby.png',
  'Feech La Manna': '/Feech.png',
  'Carmela Soprano': '/Carmela.png',
  'Eugene Pontecorvo': '/Eugene.png',
  'Mikey Palmice': '/Mikey.png',
};

export function getInitials(name: string): string {
  return name
    .replace(/^Dr\.\s*/, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();
}
