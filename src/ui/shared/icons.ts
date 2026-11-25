// Iconos de línea fina dibujados a mano (sin librerías).
// Cada icono es una lista de trazos SVG sobre una cuadrícula de 24 × 24.
export const icons = {
  edit: ['M4 20h4L19 9l-4-4L4 16v4z', 'M13 7l4 4'],
  download: ['M12 4v11', 'M7 10l5 5 5-5', 'M5 20h14'],
  mail: [
    'M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z',
    'M3 7l9 6 9-6',
  ],
  user: ['M12 4a4 4 0 1 0 0 8a4 4 0 1 0 0-8z', 'M4 20c0-4 4-6 8-6s8 2 8 6'],
  home: ['M3 11l9-7 9 7', 'M5 10v10h14V10'],
  check: ['M5 12l5 5 9-10'],
  arrow: ['M5 12h14', 'M13 6l6 6-6 6'],
  id: [
    'M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z',
    'M7 10h4',
    'M7 14h6',
    'M15 10h2',
  ],
  globe: [
    'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18z',
    'M3 12h18',
    'M12 3c3 3 3 15 0 18',
    'M12 3c-3 3-3 15 0 18',
  ],
  users: [
    'M9 5a3.5 3.5 0 1 0 0 7a3.5 3.5 0 1 0 0-7z',
    'M3 20c0-3.5 2.7-5.5 6-5.5s6 2 6 5.5',
    'M16 5.5a3 3 0 0 1 0 6',
    'M18 14.8c1.8 0.6 3 2.2 3 5.2',
  ],
  alert: ['M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18z', 'M12 7.5v5.5', 'M12 16.5v0.01'],
  search: ['M11 4a7 7 0 1 0 0 14a7 7 0 1 0 0-14z', 'M16 16l4.5 4.5'],
}

export type IconName = keyof typeof icons
