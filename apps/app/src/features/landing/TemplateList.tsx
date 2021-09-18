import React from 'react';
import 'twin.macro';
import { ReactIcon } from './ReactIcon';
import { ReactTSIcon } from './ReactTSIcon';
import { TemplateItem } from './TemplateItem';

const templates = [
  {
    id: 'react-js',
    icon: <ReactIcon />,
    name: 'React',
  },
  {
    id: 'react-ts',
    icon: <ReactTSIcon />,
    name: 'React Typescript',
  },
];

export function TemplateList() {
  return (
    <div tw="bg-gray-800 py-10  pb-20">
      <h2 tw="text-center mt-4 text-3xl tracking-tight font-extrabold text-white sm:mt-5 sm:text-5xl lg:mt-6 xl:text-5xl  ">
        Available templates
      </h2>

      <ul role="list" tw="divide-y  divide-gray-700  max-w-md m-auto mt-20">
        {templates.map(item => (
          <TemplateItem key={item.id} {...item} />
        ))}
      </ul>
    </div>
  );
}
