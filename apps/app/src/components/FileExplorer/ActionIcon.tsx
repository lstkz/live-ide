import tw, { styled } from 'twin.macro';

export const ActionIcon = styled.button`
  ${tw`focus:outline-none p-0.5 focus:( ring-1 ring-offset-gray-200 )`}
  ${props => !props.disabled && tw`hover:text-gray-200`}
`;
