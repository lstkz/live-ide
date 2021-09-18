import * as React from 'react';
import { SectionShape } from './SectionShape';
import img from './assets/main-image.png';
import { GitHubButton } from 'src/components/GitHubButton';
import tw from 'twin.macro';

export function MainBanner() {
  return (
    <div tw="relative bg-gray-900">
      <div tw="relative bg-gray-900 text-white mx-auto max-w-7xl lg:px-8 pt-10  sm:pt-16 lg:pt-8 lg:pb-14 lg:overflow-hidden">
        <div tw="lg:grid lg:grid-cols-2 lg:gap-8">
          <div tw="mx-auto max-w-md px-4 sm:max-w-2xl sm:px-6 sm:text-center lg:px-0 lg:text-left lg:flex lg:items-center">
            <div tw="lg:py-24">
              <h1 tw="text-center sm:text-left mt-4 text-4xl tracking-tight font-extrabold text-white sm:mt-5 sm:text-6xl lg:mt-6 xl:text-6xl">
                <span tw="block from-red-200 to-yellow-400 bg-gradient-to-r bg-clip-text text-transparent ">
                  LIVE IDE
                </span>
                <span tw="pb-3 block bg-clip-text text-transparent bg-gradient-to-r from-red-200 to-yellow-400 sm:pb-5">
                  with collaboration
                </span>
              </h1>
              <div tw="text-base text-gray-300 sm:text-xl lg:text-lg xl:text-xl">
                <ul tw="text-left lg:list-disc">
                  <li>No registration required.</li>
                  <li>Share IDE by copying the link.</li>
                  <li>Live Preview.</li>
                  <li>VSCode in the browser.</li>
                  <li>Add any NPM dependency.</li>
                  <li>Free & Open-Source.</li>
                </ul>
              </div>
              <div tw="flex items-center justify-center pt-4">
                <GitHubButton />
              </div>
            </div>
          </div>
          <div tw="mt-12 -mb-3 lg:relative">
            <div tw="mx-auto max-w-md px-4 sm:max-w-2xl sm:px-6 lg:max-w-none lg:px-0">
              <img
                tw="w-full lg:absolute lg:inset-y-0 lg:left-0 lg:h-full lg:w-auto lg:max-w-none"
                src={img.src}
                alt=""
              />
            </div>
          </div>
        </div>
      </div>
      <SectionShape position="bottom" twColor={tw`text-gray-800`} />
    </div>
  );
}
