import {
  faCat,
  faCrow,
  faDog,
  faDove,
  faDragon,
  faSpider,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import tw from 'twin.macro';

interface ParticipantIconProps {
  icon: 'cat' | 'crow' | 'dog' | 'dragon' | 'spider' | 'dove';
  color: 'red' | 'green' | 'blue' | 'pink' | 'purple';
}

export function ParticipantIcon(props: ParticipantIconProps) {
  const { icon, color } = props;

  const getIcon = () => {
    switch (icon) {
      case 'cat':
        return faCat;
      case 'crow':
        return faCrow;
      case 'dog':
        return faDog;
      case 'dragon':
        return faDragon;
      case 'spider':
        return faSpider;
      case 'dove':
        return faDove;
    }
  };

  return (
    <div
      css={[
        tw`text-white flex items-center justify-center text-xl w-7 h-7 rounded`,
        color === 'red' && tw`bg-red-600`,
        color === 'green' && tw`bg-green-600`,
        color === 'blue' && tw`bg-blue-600`,
        color === 'pink' && tw`bg-pink-500`,
        color === 'purple' && tw`bg-purple-600`,
      ]}
    >
      <FontAwesomeIcon icon={getIcon()} />
    </div>
  );
}
