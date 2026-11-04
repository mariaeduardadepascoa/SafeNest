// logo de acrodo com o desgin

import React from 'react';
import OriginalLogo from '../../assets/logoSafeNestescrita.svg';
import { useDesign } from './DesignProvider';
import { Brand } from './UI';

export default function AuthBrand(props) {
  const { prefs } = useDesign();
  return prefs.adapted ? <OriginalLogo {...props} width={200} height={75} style={[props.style, { alignSelf: 'center' }]} accessibilityLabel="SafeNest" /> : <Brand />;
}
