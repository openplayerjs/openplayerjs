type PlayerConfig = {
  mode: 'responsive' | 'fill';
  width?: string | number;
  height?: string | number;
};

export const defaultConfiguration: PlayerConfig = {
  mode: 'responsive',
};
