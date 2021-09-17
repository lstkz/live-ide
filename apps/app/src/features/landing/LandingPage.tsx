import React from 'react';
import { MainBanner } from './MainBanner';
import { TemplateList } from './TemplateList';

export function LandingPage() {
  return (
    <div tw="overflow-x-hidden">
      <MainBanner />
      <TemplateList />
      <a
        className="github-fork-ribbon"
        href="https://github.com/lstkz/live-ide"
        data-ribbon="Fork me on GitHub"
        title="Fork me on GitHub"
      >
        Fork me on GitHub
      </a>
    </div>
  );
}
