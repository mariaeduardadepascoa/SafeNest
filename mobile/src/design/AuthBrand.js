// Escolhe o logo de acordo com o visual.

import React from 'react';
import OriginalLogo from '../../assets/logoSafeNestescrita.svg';
import { useVisual } from './DesignProvider';
import { Logo } from './UI';

export default function LogoEntrada(props) {
  const { prefs } = useVisual();
  return prefs.adapted ? <OriginalLogo {...props} width={200} height={75} style={[props.style, { alignSelf: 'center' }]} accessibilityLabel="SafeNest" /> : <Logo />;
}
