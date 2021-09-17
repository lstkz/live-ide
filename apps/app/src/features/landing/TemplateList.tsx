import React from 'react';
import 'twin.macro';
import { ReactIcon } from './ReactIcon';
import { ReactTSIcon } from './ReactTSIcon';

const templates = [
  {
    id: 'todo',
    icon: <ReactIcon />,
    name: 'React',
  },
  {
    id: 'todo',
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
        {templates.map((item, i) => (
          <li key={i}>
            <div tw="block   bg-gray-900 py-3">
              <div tw="px-4 py-4 sm:px-6">
                <div tw="flex items-center justify-between">
                  <div tw="flex items-center space-x-3">
                    <div tw="text-4xl">{item.icon}</div>
                    <p tw="text-xl tracking-tight font-medium text-gray-200 truncate">
                      {item.name}
                    </p>
                  </div>
                  <button tw="inline-flex items-center px-4 py-1 border border-transparent text-base font-medium rounded-md text-gray-700 bg-indigo-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                    Create
                  </button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
